import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { useAuth } from "@/lib/use-auth";

export function AppHeader({ name }: { name?: string }) {
  const { signOut, role } = useAuth();
  return (
    <header className="sticky top-0 z-30 bg-background/80 backdrop-blur border-b border-border">
      <div className="px-4 sm:px-6 h-20 flex items-center justify-between">
        <Link to={role === "admin" ? "/admin" : "/dashboard"} className="flex items-center">
          <Logo className="h-12" />
        </Link>
        <div className="flex items-center gap-3">
          {name && <span className="hidden sm:inline text-sm text-muted-foreground">{name}</span>}
          <Button variant="ghost" size="sm" onClick={() => signOut()}>
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Salir</span>
          </Button>
        </div>
      </div>
    </header>
  );
}