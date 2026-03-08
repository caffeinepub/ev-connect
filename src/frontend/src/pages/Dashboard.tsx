import { AlertTriangle, Car, MessageSquare, Radio } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { CarProfile } from "../backend.d";
import AlertsTab from "../components/AlertsTab";
import MessagesTab from "../components/MessagesTab";
import MyCarTab from "../components/MyCarTab";
import NearbyCarsTab from "../components/NearbyCarsTab";

type Tab = "mycar" | "nearby" | "alerts" | "messages";

const TABS: {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { id: "mycar", label: "My Car", icon: Car },
  { id: "nearby", label: "Nearby", icon: Radio },
  { id: "alerts", label: "Alerts", icon: AlertTriangle },
  { id: "messages", label: "Messages", icon: MessageSquare },
];

interface DashboardProps {
  carProfile: CarProfile;
}

export default function Dashboard({ carProfile }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>("mycar");

  return (
    <div className="min-h-screen bg-background flex flex-col max-w-lg mx-auto relative">
      {/* Top header */}
      <header className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border bg-background/95 sticky top-0 z-20 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full border border-primary/40 flex items-center justify-center bg-card">
            <img
              src="/assets/generated/ev-connect-logo-transparent.dim_200x200.png"
              alt="EV Connect"
              className="w-6 h-6 object-contain"
            />
          </div>
          <span className="font-display font-bold text-lg text-foreground tracking-tight">
            EV<span className="text-primary">Connect</span>
          </span>
        </div>

        {/* Live indicator */}
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-xs text-muted-foreground font-body">LIVE</span>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "mycar" && <MyCarTab carProfile={carProfile} />}
            {activeTab === "nearby" && (
              <NearbyCarsTab ownProfile={carProfile} />
            )}
            {activeTab === "alerts" && <AlertsTab />}
            {activeTab === "messages" && <MessagesTab />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom navigation */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg border-t border-border bg-card/95 backdrop-blur-sm z-20 pb-safe">
        <div className="flex">
          {TABS.map(({ id, label, icon: Icon }) => {
            const isActive = activeTab === id;
            const ocidMap: Record<Tab, string> = {
              mycar: "nav.mycar_tab",
              nearby: "nav.nearby_tab",
              alerts: "nav.alerts_tab",
              messages: "nav.messages_tab",
            };

            return (
              <button
                type="button"
                key={id}
                data-ocid={ocidMap[id]}
                onClick={() => setActiveTab(id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 py-3 px-2 transition-all duration-200 relative min-h-[60px] touch-manipulation ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 left-0 right-0 h-0.5 bg-primary"
                  />
                )}
                <Icon
                  className={`w-5 h-5 ${isActive ? "drop-shadow-[0_0_6px_oklch(0.65_0.22_230)]" : ""}`}
                />
                <span className="text-[10px] font-display font-semibold tracking-wide uppercase">
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
