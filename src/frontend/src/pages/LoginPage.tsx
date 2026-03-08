import { Button } from "@/components/ui/button";
import { Battery, Shield, Wifi, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

export default function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col relative overflow-hidden">
      {/* Ambient glow spheres */}
      <div className="absolute top-[-20%] right-[-10%] w-96 h-96 rounded-full bg-primary/10 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-80 h-80 rounded-full bg-accent/10 blur-[80px] pointer-events-none" />

      {/* Scanlines overlay */}
      <div className="absolute inset-0 scanlines pointer-events-none opacity-30" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo & Brand */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center gap-6 mb-12"
        >
          <div className="relative">
            <div className="w-24 h-24 rounded-full border border-primary/40 flex items-center justify-center electric-glow bg-card">
              <img
                src="/assets/generated/ev-connect-logo-transparent.dim_200x200.png"
                alt="EV Connect Logo"
                className="w-20 h-20 object-contain"
              />
            </div>
            {/* Orbit ring */}
            <div
              className="absolute inset-[-12px] rounded-full border border-primary/20 animate-spin"
              style={{ animationDuration: "8s" }}
            />
          </div>

          <div className="text-center">
            <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">
              EV<span className="text-primary">Connect</span>
            </h1>
            <p className="text-muted-foreground mt-2 text-base font-body">
              Vehicle-to-vehicle communication network
            </p>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col gap-3 w-full max-w-sm mb-10"
        >
          {[
            {
              icon: Wifi,
              label: "Connect with nearby EVs",
              color: "text-primary",
            },
            {
              icon: Battery,
              label: "Low battery alerts in real-time",
              color: "text-battery-low",
            },
            {
              icon: Zap,
              label: "Instant driver-to-driver messaging",
              color: "text-accent",
            },
            {
              icon: Shield,
              label: "Secure, decentralized network",
              color: "text-primary",
            },
          ].map(({ icon: Icon, label, color }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3 bg-card border border-border rounded-lg px-4 py-3"
            >
              <div className={`${color} flex-shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-foreground/80 text-sm font-body">
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>

        {/* Login CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="w-full max-w-sm"
        >
          <Button
            onClick={login}
            disabled={isLoggingIn}
            size="lg"
            className="w-full h-14 font-display text-base font-semibold tracking-wide bg-primary hover:bg-primary/90 text-primary-foreground electric-glow transition-all duration-300"
          >
            {isLoggingIn ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connecting…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Sign In Securely
              </span>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            Powered by Internet Identity · No passwords required
          </p>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center relative z-10">
        <p className="text-xs text-muted-foreground/50">
          © {new Date().getFullYear()}.{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-muted-foreground transition-colors"
          >
            Built with ❤️ using caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
