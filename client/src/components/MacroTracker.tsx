import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DropletIcon, FlameIcon, Pizza as PizzaIcon, EggIcon } from "lucide-react";
import MacroForm from "./MacroForm";
import type { Macro } from "@shared/schema";

export default function MacroTracker() {
  const { data: macros, isLoading: macrosLoading } = useQuery<Macro[]>({
    queryKey: ["/api/macros"]
  });

  const { data: insights, isLoading: insightsLoading } = useQuery<{
    analysis: string;
    recommendations: string[];
    macroAdjustments?: {
      calories?: number;
      protein?: number;
      carbs?: number;
      fats?: number;
    };
  }>({
    queryKey: ["/api/analysis"],
    enabled: !!macros?.length,
  });

  const latestMacros = useMemo(() => macros?.[0], [macros]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Nutrition Tracking</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button>Log Macros</Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Log Daily Macros</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <MacroForm />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Current Macros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Today's Nutrition
            {latestMacros && (
              <span className="text-sm font-normal text-muted-foreground">
                {format(new Date(latestMacros.date), "MMM d, yyyy 'at' h:mm a")}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {macrosLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-20" />
              ))}
            </div>
          ) : latestMacros ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <FlameIcon className="w-5 h-5 text-orange-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Calories</p>
                  <p className="text-xl font-bold">{latestMacros.calories}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <EggIcon className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Protein</p>
                  <p className="text-xl font-bold">{latestMacros.protein}g</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <PizzaIcon className="w-5 h-5 text-amber-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Carbs</p>
                  <p className="text-xl font-bold">{latestMacros.carbs}g</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <DropletIcon className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Water</p>
                  <p className="text-xl font-bold">{latestMacros.waterIntake}ml</p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground">No macros logged today</p>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Nutrition Insights</CardTitle>
        </CardHeader>
        <CardContent>
          {insightsLoading ? (
            <Skeleton className="h-32" />
          ) : insights ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">{insights.analysis}</p>

              {insights.macroAdjustments && (
                <div className="space-y-2">
                  <p className="font-medium">Recommended Adjustments:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {insights.macroAdjustments.calories && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Calories</p>
                        <p className="font-medium">{insights.macroAdjustments.calories}</p>
                      </div>
                    )}
                    {insights.macroAdjustments.protein && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Protein</p>
                        <p className="font-medium">{insights.macroAdjustments.protein}g</p>
                      </div>
                    )}
                    {insights.macroAdjustments.carbs && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Carbs</p>
                        <p className="font-medium">{insights.macroAdjustments.carbs}g</p>
                      </div>
                    )}
                    {insights.macroAdjustments.fats && (
                      <div>
                        <p className="text-sm text-muted-foreground">Target Fats</p>
                        <p className="font-medium">{insights.macroAdjustments.fats}g</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {insights.recommendations?.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Recommendations:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {insights.recommendations.map((rec, i) => (
                      <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <p className="text-center text-muted-foreground">Log your nutrition to get AI-powered insights</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}