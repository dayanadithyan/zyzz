import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Clock, Dumbbell, RotateCcw } from "lucide-react";
import WorkoutForm from "@/components/WorkoutForm";
import type { Workout } from "@shared/schema";

export default function Workouts() {
  const [open, setOpen] = useState(false);
  const { data: workouts, isLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"]
  });

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workouts</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Log Workout</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Log Workout</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <WorkoutForm onSuccess={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))
        ) : workouts?.length ? (
          workouts.map(workout => (
            <Card key={workout.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{workout.exercise}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(workout.date), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                  </div>
                  <Badge variant={getPhaseVariant(workout.phase)}>
                    {workout.phase}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Main set information */}
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium">{workout.weight} kg</p>
                    <p className="text-sm text-muted-foreground">Weight</p>
                  </div>
                  <div>
                    <p className="font-medium">{workout.reps} reps</p>
                    <p className="text-sm text-muted-foreground">Reps</p>
                  </div>
                  <div>
                    <p className="font-medium">{workout.sets} sets</p>
                    <p className="text-sm text-muted-foreground">Sets</p>
                  </div>
                  <div>
                    <p className="font-medium">RPE {workout.rpe || "-"}</p>
                    <p className="text-sm text-muted-foreground">Intensity</p>
                  </div>
                </div>

                {/* Additional training details */}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  {workout.tempo && (
                    <div className="flex items-center gap-1">
                      <RotateCcw className="w-4 h-4" />
                      <span>Tempo: {workout.tempo}</span>
                    </div>
                  )}
                  {workout.restTime && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      <span>Rest: {workout.restTime}s</span>
                    </div>
                  )}
                  {workout.weekInProgram && (
                    <div className="flex items-center gap-1">
                      <Dumbbell className="w-4 h-4" />
                      <span>Week {workout.weekInProgram}</span>
                    </div>
                  )}
                </div>

                {/* Warmup sets */}
                {workout.warmupSets && workout.warmupSets.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Warmup Sets:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {(workout.warmupSets as any[]).map((set, index) => (
                        <div key={index} className="text-sm text-muted-foreground">
                          Set {index + 1}: {set.weight}kg × {set.reps} reps
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {workout.notes && (
                  <p className="text-sm text-muted-foreground">{workout.notes}</p>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No workouts logged yet</p>
        )}
      </div>
    </div>
  );
}

function getPhaseVariant(phase: string | null | undefined): "default" | "secondary" | "destructive" {
  switch (phase?.toLowerCase()) {
    case "hypertrophy":
      return "default";
    case "strength":
      return "secondary";
    case "power":
      return "destructive";
    default:
      return "default";
  }
}