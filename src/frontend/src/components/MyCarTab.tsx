import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  Clock,
  Loader2,
  LogOut,
  Navigation,
  ParkingSquare,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CarProfile } from "../backend.d";
import { CarStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import {
  useDeleteCarProfile,
  useUpdateBatteryLevel,
  useUpdateStatus,
} from "../hooks/useQueries";
import BatteryBar, { getBatteryTextColor } from "./BatteryBar";

interface MyCarTabProps {
  carProfile: CarProfile;
}

const STATUS_OPTIONS = [
  {
    value: CarStatus.driving,
    label: "Driving",
    icon: Navigation,
    color: "text-primary",
  },
  {
    value: CarStatus.parked,
    label: "Parked",
    icon: ParkingSquare,
    color: "text-accent",
  },
  {
    value: CarStatus.idle,
    label: "Idle",
    icon: Clock,
    color: "text-muted-foreground",
  },
];

export default function MyCarTab({ carProfile }: MyCarTabProps) {
  const currentBattery = Number(carProfile.batteryLevel);
  const [localBattery, setLocalBattery] = useState(currentBattery);
  const [hasChanged, setHasChanged] = useState(false);

  const updateBatteryMutation = useUpdateBatteryLevel();
  const updateStatusMutation = useUpdateStatus();
  const deleteMutation = useDeleteCarProfile();
  const { clear } = useInternetIdentity();

  const handleBatteryChange = (val: number[]) => {
    setLocalBattery(val[0]);
    setHasChanged(val[0] !== currentBattery);
  };

  const handleBatteryUpdate = async () => {
    try {
      await updateBatteryMutation.mutateAsync(localBattery);
      setHasChanged(false);
      toast.success(`Battery updated to ${localBattery}%`);
    } catch {
      toast.error("Failed to update battery level");
    }
  };

  const handleStatusChange = async (status: CarStatus) => {
    try {
      await updateStatusMutation.mutateAsync(status);
      toast.success(`Status set to ${status}`);
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync();
      toast.success("Vehicle unregistered");
      clear();
    } catch {
      toast.error("Failed to unregister vehicle");
    }
  };

  const isLowBattery = currentBattery <= 20;

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Low battery warning */}
      {isLowBattery && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-3 bg-destructive/15 border border-destructive/40 rounded-xl px-4 py-3"
        >
          <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0" />
          <div>
            <p className="text-destructive font-display font-semibold text-sm">
              Low Battery Warning
            </p>
            <p className="text-destructive/80 text-xs mt-0.5">
              Your battery is at {currentBattery}%. Nearby drivers have been
              notified.
            </p>
          </div>
        </motion.div>
      )}

      {/* Car card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-ev p-5"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Car className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground leading-tight">
                {carProfile.nickname}
              </h2>
              <p className="text-muted-foreground text-sm">
                {carProfile.model}
              </p>
            </div>
          </div>

          <StatusBadge status={carProfile.status} />
        </div>

        {/* Battery display */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground font-body flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" /> Battery Level
            </span>
            <span
              className={`text-2xl font-bold font-display ${getBatteryTextColor(currentBattery)}`}
            >
              {currentBattery}%
            </span>
          </div>
          <BatteryBar level={currentBattery} showLabel={false} size="lg" />
        </div>
      </motion.div>

      {/* Battery updater */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card-ev p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Update Battery
          </h3>
          <span
            className={`text-xl font-bold font-display ${getBatteryTextColor(localBattery)}`}
          >
            {localBattery}%
          </span>
        </div>

        {/* Visual battery bar for local preview */}
        <div className="relative h-4 bg-secondary/60 rounded-full overflow-hidden border border-border">
          <div
            className={`absolute left-0 top-0 h-full rounded-full transition-all duration-200 ${
              localBattery > 50
                ? "bg-battery-high battery-glow-green"
                : localBattery > 20
                  ? "bg-battery-mid battery-glow-yellow"
                  : "bg-battery-low battery-glow-red"
            }`}
            style={{ width: `${Math.max(2, localBattery)}%` }}
          />
        </div>

        <Slider
          data-ocid="mycar.battery_input"
          value={[localBattery]}
          onValueChange={handleBatteryChange}
          min={0}
          max={100}
          step={1}
          className="w-full"
        />

        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
          <span>75%</span>
          <span>100%</span>
        </div>

        <Button
          data-ocid="mycar.update_button"
          onClick={handleBatteryUpdate}
          disabled={!hasChanged || updateBatteryMutation.isPending}
          size="lg"
          className={`w-full h-12 font-display font-semibold transition-all duration-300 ${
            hasChanged
              ? "bg-primary hover:bg-primary/90 text-primary-foreground electric-glow"
              : "bg-secondary text-muted-foreground"
          }`}
        >
          {updateBatteryMutation.isPending ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating…
            </span>
          ) : hasChanged ? (
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Save Battery Level
            </span>
          ) : (
            "No Changes"
          )}
        </Button>
      </motion.div>

      {/* Status selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="card-ev p-5 space-y-3"
      >
        <h3 className="font-display font-semibold text-foreground">
          Vehicle Status
        </h3>
        <div data-ocid="mycar.status.select" className="grid grid-cols-3 gap-2">
          {STATUS_OPTIONS.map(({ value, label, icon: Icon, color }) => {
            const isActive = carProfile.status === value;
            return (
              <button
                type="button"
                key={value}
                onClick={() => handleStatusChange(value)}
                disabled={updateStatusMutation.isPending}
                className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl border transition-all duration-200 touch-manipulation ${
                  isActive
                    ? "bg-primary/15 border-primary/50 text-primary"
                    : "bg-secondary/30 border-border text-muted-foreground hover:border-border/70"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-primary" : color}`}
                />
                <span className="text-xs font-display font-semibold tracking-wide uppercase">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Danger zone */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.22 }}
        className="card-ev p-5"
      >
        <h3 className="font-display font-semibold text-muted-foreground text-sm uppercase tracking-wider mb-3">
          Danger Zone
        </h3>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              data-ocid="mycar.delete_button"
              variant="outline"
              className="w-full h-12 border-destructive/40 text-destructive hover:bg-destructive/10 hover:border-destructive font-display font-semibold transition-all"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Unregister Vehicle
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent
            data-ocid="mycar.dialog"
            className="bg-card border-border max-w-[90vw] rounded-2xl"
          >
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display text-foreground">
                Unregister Vehicle?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                This will remove your vehicle from the EV Connect network. You
                can re-register at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                data-ocid="mycar.cancel_button"
                className="bg-secondary border-border text-foreground"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                data-ocid="mycar.confirm_button"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Unregister"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* Footer */}
      <div className="text-center py-2">
        <p className="text-xs text-muted-foreground/40">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground/60 transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: CarStatus }) {
  const config: Record<CarStatus, { label: string; className: string }> = {
    [CarStatus.driving]: {
      label: "Driving",
      className: "bg-primary/20 text-primary border-primary/40",
    },
    [CarStatus.parked]: {
      label: "Parked",
      className: "bg-accent/20 text-accent border-accent/40",
    },
    [CarStatus.idle]: {
      label: "Idle",
      className: "bg-secondary text-muted-foreground border-border",
    },
  };

  const c = config[status] ?? config[CarStatus.idle];

  return (
    <Badge
      className={`border text-xs font-display font-semibold tracking-wide ${c.className}`}
    >
      {c.label}
    </Badge>
  );
}
