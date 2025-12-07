"use client";

import { Card } from "@/components/ui";
import type { ContributionDay } from "@/lib/mockActivity";

function Tooltip({ children, text }: { children: React.ReactNode; text: string }) {
  return (
    <div className="group relative">
      {children}
      <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow shadow-black/50 group-hover:block z-50">
        {text}
        <div className="absolute top-full left-1/2 -mt-1 h-2 w-2 -translate-x-1/2 rotate-45 bg-gray-800"></div>
      </div>
    </div>
  );
}

export default function ActivityHeatmap({ data }: { data: ContributionDay[] }) {
  const getColor = (level: number) => {
    switch (level) {
      case 1: return "bg-[#0e4429]"; 
      case 2: return "bg-[#006d32]";
      case 3: return "bg-[#26a641]";
      case 4: return "bg-[#39d353]"; 
      default: return "bg-card"; 
    }
  };

  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
      weeks.push(data.slice(i, i + 7));
  }

  return (
    <Card className="p-4 border-default">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Contribution Activity</h3>
        <div className="text-xs text-gray-400">Last 12 Months</div>
      </div>
      
      <div className="w-full overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-max">
           {weeks.map((week, weekIndex) => (
             <div key={weekIndex} className="flex flex-col gap-1">
               {week.map((day) => (
                 <Tooltip key={day.date} text={`${day.count} contributions on ${day.date}`}>
                    <div className={`size-3 rounded-sm ${getColor(day.level)} border border-white/5`} />
                 </Tooltip>
               ))}
             </div>
           ))}
        </div>
      </div>

      <div className="mt-2 flex items-center justify-end gap-2 text-xs text-gray-400">
        <span>Less</span>
        <div className="flex gap-1">
            <div className="size-3 rounded-sm bg-card border border-white/5" />
            <div className="size-3 rounded-sm bg-[#0e4429]" />
            <div className="size-3 rounded-sm bg-[#006d32]" />
            <div className="size-3 rounded-sm bg-[#26a641]" />
            <div className="size-3 rounded-sm bg-[#39d353]" />
        </div>
        <span>More</span>
      </div>
    </Card>
  );
}