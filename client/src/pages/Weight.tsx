import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import WeightForm from "@/components/WeightForm";
import ProgressChart from "@/components/ProgressChart";
import MacroTracker from "@/components/MacroTracker";
import type { Weight } from "@shared/schema";

export default function Weight() {
  const [open, setOpen] = useState(false);
  const { data: weights, isLoading } = useQuery<Weight[]>({
    queryKey: ["/api/weights"]
  });

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Weight Tracking</h1>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button>Log Weight</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Log Weight</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <WeightForm onSuccess={() => setOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Progress Chart</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : weights?.length ? (
            <ProgressChart data={weights} />
          ) : (
            <p className="text-muted-foreground">No weight entries yet</p>
          )}
        </CardContent>
      </Card>

      <MacroTracker />

      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))
        ) : weights?.length ? (
          weights.map(entry => (
            <Card key={entry.id}>
              <CardHeader>
                <CardTitle>{entry.weight} kg</CardTitle>
              </CardHeader>
              <CardContent>
                {entry.notes && (
                  <p className="text-sm text-muted-foreground mb-2">{entry.notes}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  {format(new Date(entry.date), "MMM d, yyyy 'at' h:mm a")}
                </p>
              </CardContent>
            </Card>
          ))
        ) : (
          <p className="text-center text-muted-foreground">No weight entries logged yet</p>
        )}
      </div>
    </div>
  );
}