import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { InboxNotifications } from "./InboxNotifications";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";

export function AppLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center justify-between border-b bg-card px-4 shrink-0">
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Scale className="h-5 w-5 text-accent" />
                <span className="font-display text-lg font-bold text-foreground tracking-tight">NyayaSetu</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user ? (
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {user.role}
                    {user.requested_role && user.requested_role !== user.role ? ` -> ${user.requested_role}` : ""}
                    {user.approval_status ? ` | ${user.approval_status}` : ""}
                  </p>
                </div>
              ) : (
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-foreground">Public platform view</p>
                  <p className="text-xs text-muted-foreground">Sign in for AI workflows and saved history</p>
                </div>
              )}
              {user ? (
                <>
                  <InboxNotifications />
                  <Button variant="outline" size="sm" onClick={() => void logout()}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                    <Link to="/login">Sign In</Link>
                  </Button>
                  <Button asChild size="sm" className="bg-slate-950 text-amber-50 hover:bg-slate-900">
                    <Link to="/register">Create Account</Link>
                  </Button>
                </>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
