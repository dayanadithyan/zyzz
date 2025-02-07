import { type Workout, type Weight, type Macro } from "@shared/schema";

interface ProgressInsight {
  type: 'weight' | 'workout' | 'nutrition';
  trend: 'improving' | 'stagnating' | 'declining';
  analysis: string;
  recommendations: string[];
  macroAdjustments?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
  };
}

export async function analyzeProgress(
  workouts: Workout[],
  weights: Weight[],
  macros: Macro[],
  exerciseType?: string
): Promise<ProgressInsight> {
  if (!process.env.DEEPSEEK_API_KEY) {
    return {
      type: 'nutrition',
      trend: 'stagnating',
      analysis: "AI analysis is not available at the moment.",
      recommendations: ["Configure DeepSeek API for personalized insights"]
    };
  }

  // Prepare data for analysis
  const workoutData = exerciseType 
    ? workouts.filter(w => w.exercise === exerciseType)
    : workouts;

  const weightData = weights.map(w => ({
    weight: w.weight,
    date: w.date
  }));

  const macroData = macros.map(m => ({
    calories: m.calories,
    protein: m.protein,
    carbs: m.carbs,
    fats: m.fats,
    date: m.date
  }));

  // Construct prompt for DeepSeek
  const prompt = `
    Analyze this fitness data and provide insights:

    Workout History: ${JSON.stringify(workoutData)}
    Weight History: ${JSON.stringify(weightData)}
    Macro History: ${JSON.stringify(macroData)}

    Please analyze:
    1. Progress trends in workouts and weight
    2. Nutrition patterns and macro distribution
    3. Specific recommendations for:
       - Macro adjustments (including carb cycling if applicable)
       - Caloric intake based on activity level
       - Protein requirements for muscle recovery
       - Optimal nutrient timing
    4. Recovery strategies based on workout intensity

    Provide a concise, actionable analysis with specific macro adjustments if needed.
  `;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    const data = await response.json();
    if (!data?.choices?.[0]?.message?.content) {
      throw new Error('Invalid API response format');
    }

    const analysis = data.choices[0].message.content;

    // Parse the AI response into structured insight
    const insight: ProgressInsight = {
      type: 'nutrition',
      trend: determineTrend(workoutData, weightData),
      analysis: analysis,
      recommendations: extractRecommendations(analysis),
      macroAdjustments: extractMacroAdjustments(analysis)
    };

    return insight;
  } catch (error) {
    console.error('AI Analysis failed:', error);
    return {
      type: 'nutrition',
      trend: 'stagnating',
      analysis: "Unable to generate insights at the moment.",
      recommendations: ["Try again later", "Continue tracking your progress"]
    };
  }
}

function determineTrend(workouts: any[], weights: any[]): 'improving' | 'stagnating' | 'declining' {
  // Simple trend analysis based on last 5 entries
  const recentData = workouts.length ? workouts : weights;
  const last5 = recentData.slice(0, 5).reverse();

  if (last5.length < 2) return 'improving';

  let improving = 0;
  let declining = 0;

  for (let i = 1; i < last5.length; i++) {
    const current = workouts.length ? last5[i].weight : last5[i].weight;
    const previous = workouts.length ? last5[i-1].weight : last5[i-1].weight;

    if (current > previous) improving++;
    if (current < previous) declining++;
  }

  if (improving > declining) return 'improving';
  if (declining > improving) return 'declining';
  return 'stagnating';
}

function extractRecommendations(analysis: string): string[] {
  if (!analysis) return ['Maintain current routine and monitor progress'];

  // Extract recommendations from AI response
  const recommendations = analysis
    .split('\n')
    .filter(line => line.includes('recommend') || line.includes('suggest'))
    .map(line => line.trim());

  return recommendations.length ? recommendations : ['Maintain current routine and monitor progress'];
}

function extractMacroAdjustments(analysis: string): ProgressInsight['macroAdjustments'] {
  try {
    // Look for patterns like "Adjust calories to X" or "Increase protein by Y"
    const adjustments: ProgressInsight['macroAdjustments'] = {};

    const caloriesMatch = analysis.match(/calories to (\d+)/i);
    if (caloriesMatch) adjustments.calories = parseInt(caloriesMatch[1]);

    const proteinMatch = analysis.match(/protein to (\d+)/i);
    if (proteinMatch) adjustments.protein = parseInt(proteinMatch[1]);

    const carbsMatch = analysis.match(/carbs to (\d+)/i);
    if (carbsMatch) adjustments.carbs = parseInt(carbsMatch[1]);

    const fatsMatch = analysis.match(/fats to (\d+)/i);
    if (fatsMatch) adjustments.fats = parseInt(fatsMatch[1]);

    return Object.keys(adjustments).length > 0 ? adjustments : undefined;
  } catch {
    return undefined;
  }
}