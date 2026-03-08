import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCheck, Clock, Mail, MessageSquare, User } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef } from "react";
import { useMarkMessagesAsRead, useMessages } from "../hooks/useQueries";

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

function truncatePrincipal(principal: string): string {
  if (principal.length <= 12) return principal;
  return `${principal.slice(0, 6)}…${principal.slice(-4)}`;
}

export default function MessagesTab() {
  const { data: messages, isLoading } = useMessages();
  const markAsReadMutation = useMarkMessagesAsRead();
  const markAsReadRef = useRef(markAsReadMutation.mutate);
  markAsReadRef.current = markAsReadMutation.mutate;

  // Mark all messages as read when this tab opens
  useEffect(() => {
    markAsReadRef.current();
  }, []);

  const unreadCount = (messages ?? []).filter((m) => !m.read).length;

  return (
    <div className="px-4 py-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-primary" />
        <h2 className="font-display font-bold text-lg text-foreground">
          Messages
        </h2>
        {!isLoading && unreadCount > 0 && (
          <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded-full font-display font-semibold">
            {unreadCount} new
          </span>
        )}
      </div>

      {/* Loading */}
      {isLoading && (
        <div data-ocid="messages.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-card" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && (!messages || messages.length === 0) && (
        <motion.div
          data-ocid="messages.empty_state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 gap-4 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-primary/8 border border-primary/20 flex items-center justify-center">
            <Mail className="w-7 h-7 text-primary/40" />
          </div>
          <div>
            <p className="font-display font-semibold text-foreground/60">
              No messages yet
            </p>
            <p className="text-sm text-muted-foreground/50 mt-1">
              Messages from nearby EV drivers will appear here
            </p>
          </div>
        </motion.div>
      )}

      {/* Messages list */}
      {!isLoading && messages && messages.length > 0 && (
        <div data-ocid="messages.list" className="space-y-3">
          {messages.map((msg, idx) => {
            const isUnread = !msg.read;
            const markerIndex = idx + 1;
            const ocid =
              markerIndex <= 10 ? `messages.item.${markerIndex}` : undefined;
            const fromStr = msg.from.toString();
            const isBroadcast = !msg.to;

            return (
              <motion.div
                key={`${fromStr}-${msg.timestamp.toString()}`}
                data-ocid={ocid}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className={`card-ev p-4 transition-all ${
                  isUnread ? "border-primary/30 bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isBroadcast
                          ? "bg-accent/15 border border-accent/30"
                          : "bg-secondary/60 border border-border"
                      }`}
                    >
                      <User
                        className={`w-4 h-4 ${isBroadcast ? "text-accent" : "text-foreground/50"}`}
                      />
                    </div>
                    <div>
                      <p className="text-xs font-mono text-muted-foreground">
                        {truncatePrincipal(fromStr)}
                      </p>
                      {isBroadcast && (
                        <Badge className="text-[10px] bg-accent/15 text-accent border-accent/30 px-1 py-0 h-4 mt-0.5">
                          Broadcast
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1">
                    {isUnread ? (
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5 text-muted-foreground/40" />
                    )}
                    <div className="flex items-center gap-1 text-muted-foreground/50">
                      <Clock className="w-2.5 h-2.5" />
                      <span className="text-[10px]">
                        {timeAgo(msg.timestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <p
                  className={`text-sm leading-relaxed pl-10 ${
                    isUnread
                      ? "text-foreground font-medium"
                      : "text-foreground/70"
                  }`}
                >
                  {msg.content}
                </p>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
