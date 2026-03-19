import { Link, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";

type RequiredAccess = "lawyer" | "police" | "admin";

function hasRequiredAccess(requiredAccess: RequiredAccess, user: ReturnType<typeof useAuth>["user"]) {
  if (!user) {
    return false;
  }
  if (requiredAccess === "lawyer") {
    return Boolean(user.can_access_lawyer_dashboard);
  }
  if (requiredAccess === "police") {
    return Boolean(user.can_access_police_dashboard);
  }
  return Boolean(user.can_access_admin_dashboard);
}

export function ProtectedRoute({
  children,
  requiredAccess,
}: {
  children: JSX.Element;
  requiredAccess?: RequiredAccess;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Loading NyayaSetu...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (requiredAccess && !hasRequiredAccess(requiredAccess, user)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
          <h1 className="font-display text-3xl font-bold text-foreground">Access requires approval</h1>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {requiredAccess === "admin"
              ? "This console is limited to approved admin accounts."
              : `This workspace is available only to approved ${requiredAccess} accounts.`}
          </p>
          <p className="mt-2 text-sm leading-7 text-muted-foreground">
            Current role: <strong>{user?.role || "unknown"}</strong>
            {user?.requested_role ? `, requested role: ${user.requested_role}` : ""}
            {user?.approval_status ? `, status: ${user.approval_status}` : ""}
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline">
              <Link to="/dashboard">Go to dashboard</Link>
            </Button>
            {requiredAccess === "lawyer" ? (
              <Button asChild>
                <Link to="/lawyers/join">Create lawyer profile</Link>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return children;
}
