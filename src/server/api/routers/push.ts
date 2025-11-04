import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { pushSubscriptions } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';
import webPush from 'web-push';

const generateId = (): string => crypto.randomUUID();

// Configure web-push with VAPID keys
// Generate keys with: npx web-push generate-vapid-keys
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidPublicKey && vapidPrivateKey) {
	webPush.setVapidDetails(
		'mailto:your-email@example.com',
		vapidPublicKey,
		vapidPrivateKey
	);
}

export const pushRouter = createTRPCRouter({
	subscribe: protectedProcedure
		.input(
			z.object({
				endpoint: z.string(),
				p256dh: z.string(),
				auth: z.string(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			// Check if subscription already exists
			const existing = await db.query.pushSubscriptions.findFirst({
				where: eq(pushSubscriptions.endpoint, input.endpoint),
			});

			if (existing) {
				return { success: true, subscriptionId: existing.id };
			}

			// Create new subscription
			const result = await db
				.insert(pushSubscriptions)
				.values({
					id: generateId(),
					userId,
					endpoint: input.endpoint,
					p256dh: input.p256dh,
					auth: input.auth,
					createdAt: new Date(),
				})
				.returning();

			return { success: true, subscriptionId: result[0]?.id };
		}),

	unsubscribe: protectedProcedure
		.input(z.object({ endpoint: z.string() }))
		.mutation(async ({ ctx, input }) => {
			await db
				.delete(pushSubscriptions)
				.where(eq(pushSubscriptions.endpoint, input.endpoint));

			return { success: true };
		}),

	getSubscription: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const subscription = await db.query.pushSubscriptions.findFirst({
			where: eq(pushSubscriptions.userId, userId),
		});

		return subscription;
	}),

	sendTestNotification: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const subscriptions = await db.query.pushSubscriptions.findMany({
			where: eq(pushSubscriptions.userId, userId),
		});

		if (subscriptions.length === 0) {
			throw new TRPCError({
				code: 'NOT_FOUND',
				message: 'No push subscriptions found',
			});
		}

		const payload = JSON.stringify({
			title: '🐝 Pamatováček Test',
			body: 'Your notifications are working! You\'ll receive task reminders at 8 AM. 🍯',
			url: '/dashboard',
		});

		const results = await Promise.allSettled(
			subscriptions.map((sub) =>
				webPush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					payload
				)
			)
		);

		const successful = results.filter((r) => r.status === 'fulfilled').length;

		return { success: true, sent: successful, total: subscriptions.length };
	}),
});

// Function to send daily task notifications (to be called by cron job)
export async function sendDailyTaskNotifications() {
	try {
		// Get all users with tasks due today
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const tomorrow = new Date(today);
		tomorrow.setDate(tomorrow.getDate() + 1);

		const userTasksQuery = await db.query.userTasks.findMany({
			where: (userTasks, { and, lte, gte, eq }) =>
				and(
					gte(userTasks.nextShowDate, today),
					lte(userTasks.nextShowDate, tomorrow),
					eq(userTasks.status, 'pending')
				),
			with: {
				task: true,
				user: true,
			},
		});

		// Group by user
		const tasksByUser = new Map<string, typeof userTasksQuery>();
		for (const userTask of userTasksQuery) {
			const existing = tasksByUser.get(userTask.userId) || [];
			existing.push(userTask);
			tasksByUser.set(userTask.userId, existing);
		}

		// Send notification for each user's tasks
		for (const [userId, tasks] of tasksByUser) {
			const subscriptions = await db.query.pushSubscriptions.findMany({
				where: eq(pushSubscriptions.userId, userId),
			});

			if (subscriptions.length === 0) continue;

			// Send individual notification for each task
			for (const userTask of tasks) {
				const isShop = userTask.task.costCoins > 0;
				const emoji = isShop ? '🛒' : '📚';

				const payload = JSON.stringify({
					title: `${emoji} ${userTask.task.text}`,
					body: `Due today! Complete to earn 10 🍯 coins`,
					url: `/group/${userTask.groupId}`,
					tag: `task-${userTask.id}`,
					taskId: userTask.id,
				});

				for (const sub of subscriptions) {
					try {
						await webPush.sendNotification(
							{
								endpoint: sub.endpoint,
								keys: {
									p256dh: sub.p256dh,
									auth: sub.auth,
								},
							},
							payload
						);
					} catch (error) {
						console.error('Failed to send notification:', error);
						// If subscription is invalid, remove it
						if ((error as any).statusCode === 410) {
							await db
								.delete(pushSubscriptions)
								.where(eq(pushSubscriptions.id, sub.id));
						}
					}
				}
			}
		}

		console.log(`Sent notifications for ${tasksByUser.size} users`);
		return { success: true, usersNotified: tasksByUser.size };
	} catch (error) {
		console.error('Error sending daily notifications:', error);
		throw error;
	}
}
