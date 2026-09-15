import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/Landing";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import PublicPage from "@/pages/PublicPage";
import { Loader2 } from "lucide-react";

const Onboarding = () => {
  const [Component, setComponent] = useState<React.ComponentType | null>(null);
  useEffect(() => {
    import("@/pages/Onboarding").then(m => setComponent(() => m.default)).catch(console.error);
  }, []);
  if (!Component) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  return <Component />;
};

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="grid min-h-screen place-items-center"><Loader2 className="size-6 animate-spin text-primary" /></div>;
  if (!user) { window.location.href = "/auth"; return null; }
  return <>{children}</>;
}

export default function App() {
  const path = window.location.pathname;
  if (path === "/" || path === "") return <Landing />;
  if (path === "/auth") return <Auth />;
  if (path === "/dashboard") return <ProtectedRoute><Dashboard /></ProtectedRoute>;
  if (path === "/onboarding") return <ProtectedRoute><Onboarding /></ProtectedRoute>;
  const slug = path.replace(/^\//, "").split("/")[0];
  if (slug) return <PublicPage slug={slug} />;
  return <Landing />;
}
