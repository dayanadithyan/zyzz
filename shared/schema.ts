import { pgTable, text, serial, integer, timestamp, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  exercise: text("exercise").notNull(),
  weight: real("weight").notNull(),
  reps: integer("reps").notNull(),
  sets: integer("sets").notNull(),
  rpe: integer("rpe"),
  tempo: text("tempo"),
  restTime: integer("rest_time"),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  programId: integer("program_id"),
  phase: text("phase"),
  weekInProgram: integer("week_in_program"),
  warmupSets: jsonb("warmup_sets"),
});

export const weights = pgTable("weights", {
  id: serial("id").primaryKey(),
  weight: real("weight").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
});

export const macros = pgTable("macros", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull().defaultNow(),
  calories: integer("calories").notNull(),
  protein: integer("protein").notNull(),
  carbs: integer("carbs").notNull(),
  fats: integer("fats").notNull(),
  waterIntake: integer("water_intake"), // in ml
  notes: text("notes"),
});

export const programs = pgTable("programs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  exercises: jsonb("exercises").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWorkoutSchema = createInsertSchema(workouts).omit({ 
  id: true
}).extend({
  date: z.date().optional()
});

export const insertWeightSchema = createInsertSchema(weights).omit({ 
  id: true
}).extend({
  date: z.date().optional()
});

export const insertMacroSchema = createInsertSchema(macros).omit({
  id: true
}).extend({
  date: z.date().optional()
});

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
  createdAt: true
});

export type InsertWorkout = z.infer<typeof insertWorkoutSchema>;
export type Workout = typeof workouts.$inferSelect;
export type InsertWeight = z.infer<typeof insertWeightSchema>;
export type Weight = typeof weights.$inferSelect;
export type InsertMacro = z.infer<typeof insertMacroSchema>;
export type Macro = typeof macros.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;
export type Program = typeof programs.$inferSelect;