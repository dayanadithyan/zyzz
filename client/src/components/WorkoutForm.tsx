import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertWorkoutSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useOfflineSync } from "@/hooks/useOfflineSync";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const COMMON_EXERCISES = [
  "Bench Press",
  "Squat",
  "Deadlift",
  "Shoulder Press",
  "Bent Over Row",
  "Pull-up",
  "Push-up",
  "Bicep Curl",
  "Tricep Extension",
  "Leg Press"
];

const TRAINING_PHASES = [
  "Hypertrophy",
  "Strength",
  "Power",
  "Endurance",
  "Deload"
];

interface WarmupSet {
  weight: number;
  reps: number;
}

export default function WorkoutForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useOfflineSync();
  const [warmupSets, setWarmupSets] = useState([{ weight: 0, reps: 0 }]);

  const form = useForm({
    resolver: zodResolver(insertWorkoutSchema),
    defaultValues: {
      exercise: "",
      weight: 0,
      reps: 0,
      sets: 0,
      rpe: 7,
      tempo: "2-0-2",
      restTime: 90,
      notes: "",
      phase: "Hypertrophy",
      weekInProgram: 1,
      warmupSets: [],
      date: new Date()
    }
  });

  const addWarmupSet = () => {
    setWarmupSets([...warmupSets, { weight: 0, reps: 0 }]);
  };

  async function onSubmit(data: any) {
    const formData = {
      ...data,
      date: data.date.toISOString(),
      warmupSets: warmupSets.filter(set => set.weight > 0 && set.reps > 0)
    };

    try {
      if (isOnline) {
        await apiRequest("POST", "/api/workouts", formData);
        queryClient.invalidateQueries({ queryKey: ["/api/workouts"] });
      } else {
        addToSyncQueue("/api/workouts", "POST", formData);
        const localWorkouts = JSON.parse(localStorage.getItem('workouts') || '[]');
        localStorage.setItem('workouts', JSON.stringify([
          { ...formData, id: Date.now() },
          ...localWorkouts
        ]));
      }

      toast({ 
        title: isOnline ? "Workout logged successfully" : "Workout saved offline",
        description: !isOnline ? "Will sync when connection is restored" : undefined
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Error logging workout", 
        variant: "destructive"
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                  />
                </PopoverContent>
              </Popover>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="exercise"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Exercise</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select exercise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {COMMON_EXERCISES.map((exercise) => (
                    <SelectItem key={exercise} value={exercise}>
                      {exercise}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phase"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Phase</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select phase" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {TRAINING_PHASES.map((phase) => (
                    <SelectItem key={phase} value={phase}>
                      {phase}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="weekInProgram"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Week</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rpe"
            render={({ field }) => (
              <FormItem>
                <FormLabel>RPE</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="1"
                    max="10"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
                <FormDescription>Rate of Perceived Exertion (1-10)</FormDescription>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(parseFloat(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="reps"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Reps</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sets</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <FormField
            control={form.control}
            name="tempo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    placeholder="e.g., 3-1-3"
                    className="h-9"
                  />
                </FormControl>
                <FormDescription>Eccentric-Pause-Concentric</FormDescription>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="restTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rest (sec)</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    {...field}
                    onChange={e => field.onChange(parseInt(e.target.value))}
                    className="h-9"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Warmup Sets</FormLabel>
            <Button type="button" variant="outline" size="sm" onClick={addWarmupSet}>
              Add Set
            </Button>
          </div>
          {warmupSets.map((set, index) => (
            <div key={index} className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder="Weight"
                value={set.weight}
                onChange={(e) => {
                  const newSets = [...warmupSets];
                  newSets[index].weight = parseFloat(e.target.value);
                  setWarmupSets(newSets);
                }}
                className="h-9"
              />
              <Input
                type="number"
                placeholder="Reps"
                value={set.reps}
                onChange={(e) => {
                  const newSets = [...warmupSets];
                  newSets[index].reps = parseInt(e.target.value);
                  setWarmupSets(newSets);
                }}
                className="h-9"
              />
            </div>
          ))}
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} className="h-20" />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Log Workout {!isOnline && "(Offline)"}
        </Button>
      </form>
    </Form>
  );
}