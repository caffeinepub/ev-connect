import { Toaster } from "@/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useOwnCarProfile } from "./hooks/useQueries";
import Dashboard from "./pages/Dashboard";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const {
    data: carProfile,
    isLoading: isCarLoading,
    isFetched,
  } = useOwnCarProfile();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center grid-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center electric-glow">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-display text-sm tracking-widest uppercase">
            Initializing
          </p>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <>
        <LoginPage />
        <Toaster position="top-center" theme="dark" />
      </>
    );
  }

  if (isCarLoading && !isFetched) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center grid-bg">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center electric-glow">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <p className="text-muted-foreground font-display text-sm tracking-widest uppercase">
            Loading Profile
          </p>
        </div>
      </div>
    );
  }

  if (!carProfile) {
    return (
      <>
        <OnboardingPage />
        <Toaster position="top-center" theme="dark" />
      </>
    );
  }

  return (
    <>
      <Dashboard carProfile={carProfile} />
      <Toaster position="top-center" theme="dark" />
    </>
  );
}
