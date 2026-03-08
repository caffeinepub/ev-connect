import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Car, Clock } from "lucide-react";
import { motion } from "motion/react";
import { CarStatus } from "../backend.d";
import { useAlertFeed } from "../hooks/useQueries";
import BatteryBar from "./BatteryBar";

function timeAgo(timestamp: bigint): string {
  const ms = Number(timestamp / BigInt(1_000_000));
  const diff = Date.now() - ms;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function AlertsTab() {
  const { data: alerts, isLoading } = useAlertFeed();

  const statusLabel: Record<CarStatus, string> = {
    [CarStatus.driving]: "Driving",
    [CarStatus.parked]: "Parked",
    [CarStatus.idle]: "Idle",
  };

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <AlertTriangle className="w-5 h-5 text-destructive" />
        <h2 className="font-display font-bold text-lg text-foreground">
          Low Battery Alerts
        </h2>
        {!isLoading && (alerts?.length ?? 0) > 0 && (
          <span className="text-xs bg-destructive/15 text-destructive px-2 py-0.5 rounded-full font-display font-semibold">
            {alerts?.length}
          </span>
        )}
      </div>

      <p className="text-xs text-muted-foreground/60">
        Auto-refreshes every 20 seconds · {new Date().toLocaleTimeString()}
      </p>

      {/* Loading */}
      {isLoading && (
        <div data-ocid="alerts.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-card" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!alerts || alerts.length === 0) && (
        <motion.div
          data-ocid="alerts.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-accent/8 border border-accent/20 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-accent/50" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground/60">
              All batteries healthy
            </p>
            <p className="text-sm text-muted-foreground/50 mt-1">
              No low battery alerts from nearby drivers
            </p>
          </div>
        </motion.div>
      )}

      {/* Alert list */}
      {!isLoading && alerts && alerts.length > 0 && (
        <div data-ocid="alerts.list" className="space-y-3">
          {alerts.map((alert, idx) => {
            const batteryLevel = Number(alert.car.batteryLevel);
            const markerIndex = idx + 1;
            const ocid =
              markerIndex <= 10 ? `alerts.item.${markerIndex}` : undefined;

            return (
              <motion.div
                key={`${alert.car.owner.toString()}-${alert.timestamp.toString()}`}
                data-ocid={ocid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-ev p-4 border-destructive/20 bg-destructive/5"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-destructive" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {alert.car.nickname}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {alert.car.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    <Badge className="bg-destructive/20 text-destructive border-destructive/40 text-xs font-display font-bold">
                      {batteryLevel}% ⚡
                    </Badge>
                    <div className="flex items-center gap-1 text-muted-foreground/60">
                      <Clock className="w-3 h-3" />
                      <span className="text-xs">
                        {timeAgo(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <BatteryBar level={batteryLevel} size="sm" />

                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-muted-foreground/60">
                    Status: {statusLabel[alert.car.status] ?? "Unknown"}
                  </span>
                  <span className="text-xs text-destructive font-display font-semibold">
                    LOW BATTERY ALERT
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
