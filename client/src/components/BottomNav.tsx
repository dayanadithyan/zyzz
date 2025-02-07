import { Link, useLocation } from "wouter";
import { BarChart2, Dumbbell, Scale, ListChecks } from "lucide-react";

export default function BottomNav() {
  const [location] = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t">
      <div className="flex justify-around p-2">
        <Link href="/">
          <a className={`flex flex-col items-center p-2 ${location === "/" ? "text-primary" : "text-muted-foreground"}`}>
            <BarChart2 size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        <Link href="/workouts">
          <a className={`flex flex-col items-center p-2 ${location === "/workouts" ? "text-primary" : "text-muted-foreground"}`}>
            <Dumbbell size={24} />
            <span className="text-xs mt-1">Workouts</span>
          </a>
        </Link>
        <Link href="/weight">
          <a className={`flex flex-col items-center p-2 ${location === "/weight" ? "text-primary" : "text-muted-foreground"}`}>
            <Scale size={24} />
            <span className="text-xs mt-1">Weight</span>
          </a>
        </Link>
        <Link href="/programs">
          <a className={`flex flex-col items-center p-2 ${location === "/programs" ? "text-primary" : "text-muted-foreground"}`}>
            <ListChecks size={24} />
            <span className="text-xs mt-1">Programs</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}