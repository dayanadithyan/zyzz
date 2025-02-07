import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ProgressChart from "@/components/ProgressChart";
import ProgressInsights from "@/components/ProgressInsights";
import type { Weight, Workout } from "@shared/schema";

export default function Dashboard() {
  const { data: weights, isLoading: weightsLoading } = useQuery<Weight[]>({
    queryKey: ["/api/weights"]
  });

  const { data: workouts, isLoading: workoutsLoading } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"]
  });

  const lastWeight = weights?.[0];
  const lastWorkout = workouts?.[0];

  return (
    <div className="container max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      <div className="grid gap-4">
        <ProgressInsights />
        <Card>
          <CardHeader>
            <CardTitle>Weight Progress</CardTitle>
          </CardHeader>
          <CardContent>
            {weightsLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : weights?.length ? (
              <ProgressChart data={weights} />
            ) : (
              <p className="text-muted-foreground">No weight entries yet</p>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latest Weight</CardTitle>
            </CardHeader>
            <CardContent>
              {weightsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : lastWeight ? (
                <div>
                  <p className="text-2xl font-bold">{lastWeight.weight} kg</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lastWeight.date), "MMM d, yyyy")}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No entries</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Latest Workout</CardTitle>
            </CardHeader>
            <CardContent>
              {workoutsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : lastWorkout ? (
                <div>
                  <p className="text-lg font-bold">{lastWorkout.exercise}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(lastWorkout.date), "MMM d, yyyy")}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">No entries</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}