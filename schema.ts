import { pgTable, serial, text, varchar, timestamp, jsonb, uuid, integer, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Tabla de perfiles de usuario
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey(),
  username: varchar('username', { length: 255 }).notNull(),
  profile_photo: text('profile_photo'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Tabla de comentarios
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('userId').notNull().references(() => profiles.id, { onDelete: 'cascade' }),
  comment: text('comment').notNull(),
  web_title: varchar('web_title', { length: 500 }).notNull(),
  current_location: text('current_location').notNull(),
  pathname: varchar('pathname', { length: 500 }),
  coordinates: jsonb('coordinates').$type<[number, number]>().notNull(),
  boundElement: jsonb('boundElement').$type<{
    xPath: string;
    fullXPath: string;
    elementDescriptor: {
      tagName: string;
      id: string;
      className: string;
    };
    percentagePositionInRect: {
      x: number;
      y: number;
    };
    positionInRect: {
      x: number;
      y: number;
    };
    position: {
      x: number;
      y: number;
    };
    screenInfo: {
      screenSize: {
        x: number;
        y: number;
      };
      scrollPosition: number;
    };
    dimensions: {
      width: number;
      height: number;
    };
    originalElement?: {
      originalTagName: string;
      originalId: string;
      originalClassName: string;
    } | null;
  }>().notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

// Relaciones
export const profilesRelations = relations(profiles, ({ many }) => ({
  comments: many(comments)
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  user: one(profiles, {
    fields: [comments.userId],
    references: [profiles.id]
  })
}));

// Tipos inferidos para TypeScript
export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
