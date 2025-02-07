import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProgramForm from "@/components/ProgramForm";
import type { Program } from "@shared/schema";

export default function Programs() {
  const [open, setOpen] = useState(false);
  const { data: programs, isLoading } = useQuery<Program[]>({
    queryKey: ["/api/programs"]
  });

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Workout Programs</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Create Program</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Create Workout Program</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <ProgramForm onSuccess={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))
        ) : programs?.length ? (
          programs.map(program => (
            <Card key={program.id}>
              <CardHeader>
                <CardTitle>{program.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {program.description}
                </p>
                <div className="space-y-2">
                  {program.exercises.map((exercise: any, index: number) => (
                    <div key={index} className="text-sm">
                      • {exercise.name}: {exercise.sets} sets × {exercise.reps} reps
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No programs created yet</p>
        )}
      </div>
    </div>
  );
}
