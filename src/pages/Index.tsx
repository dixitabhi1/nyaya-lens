import { Navigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";

const Index = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading NyayaSetu...</div>;
  }

  return <Navigate to={isAuthenticated ? "/chat" : "/login"} replace />;
};
export default Index;
