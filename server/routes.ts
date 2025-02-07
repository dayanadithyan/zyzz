import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertWorkoutSchema, insertWeightSchema, insertProgramSchema, insertMacroSchema } from "@shared/schema";
import { analyzeProgress } from "./services/aiAnalysis";

export function registerRoutes(app: Express) {
  // Workout routes
  app.get("/api/workouts", async (req, res) => {
    const workouts = await storage.getWorkouts();
    res.json(workouts);
  });

  app.post("/api/workouts", async (req, res) => {
    try {
      const parsed = insertWorkoutSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const workout = await storage.createWorkout(parsed);
      res.json(workout);
    } catch (error) {
      res.status(400).json({ error: "Invalid workout data" });
    }
  });

  // Weight routes
  app.get("/api/weights", async (req, res) => {
    const weights = await storage.getWeights();
    res.json(weights);
  });

  app.post("/api/weights", async (req, res) => {
    try {
      const parsed = insertWeightSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const weight = await storage.createWeight(parsed);
      res.json(weight);
    } catch (error) {
      res.status(400).json({ error: "Invalid weight data" });
    }
  });

  // Program routes
  app.get("/api/programs", async (req, res) => {
    const programs = await storage.getPrograms();
    res.json(programs);
  });

  app.post("/api/programs", async (req, res) => {
    try {
      const parsed = insertProgramSchema.parse(req.body);
      const program = await storage.createProgram(parsed);
      res.json(program);
    } catch (error) {
      res.status(400).json({ error: "Invalid program data" });
    }
  });

  // Macro routes
  app.get("/api/macros", async (req, res) => {
    const macros = await storage.getMacros();
    res.json(macros);
  });

  app.post("/api/macros", async (req, res) => {
    try {
      const parsed = insertMacroSchema.parse({
        ...req.body,
        date: new Date(req.body.date)
      });
      const macro = await storage.createMacro(parsed);
      res.json(macro);
    } catch (error) {
      res.status(400).json({ error: "Invalid macro data" });
    }
  });

  // AI Analysis route
  app.get("/api/analysis", async (req, res) => {
    try {
      const workouts = await storage.getWorkouts();
      const weights = await storage.getWeights();
      const macros = await storage.getMacros();
      const exerciseType = req.query.exercise as string | undefined;

      const insight = await analyzeProgress(workouts, weights, macros, exerciseType);
      res.json(insight);
    } catch (error) {
      res.status(500).json({ 
        message: "Failed to generate insights",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  return createServer(app);
}