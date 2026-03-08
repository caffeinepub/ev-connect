import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import type { Principal } from "@icp-sdk/core/principal";
import {
  Car,
  Loader2,
  MessageSquare,
  Radio,
  Send,
  Users,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { CarProfile } from "../backend.d";
import { CarStatus } from "../backend.d";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useAllActiveCars, useSendMessage } from "../hooks/useQueries";
import BatteryBar from "./BatteryBar";

interface NearbyCarsTabProps {
  ownProfile?: CarProfile;
}

export default function NearbyCarsTab({
  ownProfile: _ownProfile,
}: NearbyCarsTabProps) {
  const { identity } = useInternetIdentity();
  const { data: allCars, isLoading } = useAllActiveCars();
  const sendMessageMutation = useSendMessage();

  const [selectedCar, setSelectedCar] = useState<CarProfile | null>(null);
  const [isBroadcast, setIsBroadcast] = useState(false);
  const [messageText, setMessageText] = useState("");

  const ownPrincipal = identity?.getPrincipal().toString();
  const nearbyCars = (allCars ?? []).filter(
    (car) => car.owner.toString() !== ownPrincipal,
  );

  const handleOpenMessage = (car: CarProfile) => {
    setSelectedCar(car);
    setIsBroadcast(false);
    setMessageText("");
  };

  const handleBroadcast = () => {
    setSelectedCar(null);
    setIsBroadcast(true);
    setMessageText("");
  };

  const handleSend = async () => {
    if (!messageText.trim()) return;
    try {
      const to: Principal | null = isBroadcast
        ? null
        : (selectedCar?.owner ?? null);
      await sendMessageMutation.mutateAsync({
        to,
        content: messageText.trim(),
      });
      toast.success(
        isBroadcast
          ? "Broadcast sent to all nearby EVs!"
          : `Message sent to ${selectedCar?.nickname}`,
      );
      setSelectedCar(null);
      setIsBroadcast(false);
      setMessageText("");
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleClose = () => {
    setSelectedCar(null);
    setIsBroadcast(false);
    setMessageText("");
  };

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Radio className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg text-foreground">
            Nearby EVs
          </h2>
          {!isLoading && (
            <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-display font-semibold">
              {nearbyCars.length}
            </span>
          )}
        </div>

        {nearbyCars.length > 0 && (
          <Button
            data-ocid="nearby.broadcast_button"
            onClick={handleBroadcast}
            size="sm"
            className="h-9 px-4 font-display font-semibold bg-secondary border border-border text-foreground hover:bg-secondary/70 text-xs"
          >
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Broadcast All
          </Button>
        )}
      </div>

      {/* Auto-refresh indicator */}
      <p className="text-xs text-muted-foreground/60">
        Auto-refreshes every 15 seconds · {new Date().toLocaleTimeString()}
      </p>

      {/* Loading state */}
      {isLoading && (
        <div data-ocid="nearby.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl bg-card" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && nearbyCars.length === 0 && (
        <motion.div
          data-ocid="nearby.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center">
            <Radio className="w-7 h-7 text-primary/50" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground/60">
              No EVs in range
            </p>
            <p className="text-sm text-muted-foreground/50 mt-1">
              Other EV Connect users will appear here when nearby
            </p>
          </div>
        </motion.div>
      )}

      {/* Cars list */}
      {!isLoading && nearbyCars.length > 0 && (
        <div data-ocid="nearby.list" className="space-y-3">
          {nearbyCars.map((car, idx) => {
            const markerIndex = idx + 1;
            const ocid =
              markerIndex <= 10 ? `nearby.item.${markerIndex}` : undefined;
            return (
              <motion.div
                key={car.owner.toString()}
                data-ocid={ocid}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="card-ev p-4"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-secondary/60 border border-border flex items-center justify-center flex-shrink-0">
                      <Car className="w-5 h-5 text-foreground/60" />
                    </div>
                    <div>
                      <p className="font-display font-semibold text-foreground text-sm">
                        {car.nickname}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {car.model}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={car.status} />
                    <button
                      type="button"
                      onClick={() => handleOpenMessage(car)}
                      className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors touch-manipulation"
                      aria-label={`Message ${car.nickname}`}
                    >
                      <MessageSquare className="w-4 h-4 text-primary" />
                    </button>
                  </div>
                </div>

                <BatteryBar level={Number(car.batteryLevel)} size="sm" />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Message Dialog */}
      <Dialog
        open={!!selectedCar || isBroadcast}
        onOpenChange={(open) => !open && handleClose()}
      >
        <DialogContent className="bg-card border-border max-w-[90vw] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="font-display text-foreground flex items-center gap-2">
              {isBroadcast ? (
                <>
                  <Users className="w-4 h-4 text-primary" />
                  Broadcast to All Nearby
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-primary" />
                  Message {selectedCar?.nickname}
                </>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <Textarea
              data-ocid="nearby.message_input"
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder={
                isBroadcast
                  ? "Send a message to all nearby EVs…"
                  : `Message to ${selectedCar?.nickname}…`
              }
              className="min-h-[100px] bg-secondary/40 border-border text-foreground placeholder:text-muted-foreground/50 text-base resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {messageText.length}/500
            </p>
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleClose}
              className="flex-1 border-border text-foreground bg-secondary/40"
            >
              Cancel
            </Button>
            <Button
              data-ocid="nearby.send_button"
              onClick={handleSend}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-display font-semibold"
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1.5" />
                  Send
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
      className={`border text-xs font-display font-semibold ${c.className}`}
    >
      {c.label}
    </Badge>
  );
}
