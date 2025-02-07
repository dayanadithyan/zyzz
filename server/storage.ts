import { 
  workouts, weights, programs, macros,
  type Workout, type Weight, type Program, type Macro,
  type InsertWorkout, type InsertWeight, type InsertProgram, type InsertMacro 
} from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  // Workout methods
  getWorkouts(): Promise<Workout[]>;
  createWorkout(workout: InsertWorkout): Promise<Workout>;

  // Weight methods  
  getWeights(): Promise<Weight[]>;
  createWeight(weight: InsertWeight): Promise<Weight>;

  // Program methods
  getPrograms(): Promise<Program[]>;
  createProgram(program: InsertProgram): Promise<Program>;

  // Macro methods
  getMacros(): Promise<Macro[]>;
  createMacro(macro: InsertMacro): Promise<Macro>;
}

export class DatabaseStorage implements IStorage {
  async getWorkouts(): Promise<Workout[]> {
    const result = await db
      .select()
      .from(workouts)
      .orderBy(desc(workouts.date));
    return result;
  }

  async createWorkout(insertWorkout: InsertWorkout): Promise<Workout> {
    const now = new Date();
    const [workout] = await db
      .insert(workouts)
      .values({
        ...insertWorkout,
        date: now,
        notes: insertWorkout.notes || null,
        programId: null
      })
      .returning();
    return workout;
  }

  async getWeights(): Promise<Weight[]> {
    const result = await db
      .select()
      .from(weights)
      .orderBy(desc(weights.date));
    return result;
  }

  async createWeight(insertWeight: InsertWeight): Promise<Weight> {
    const now = new Date();
    const [weight] = await db
      .insert(weights)
      .values({
        ...insertWeight,
        date: now,
        notes: insertWeight.notes || null
      })
      .returning();
    return weight;
  }

  async getPrograms(): Promise<Program[]> {
    const result = await db
      .select()
      .from(programs)
      .orderBy(desc(programs.createdAt));
    return result;
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const now = new Date();
    const [program] = await db
      .insert(programs)
      .values({
        ...insertProgram,
        description: insertProgram.description || null,
        createdAt: now
      })
      .returning();
    return program;
  }

  async getMacros(): Promise<Macro[]> {
    const result = await db
      .select()
      .from(macros)
      .orderBy(desc(macros.date));
    return result;
  }

  async createMacro(insertMacro: InsertMacro): Promise<Macro> {
    const now = new Date();
    const [macro] = await db
      .insert(macros)
      .values({
        ...insertMacro,
        date: now,
        notes: insertMacro.notes || null
      })
      .returning();
    return macro;
  }
}

export const storage = new DatabaseStorage();