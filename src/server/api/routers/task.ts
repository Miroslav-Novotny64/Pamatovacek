// src/server/api/routers/tasks.ts
import { z } from 'zod';
import { eq, and, lte, gt, asc, desc } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import {
	tasks,
	taskIntervals,
	userTasks,
	groupMembers,
} from '@/server/db/schema';
import { TRPCError } from '@trpc/server';

// ===================== INPUT SCHEMAS =====================

const createTaskInput = z.object({
	groupId: z.string(),
	text: z.string().min(1).max(500),
	description: z.string().max(2000).optional(),
	maxRepetitions: z.number().int().min(1).max(100),
	intervals: z.array(z.number().int().min(0)).min(1),
	costCoins: z.number().int().min(0).default(0),
});

const groupIdInput = z.object({ groupId: z.string() });
const userTaskIdInput = z.object({ userTaskId: z.string() });
const buyTaskInput = z.object({
	taskId: z.string(),
	groupId: z.string(),
	assignToUserId: z.string(),
});
const taskIdInput = z.object({ taskId: z.string() });

// ===================== TYPE INFERENCES =====================

type CreateTaskInput = z.infer<typeof createTaskInput>;
type GroupIdInput = z.infer<typeof groupIdInput>;
type UserTaskIdInput = z.infer<typeof userTaskIdInput>;
type BuyTaskInput = z.infer<typeof buyTaskInput>;
type TaskIdInput = z.infer<typeof taskIdInput>;
type GroupMember = typeof groupMembers.$inferSelect;
type TaskSelect = typeof tasks.$inferSelect;

// ===================== HELPERS =====================

const generateId = (): string => crypto.randomUUID();

const getUserId = (ctx: { session: any }): string => {
	const userId = ctx.session?.user?.id;
	if (!userId) {
		throw new TRPCError({
			code: 'UNAUTHORIZED',
			message: 'User not authenticated',
		});
	}
	return userId;
};

const checkGroupMembership = async (
	userId: string,
	groupId: string
): Promise<GroupMember | undefined> => {
	return await db.query.groupMembers.findFirst({
		where: and(
			eq(groupMembers.userId, userId),
			eq(groupMembers.groupId, groupId)
		),
	});
};

const getUserTaskWithTask = async (userTaskId: string) => {
	return await db.query.userTasks.findFirst({
		where: eq(userTasks.id, userTaskId),
		with: { task: true },
	});
};

const getTodaysUserTasks = async (userId: string, groupId: string) => {
	const now = new Date();
	return await db.query.userTasks.findMany({
		where: and(
			eq(userTasks.userId, userId),
			eq(userTasks.groupId, groupId),
			lte(userTasks.nextShowDate, now),
			eq(userTasks.status, 'pending')
		),
		with: {
			task: {
				with: {
					intervals: true,
					creator: true,
				},
			},
		},
		orderBy: asc(userTasks.nextShowDate),
	});
};

const addCoinsToMember = async (
	userId: string,
	groupId: string,
	amount: number
): Promise<void> => {
	const member = await db.query.groupMembers.findFirst({
		where: and(
			eq(groupMembers.userId, userId),
			eq(groupMembers.groupId, groupId)
		),
	});

	if (member) {
		await db
			.update(groupMembers)
			.set({
				coins: member.coins + amount,
			})
			.where(
				and(
					eq(groupMembers.userId, userId),
					eq(groupMembers.groupId, groupId)
				)
			);
	}
};

// ===================== ROUTER =====================

export const tasksRouter = createTRPCRouter({
	createTask: protectedProcedure
		.input(createTaskInput)
		.mutation(async ({ ctx, input }): Promise<TaskSelect> => {
			const userId = getUserId(ctx);

			const member = await checkGroupMembership(userId, input.groupId);
			if (!member) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not a member of this group',
				});
			}

			const taskId = generateId();
			const now = new Date();
			
			const newTaskArray = await db
				.insert(tasks)
				.values({
					id: taskId,
					groupId: input.groupId,
					createdBy: userId,
					text: input.text,
					description: input.description ?? null,
					maxRepetitions: input.maxRepetitions,
					costCoins: input.costCoins,
					createdAt: now,
				})
				.returning();

			const newTask = newTaskArray[0];
			if (!newTask) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create task',
				});
			}

			for (let i = 0; i < input.intervals.length; i++) {
				const intervalDays = input.intervals[i];
				if (intervalDays === undefined) continue;
				
				await db.insert(taskIntervals).values({
					taskId: newTask.id,
					sequenceNumber: i + 1,
					intervalDays,
				});
			}

			// For learning tasks, create userTask instances for all group members
			if (input.costCoins === 0) {
				const members = await db.query.groupMembers.findMany({
					where: eq(groupMembers.groupId, input.groupId),
				});

				// Show task immediately (day 0) so user can see it was created
				const nextShowDate = new Date(now);

				for (const member of members) {
					await db.insert(userTasks).values({
						id: generateId(),
						taskId: newTask.id,
						userId: member.userId,
						groupId: input.groupId,
						currentRepetition: 1,
						nextShowDate,
						assignedAt: now,
					});
				}
			}

			return newTask;
		}),

	getTodaysTasks: protectedProcedure
		.input(groupIdInput)
		.query(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const todaysTasks = await getTodaysUserTasks(userId, input.groupId);

			return todaysTasks.map((ut) => ({
				...ut,
				timesShown: ut.currentRepetition - 1,
				isFromShop: ut.task.costCoins > 0,
			}));
		}),

	getPendingTasks: protectedProcedure
		.input(groupIdInput)
		.query(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			return await db.query.userTasks.findMany({
				where: and(
					eq(userTasks.userId, userId),
					eq(userTasks.groupId, input.groupId),
					eq(userTasks.status, 'pending')
				),
				with: {
					task: {
						with: {
							intervals: true,
							creator: true,
						},
					},
				},
				orderBy: asc(userTasks.nextShowDate),
			});
		}),

	getTaskStats: protectedProcedure
		.input(userTaskIdInput)
		.query(async ({ input }) => {
			const userTask = await getUserTaskWithTask(input.userTaskId);

			if (!userTask) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Task not found',
				});
			}

			return {
				timesShown: userTask.currentRepetition - 1,
				nextShowDate: userTask.nextShowDate,
				currentRepetition: userTask.currentRepetition,
				maxRepetitions: userTask.task.maxRepetitions,
				status: userTask.status,
			};
		}),

	completeTask: protectedProcedure
		.input(userTaskIdInput)
		.mutation(async ({ ctx, input }) => {
			const userId = getUserId(ctx);
			const userTask = await getUserTaskWithTask(input.userTaskId);

			if (!userTask) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Task not found',
				});
			}

			if (userTask.userId !== userId) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You cannot complete this task',
				});
			}

			const nextRepetition = userTask.currentRepetition + 1;
			const isAllRepetitionsCompleted =
				nextRepetition > userTask.task.maxRepetitions;

			if (isAllRepetitionsCompleted) {
				await db
					.update(userTasks)
					.set({
						status: 'completed',
						completedAt: new Date(),
						currentRepetition: nextRepetition,
					})
					.where(eq(userTasks.id, input.userTaskId));
			} else {
				const nextInterval = await db.query.taskIntervals.findFirst({
					where: and(
						eq(taskIntervals.taskId, userTask.taskId),
						eq(taskIntervals.sequenceNumber, nextRepetition)
					),
				});

				if (!nextInterval) {
					throw new TRPCError({
						code: 'INTERNAL_SERVER_ERROR',
						message: 'Interval configuration missing',
					});
				}

				const nextShowDate = new Date();
				nextShowDate.setDate(
					nextShowDate.getDate() + nextInterval.intervalDays
				);

				await db
					.update(userTasks)
					.set({
						currentRepetition: nextRepetition,
						nextShowDate,
						lastShownAt: new Date(),
					})
					.where(eq(userTasks.id, input.userTaskId));
			}

			const COINS_REWARD = 10;
			await addCoinsToMember(
				userId,
				userTask.groupId,
				COINS_REWARD
			);

			return { success: true, coinsEarned: COINS_REWARD };
		}),

	getShop: protectedProcedure
		.input(groupIdInput)
		.query(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const shopTasks = await db.query.tasks.findMany({
				where: and(
					eq(tasks.groupId, input.groupId),
					gt(tasks.costCoins, 0)
				),
				with: {
					creator: true,
					intervals: true,
				},
			});

			const memberCoins = await checkGroupMembership(userId, input.groupId);
			const userCoins = memberCoins?.coins ?? 0;

			return shopTasks.map((task) => ({
				...task,
				canAfford: userCoins >= task.costCoins,
				userCoins,
			}));
		}),

	buyTask: protectedProcedure
		.input(buyTaskInput)
		.mutation(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const memberCheck = await checkGroupMembership(userId, input.groupId);
			if (!memberCheck) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not a member of this group',
				});
			}

			const task = await db.query.tasks.findFirst({
				where: eq(tasks.id, input.taskId),
			});

			if (!task) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Task not found',
				});
			}

			// task.costCoins je vždy non-null z databáze (má default(0))
			if (task.costCoins === 0) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'This task is not for sale',
				});
			}

			if (memberCheck.coins < task.costCoins) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Insufficient coins',
				});
			}

			await db
				.update(groupMembers)
				.set({
					coins: memberCheck.coins - task.costCoins,
				})
				.where(
					and(
						eq(groupMembers.userId, userId),
						eq(groupMembers.groupId, input.groupId)
					)
				);

			const userTaskArray = await db
				.insert(userTasks)
				.values({
					id: generateId(),
					taskId: input.taskId,
					userId: input.assignToUserId,
					groupId: input.groupId,
					currentRepetition: 1,
					nextShowDate: new Date(),
					assignedAt: new Date(),
				})
				.returning();

			const userTask = userTaskArray[0];
			if (!userTask) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create user task',
				});
			}

			return {
				success: true,
				userTaskId: userTask.id,
				costCoins: task.costCoins,
			};
		}),

	getGroupTasks: protectedProcedure
		.input(groupIdInput)
		.query(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const memberCheck = await checkGroupMembership(userId, input.groupId);
			if (!memberCheck) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not a member of this group',
				});
			}

			return await db.query.tasks.findMany({
				where: eq(tasks.groupId, input.groupId),
				with: {
					creator: true,
					intervals: true,
					userTasks: true,
				},
				orderBy: desc(tasks.createdAt),
			});
		}),

	deleteTask: protectedProcedure
		.input(taskIdInput)
		.mutation(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const task = await db.query.tasks.findFirst({
				where: eq(tasks.id, input.taskId),
			});

			if (!task) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Task not found',
				});
			}

			if (task.createdBy !== userId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only creator can delete this task',
				});
			}

			await db.delete(tasks).where(eq(tasks.id, input.taskId));

			return { success: true };
		}),

	getUserTaskDetails: protectedProcedure
		.input(userTaskIdInput)
		.query(async ({ ctx, input }) => {
			const userId = getUserId(ctx);

			const userTask = await db.query.userTasks.findFirst({
				where: eq(userTasks.id, input.userTaskId),
				with: {
					task: {
						with: {
							intervals: {
								orderBy: asc(taskIntervals.sequenceNumber),
							},
							creator: true,
						},
					},
				},
			});

			if (!userTask) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Task not found',
				});
			}

			if (userTask.userId !== userId) {
				throw new TRPCError({
					code: 'UNAUTHORIZED',
					message: 'You cannot view this task',
				});
			}

			return userTask;
		}),

	checkExpiredTasks: protectedProcedure.mutation(async ({ ctx }) => {
		const userId = getUserId(ctx);

		const DEADLINE_HOUR = 4;
		const now = new Date();
		const deadline = new Date(now);
		deadline.setHours(DEADLINE_HOUR, 0, 0, 0);

		if (now.getHours() < DEADLINE_HOUR) {
			deadline.setDate(deadline.getDate() - 1);
		}

		const expiredTasks = await db.query.userTasks.findMany({
			where: and(
				lte(userTasks.nextShowDate, deadline),
				eq(userTasks.status, 'pending')
			),
			with: { task: true },
		});

		let failedCount = 0;

		for (const ut of expiredTasks) {
			if (!ut.task) {
				continue;
			}

			await db
				.update(userTasks)
				.set({ status: 'failed' })
				.where(eq(userTasks.id, ut.id));

			const COINS_PENALTY = 10;
			await addCoinsToMember(
				ut.task.createdBy,
				ut.groupId,
				COINS_PENALTY
			);

			failedCount++;
		}

		return { failedCount, processedAt: new Date() };
	}),
});