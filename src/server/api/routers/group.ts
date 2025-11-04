import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { db } from '@/server/db';
import { groups, groupMembers, user } from '@/server/db/schema';
import { TRPCError } from '@trpc/server';

const generateId = (): string => crypto.randomUUID();

export const groupRouter = createTRPCRouter({
	create: protectedProcedure
		.input(
			z.object({
				name: z.string().min(1).max(100),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const newGroup = await db
				.insert(groups)
				.values({
					id: generateId(),
					name: input.name,
					createdBy: userId,
					createdAt: new Date(),
				})
				.returning();

			const group = newGroup[0];
			if (!group) {
				throw new TRPCError({
					code: 'INTERNAL_SERVER_ERROR',
					message: 'Failed to create group',
				});
			}

			await db.insert(groupMembers).values({
				userId,
				groupId: group.id,
				coins: 100,
				joinedAt: new Date(),
			});

			return group;
		}),

	getMyGroups: protectedProcedure.query(async ({ ctx }) => {
		const userId = ctx.session.user.id;

		const myMemberships = await db.query.groupMembers.findMany({
			where: eq(groupMembers.userId, userId),
			with: {
				group: {
					with: {
						creator: true,
						members: {
							with: {
								user: true,
							},
						},
					},
				},
			},
		});

		return myMemberships.map((m) => ({
			...m.group,
			myCoins: m.coins,
			memberCount: m.group.members.length,
		}));
	}),

	getGroupDetails: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.query(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const membership = await db.query.groupMembers.findFirst({
				where: and(
					eq(groupMembers.userId, userId),
					eq(groupMembers.groupId, input.groupId)
				),
			});

			if (!membership) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'You are not a member of this group',
				});
			}

			const group = await db.query.groups.findFirst({
				where: eq(groups.id, input.groupId),
				with: {
					creator: true,
					members: {
						with: {
							user: true,
						},
					},
				},
			});

			if (!group) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Group not found',
				});
			}

			return {
				...group,
				myCoins: membership.coins,
			};
		}),

	inviteMember: protectedProcedure
		.input(
			z.object({
				groupId: z.string(),
				email: z.string().email(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const group = await db.query.groups.findFirst({
				where: eq(groups.id, input.groupId),
			});

			if (!group) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Group not found',
				});
			}

			if (group.createdBy !== userId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only group creator can invite members',
				});
			}

			const invitedUser = await db.query.user.findFirst({
				where: eq(user.email, input.email),
			});

			if (!invitedUser) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'User not found',
				});
			}

			const existingMember = await db.query.groupMembers.findFirst({
				where: and(
					eq(groupMembers.userId, invitedUser.id),
					eq(groupMembers.groupId, input.groupId)
				),
			});

			if (existingMember) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'User is already a member',
				});
			}

			await db.insert(groupMembers).values({
				userId: invitedUser.id,
				groupId: input.groupId,
				coins: 100,
				joinedAt: new Date(),
			});

			return { success: true };
		}),

	leave: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const group = await db.query.groups.findFirst({
				where: eq(groups.id, input.groupId),
			});

			if (!group) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Group not found',
				});
			}

			if (group.createdBy === userId) {
				throw new TRPCError({
					code: 'BAD_REQUEST',
					message: 'Group creator cannot leave. Delete the group instead.',
				});
			}

			await db
				.delete(groupMembers)
				.where(
					and(
						eq(groupMembers.userId, userId),
						eq(groupMembers.groupId, input.groupId)
					)
				);

			return { success: true };
		}),

	delete: protectedProcedure
		.input(z.object({ groupId: z.string() }))
		.mutation(async ({ ctx, input }) => {
			const userId = ctx.session.user.id;

			const group = await db.query.groups.findFirst({
				where: eq(groups.id, input.groupId),
			});

			if (!group) {
				throw new TRPCError({
					code: 'NOT_FOUND',
					message: 'Group not found',
				});
			}

			if (group.createdBy !== userId) {
				throw new TRPCError({
					code: 'FORBIDDEN',
					message: 'Only group creator can delete',
				});
			}

			await db.delete(groups).where(eq(groups.id, input.groupId));

			return { success: true };
		}),
});
