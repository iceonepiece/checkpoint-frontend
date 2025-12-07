"use client";

import { Card } from "@/components/ui";
import type { ContributionDay } from "@/lib/mockActivity";

function Tooltip({
  children,
  text,
  align = "center"
}: {
  children: React.ReactNode;
  text: string;
  align?: "left" | "center" | "right"
}) {

  let positionClass = "left-1/2 -translate-x-1/2";
  let arrowClass = "left-1/2 -translate-x-1/2";

  if (align === "left") {
    positionClass = "left-0";
    arrowClass = "left-2";
  } else if (align === "right") {
    positionClass = "right-0";
    arrowClass = "right-2";
  }

  return (
    <div className="group relative">
      {children}
      <div className={`pointer-events-none absolute bottom-full mb-2 hidden whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white shadow-lg shadow-black/50 group-hover:block z-50 ${positionClass}`}>
        {text}
        <div className={`absolute top-full -mt-1 h-2 w-2 rotate-45 bg-gray-800 ${arrowClass}`}></div>
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

  const firstDate = new Date(data[0].date);
  const startDay = firstDate.getDay();

  const paddedData = [
    ...Array(startDay).fill(null),
    ...data
  ];

  const weeks = [];
  for (let i = 0; i < paddedData.length; i += 7) {
    weeks.push(paddedData.slice(i, i + 7));
  }

  const getMonthLabel = (week: (ContributionDay | null)[]) => {
    const firstDay = week.find(d => d !== null);
    if (!firstDay) return null;

    const date = new Date(firstDay.date);
    if (date.getDate() <= 7) {
      return date.toLocaleString('default', { month: 'short' });
    }
    return null;
  };

  return (
    <Card className="p-4 border-default">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-200">Contribution Activity</h3>
        <div className="text-xs text-gray-400">Last 12 Months</div>
      </div>

      <div className="flex gap-2">


        {/* Main Scrollable Area */}
        <div className="flex-1 overflow-x-auto pt-6 pb-2">
          {/* FIXED: Added 'w-fit mx-auto' to center the chart if there is extra space */}
          <div className="flex gap-1 min-w-max w-fit mx-auto">
            {/* Left Axis: Day Labels */}
            <div className="flex flex-col justify-end gap-1 pb-2 text-[10px] text-gray-500 pr-2">
              <span className="h-3"></span>
              <span className="h-3">Mon</span>
              <span className="h-3"></span>
              <span className="h-3">Wed</span>
              <span className="h-3"></span>
              <span className="h-3">Fri</span>
              <span className="h-3"></span>
            </div>
            {weeks.map((week, weekIndex) => {
              const monthLabel = getMonthLabel(week);

              // Smart Alignment Logic
              let align: "left" | "right" | "center" = "center";
              if (weekIndex < 5) align = "left";
              if (weekIndex > weeks.length - 5) align = "right";

              return (
                <div key={weekIndex} className="flex flex-col gap-1 relative">
                  {monthLabel && (
                    <div className="absolute -top-5 left-0 text-[10px] text-gray-500">
                      {monthLabel}
                    </div>
                  )}

                  {week.map((day, dayIndex) => {
                    if (!day) return <div key={dayIndex} className="size-3" />;

                    return (
                      <Tooltip
                        key={day.date}
                        text={`${day.count} contributions on ${day.date}`}
                        align={align}
                      >
                        <div className={`size-3 rounded-sm ${getColor(day.level)} border border-white/5`} />
                      </Tooltip>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Legend */}
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