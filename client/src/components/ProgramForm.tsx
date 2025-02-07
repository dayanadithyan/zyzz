import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProgramSchema } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useOfflineSync } from "@/hooks/useOfflineSync";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
}

export default function ProgramForm({ onSuccess }: { onSuccess?: () => void }) {
  const { toast } = useToast();
  const { isOnline, addToSyncQueue } = useOfflineSync();

  const form = useForm({
    resolver: zodResolver(insertProgramSchema),
    defaultValues: {
      name: "",
      description: "",
      exercises: []
    }
  });

  const [exercises, setExercises] = useState<Exercise[]>([{ name: "", sets: 0, reps: 0 }]);

  const addExercise = () => {
    setExercises([...exercises, { name: "", sets: 0, reps: 0 }]);
  };

  async function onSubmit(data: any) {
    const formData = {
      ...data,
      exercises: exercises.filter(e => e.name)
    };

    try {
      if (isOnline) {
        await apiRequest("POST", "/api/programs", formData);
        queryClient.invalidateQueries({ queryKey: ["/api/programs"] });
      } else {
        addToSyncQueue("/api/programs", "POST", formData);
        const localPrograms = JSON.parse(localStorage.getItem('programs') || '[]');
        localStorage.setItem('programs', JSON.stringify([
          { ...formData, id: Date.now(), createdAt: new Date() },
          ...localPrograms
        ]));
      }

      toast({ 
        title: isOnline ? "Program created successfully" : "Program saved offline",
        description: !isOnline ? "Will sync when connection is restored" : undefined
      });

      form.reset();
      onSuccess?.();
    } catch (error) {
      toast({ 
        title: "Error creating program", 
        variant: "destructive"
      });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Program Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium">Exercises</h3>
            <Button type="button" variant="outline" size="sm" onClick={addExercise}>
              Add Exercise
            </Button>
          </div>

          {exercises.map((exercise, index) => (
            <div key={index} className="space-y-2">
              <Input
                placeholder="Exercise name"
                value={exercise.name}
                onChange={(e) => {
                  const newExercises = [...exercises];
                  newExercises[index].name = e.target.value;
                  setExercises(newExercises);
                }}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Sets"
                  value={exercise.sets}
                  onChange={(e) => {
                    const newExercises = [...exercises];
                    newExercises[index].sets = parseInt(e.target.value);
                    setExercises(newExercises);
                  }}
                />
                <Input
                  type="number"
                  placeholder="Reps"
                  value={exercise.reps}
                  onChange={(e) => {
                    const newExercises = [...exercises];
                    newExercises[index].reps = parseInt(e.target.value);
                    setExercises(newExercises);
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <Button type="submit" className="w-full">
          Create Program {!isOnline && "(Offline)"}
        </Button>
      </form>
    </Form>
  );
}