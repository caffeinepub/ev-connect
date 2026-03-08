import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Battery, Car, Loader2, Tag, Zap } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useRegisterCar } from "../hooks/useQueries";

const CAR_MODELS = [
  "Tesla Model 3",
  "Tesla Model Y",
  "Tesla Model S",
  "Rivian R1T",
  "Ford F-150 Lightning",
  "Chevy Bolt EV",
  "Hyundai Ioniq 6",
  "Kia EV6",
  "BMW iX",
  "Porsche Taycan",
  "Other",
];

export default function OnboardingPage() {
  const [nickname, setNickname] = useState("");
  const [model, setModel] = useState("");
  const [battery, setBattery] = useState(80);

  const registerMutation = useRegisterCar();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !model.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    try {
      await registerMutation.mutateAsync({
        nickname: nickname.trim(),
        model: model.trim(),
        batteryLevel: BigInt(battery),
      });
      toast.success("Vehicle registered! Welcome to EV Connect.");
    } catch (err) {
      toast.error("Failed to register vehicle. Please try again.");
      console.error(err);
    }
  };

  const getBatteryColor = (level: number) => {
    if (level > 50) return "text-battery-high";
    if (level > 20) return "text-battery-mid";
    return "text-battery-low";
  };

  const getBatteryBarColor = (level: number) => {
    if (level > 50) return "bg-battery-high battery-glow-green";
    if (level > 20) return "bg-battery-mid battery-glow-yellow";
    return "bg-battery-low battery-glow-red";
  };

  return (
    <div className="min-h-screen bg-background grid-bg flex flex-col relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-[-10%] right-[-10%] w-80 h-80 rounded-full bg-primary/8 blur-[80px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[-5%] w-60 h-60 rounded-full bg-accent/8 blur-[80px] pointer-events-none" />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          {/* Header */}
          <div className="flex flex-col items-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center electric-glow">
              <Car className="w-7 h-7 text-primary" />
            </div>
            <div className="text-center">
              <h1 className="font-display text-2xl font-bold text-foreground">
                Register Your EV
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Set up your vehicle to join the network
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nickname */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <Label
                htmlFor="nickname"
                className="text-sm font-display text-foreground/80 flex items-center gap-2"
              >
                <Tag className="w-3.5 h-3.5 text-primary" />
                Vehicle Nickname
              </Label>
              <Input
                id="nickname"
                data-ocid="onboarding.nickname_input"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="e.g. Blue Lightning, City Cruiser"
                className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground/60 text-base focus:border-primary focus:ring-primary"
                maxLength={30}
                required
              />
            </motion.div>

            {/* Model */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-2"
            >
              <Label
                htmlFor="model"
                className="text-sm font-display text-foreground/80 flex items-center gap-2"
              >
                <Car className="w-3.5 h-3.5 text-primary" />
                Car Model
              </Label>
              <Input
                id="model"
                data-ocid="onboarding.model_input"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Tesla Model 3, Kia EV6"
                list="car-models-list"
                className="h-12 bg-card border-border text-foreground placeholder:text-muted-foreground/60 text-base focus:border-primary focus:ring-primary"
                maxLength={50}
                required
              />
              <datalist id="car-models-list">
                {CAR_MODELS.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
            </motion.div>

            {/* Battery Level */}
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-sm font-display text-foreground/80 flex items-center gap-2">
                <Battery className="w-3.5 h-3.5 text-primary" />
                Starting Battery Level
                <span
                  className={`ml-auto font-bold font-display text-base ${getBatteryColor(battery)}`}
                >
                  {battery}%
                </span>
              </Label>

              {/* Visual battery indicator */}
              <div className="relative h-4 bg-secondary/60 rounded-full overflow-hidden border border-border">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${getBatteryBarColor(battery)}`}
                  style={{ width: `${battery}%` }}
                />
              </div>

              <Slider
                data-ocid="onboarding.battery_input"
                value={[battery]}
                onValueChange={(v) => setBattery(v[0])}
                min={0}
                max={100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                type="submit"
                data-ocid="onboarding.submit_button"
                disabled={
                  registerMutation.isPending ||
                  !nickname.trim() ||
                  !model.trim()
                }
                size="lg"
                className="w-full h-14 font-display text-base font-semibold bg-primary hover:bg-primary/90 text-primary-foreground electric-glow transition-all duration-300 mt-2"
              >
                {registerMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Join the Network
                  </span>
                )}
              </Button>
            </motion.div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
