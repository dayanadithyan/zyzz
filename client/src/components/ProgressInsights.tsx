import { useQuery } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import type { Weight, Workout } from "@shared/schema";

interface ProgressInsight {
  type: 'weight' | 'workout';
  trend: 'improving' | 'stagnating' | 'declining';
  analysis: string;
  recommendations: string[];
}

export default function ProgressInsights() {
  const { data: workouts } = useQuery<Workout[]>({
    queryKey: ["/api/workouts"]
  });

  const { data: weights } = useQuery<Weight[]>({
    queryKey: ["/api/weights"]
  });

  const { data: insight, isLoading } = useQuery<ProgressInsight>({
    queryKey: ["/api/analysis"],
    enabled: !!(workouts?.length || weights?.length)
  });

  const TrendIcon = {
    improving: TrendingUp,
    declining: TrendingDown,
    stagnating: Minus
  }[insight?.trend || 'stagnating'];

  const trendColors = {
    improving: "text-green-500",
    declining: "text-red-500",
    stagnating: "text-yellow-500"
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Progress Insights
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {insight ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <TrendIcon className={`w-5 h-5 ${trendColors[insight.trend]}`} />
              <span className="font-medium capitalize">{insight.trend}</span>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">{insight.analysis}</p>
            </div>

            {insight.recommendations.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Recommendations:</h4>
                <ul className="list-disc list-inside text-sm space-y-1">
                  {insight.recommendations.map((rec, i) => (
                    <li key={i} className="text-muted-foreground">{rec}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Add some workouts and weight entries to get AI-powered insights
          </p>
        )}
      </CardContent>
    </Card>
  );
}
