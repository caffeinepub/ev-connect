interface BatteryBarProps {
  level: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function getBatteryColor(level: number) {
  if (level > 50) return "bg-battery-high";
  if (level > 20) return "bg-battery-mid";
  return "bg-battery-low";
}

export function getBatteryGlow(level: number) {
  if (level > 50) return "battery-glow-green";
  if (level > 20) return "battery-glow-yellow";
  return "battery-glow-red";
}

export function getBatteryTextColor(level: number) {
  if (level > 50) return "text-battery-high";
  if (level > 20) return "text-battery-mid";
  return "text-battery-low";
}

export default function BatteryBar({
  level,
  showLabel = true,
  size = "md",
  className = "",
}: BatteryBarProps) {
  const heights: Record<string, string> = {
    sm: "h-2",
    md: "h-3",
    lg: "h-4",
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground font-body">
            Battery
          </span>
          <span
            className={`text-sm font-bold font-display ${getBatteryTextColor(level)}`}
          >
            {level}%
          </span>
        </div>
      )}
      <div
        className={`relative ${heights[size]} bg-secondary/60 rounded-full overflow-hidden border border-border`}
      >
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-500 ${getBatteryColor(level)} ${getBatteryGlow(level)}`}
          style={{ width: `${Math.max(2, level)}%` }}
        />
      </div>
    </div>
  );
}
