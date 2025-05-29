import { relations } from "drizzle-orm/relations";
import { users, characters, analytics } from "./schema";

export const charactersRelations = relations(characters, ({one}) => ({
	user: one(users, {
		fields: [characters.userId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	characters: many(characters),
	analytics: many(analytics),
}));

export const analyticsRelations = relations(analytics, ({one}) => ({
	user: one(users, {
		fields: [analytics.userId],
		references: [users.id]
	}),
}));