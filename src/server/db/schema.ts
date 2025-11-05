import { pgTable, text, integer, boolean, timestamp, primaryKey } from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

export const user = pgTable("user", {
	id: text("id").primaryKey(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	emailVerified: boolean("email_verified")
		.default(false)
		.notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	theme: text("theme", { enum: ["light", "dark", "system"] }).default("system"),
	defaultIntervals: text("default_intervals").default("[1,3,7,14,30]"),
	deadlineHour: integer("deadline_hour").default(4).notNull(),
});

export const session = pgTable("session", {
	id: text("id").primaryKey(),
	expiresAt: timestamp("expires_at", { mode: "date", precision: 3, withTimezone: true }).notNull(),
	token: text("token").notNull().unique(),
	createdAt: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
	id: text("id").primaryKey(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", {
		mode: "date", precision: 3, withTimezone: true
	}),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", {
		mode: "date", precision: 3, withTimezone: true
	}),
	scope: text("scope"),
	password: text("password"),
	createdAt: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});

export const verification = pgTable("verification", {
	id: text("id").primaryKey(),
	identifier: text("identifier").notNull(),
	value: text("value").notNull(),
	expiresAt: timestamp("expires_at", { mode: "date", precision: 3, withTimezone: true }).notNull(),
	createdAt: timestamp("created_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { mode: "date", precision: 3, withTimezone: true })
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
});


export const groups = pgTable('groups', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	createdBy: text('created_by').notNull().references(() => user.id),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const groupMembers = pgTable(
	'group_members',
	{
		userId: text('user_id').notNull().references(() => user.id),
		groupId: text('group_id').notNull().references(() => groups.id),
		coins: integer('coins').default(0).notNull(),
		joinedAt: timestamp('joined_at', { mode: 'date', withTimezone: true }).notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.userId, table.groupId] }),
	})
);

export const tasks = pgTable('tasks', {
	id: text('id').primaryKey(),
	groupId: text('group_id').notNull().references(() => groups.id),
	createdBy: text('created_by').notNull().references(() => user.id),
	text: text('text').notNull(),
	description: text('description'),
	type: text('type', { enum: ['learning', 'shop', 'custom'] }).notNull().default('learning'),
	maxRepetitions: integer('max_repetitions').notNull(),
	costCoins: integer('cost_coins').notNull().default(0),
	createdAt: timestamp('created_at', { mode: 'date', withTimezone: true }).notNull(),
});


export const taskIntervals = pgTable(
	'task_intervals',
	{
		taskId: text('task_id').notNull().references(() => tasks.id, { onDelete: 'cascade' }),
		sequenceNumber: integer('sequence_number').notNull(),
		intervalDays: integer('interval_days').notNull(),
	},
	(table) => ({
		pk: primaryKey({ columns: [table.taskId, table.sequenceNumber] }),
	})
);

export const userTasks = pgTable('user_tasks', {
	id: text('id').primaryKey(),
	taskId: text('task_id').notNull().references(() => tasks.id),
	userId: text('user_id').notNull().references(() => user.id),
	groupId: text('group_id').notNull().references(() => groups.id),
	currentRepetition: integer('current_repetition').notNull().default(1),
	nextShowDate: timestamp('next_show_date', { mode: 'date', withTimezone: true }).notNull(),
	lastShownAt: timestamp('last_shown_at', { mode: 'date', withTimezone: true }),
	completedAt: timestamp('completed_at', { mode: 'date', withTimezone: true }),
	status: text('status', { enum: ['pending', 'completed', 'failed'] }).default('pending'),
	assignedAt: timestamp('assigned_at', { mode: 'date', withTimezone: true }).notNull(),
});

export const taskHistory = pgTable('task_history', {
	id: text('id').primaryKey(),
	userTaskId: text('user_task_id').notNull().references(() => userTasks.id),
	action: text('action', { enum: ['shown', 'completed', 'failed'] }).notNull(),
	timestamp: timestamp('timestamp', { mode: 'date', withTimezone: true }).notNull(),
});

// Relations
export const userRelations = relations(user, ({ many }) => ({
	createdGroups: many(groups),
	createdTasks: many(tasks),
	groupMembers: many(groupMembers),
	userTasks: many(userTasks),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
	creator: one(user, { fields: [groups.createdBy], references: [user.id] }),
	members: many(groupMembers),
	tasks: many(tasks),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
	user: one(user, { fields: [groupMembers.userId], references: [user.id] }),
	group: one(groups, { fields: [groupMembers.groupId], references: [groups.id] }),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
	group: one(groups, { fields: [tasks.groupId], references: [groups.id] }),
	creator: one(user, { fields: [tasks.createdBy], references: [user.id] }),
	intervals: many(taskIntervals),
	userTasks: many(userTasks),
}));

export const taskIntervalsRelations = relations(taskIntervals, ({ one }) => ({
	task: one(tasks, { fields: [taskIntervals.taskId], references: [tasks.id] }),
}));

export const userTasksRelations = relations(userTasks, ({ one, many }) => ({
	task: one(tasks, { fields: [userTasks.taskId], references: [tasks.id] }),
	user: one(user, { fields: [userTasks.userId], references: [user.id] }),
	group: one(groups, { fields: [userTasks.groupId], references: [groups.id] }),
	history: many(taskHistory),
}));

export const taskHistoryRelations = relations(taskHistory, ({ one }) => ({
	userTask: one(userTasks, { fields: [taskHistory.userTaskId], references: [userTasks.id] }),
}));

export const pushSubscriptions = pgTable('push_subscriptions', {
	id: text('id').primaryKey(),
	userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
	endpoint: text('endpoint').notNull(),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	createdAt: timestamp('created_at', { mode: 'date', precision: 3, withTimezone: true })
		.defaultNow()
		.notNull(),
});

export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
	user: one(user, { fields: [pushSubscriptions.userId], references: [user.id] }),
}));

