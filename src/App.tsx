import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { InboxProvider } from "@/lib/inbox-context";

const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const CaseAnalysisPage = lazy(() => import("./pages/CaseAnalysisPage"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));
const DraftingPage = lazy(() => import("./pages/DraftingPage"));
const ContractPage = lazy(() => import("./pages/ContractPage"));
const EvidencePage = lazy(() => import("./pages/EvidencePage"));
const FIRPage = lazy(() => import("./pages/FIRPage"));
const StrengthPage = lazy(() => import("./pages/StrengthPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const LawyersPage = lazy(() => import("./pages/LawyersPage"));
const LawyerNetworkPage = lazy(() => import("./pages/LawyerNetworkPage"));
const LawyerRegisterPage = lazy(() => import("./pages/LawyerRegisterPage"));
const LawyerProfilePage = lazy(() => import("./pages/LawyerProfilePage"));
const LawyerDashboardPage = lazy(() => import("./pages/LawyerDashboardPage"));
const PoliceDashboardPage = lazy(() => import("./pages/PoliceDashboardPage"));
const MessagesPage = lazy(() => import("./pages/MessagesPage"));

const queryClient = new QueryClient();

function RouteLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] text-sm text-slate-500">
      Loading NyayaSetu...
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <InboxProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<RouteLoader />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
                <Route path="/lawyers" element={<AppLayout><LawyersPage /></AppLayout>} />
                <Route path="/lawyers/join" element={<AppLayout><LawyerRegisterPage /></AppLayout>} />
                <Route path="/lawyer/:handle" element={<AppLayout><LawyerProfilePage /></AppLayout>} />
                <Route path="/lawyer-dashboard" element={<ProtectedRoute><AppLayout><LawyerDashboardPage /></AppLayout></ProtectedRoute>} />
                <Route path="/lawyer-network" element={<AppLayout><LawyerNetworkPage /></AppLayout>} />
                <Route path="/police-dashboard" element={<AppLayout><PoliceDashboardPage /></AppLayout>} />
                <Route path="/messages" element={<ProtectedRoute><AppLayout><MessagesPage /></AppLayout></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><AppLayout><ChatPage /></AppLayout></ProtectedRoute>} />
                <Route path="/case-analysis" element={<ProtectedRoute><AppLayout><CaseAnalysisPage /></AppLayout></ProtectedRoute>} />
                <Route path="/research" element={<ProtectedRoute><AppLayout><ResearchPage /></AppLayout></ProtectedRoute>} />
                <Route path="/drafting" element={<ProtectedRoute><AppLayout><DraftingPage /></AppLayout></ProtectedRoute>} />
                <Route path="/contracts" element={<ProtectedRoute><AppLayout><ContractPage /></AppLayout></ProtectedRoute>} />
                <Route path="/evidence" element={<ProtectedRoute><AppLayout><EvidencePage /></AppLayout></ProtectedRoute>} />
                <Route path="/fir" element={<ProtectedRoute><AppLayout><FIRPage /></AppLayout></ProtectedRoute>} />
                <Route path="/strength" element={<ProtectedRoute><AppLayout><StrengthPage /></AppLayout></ProtectedRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </InboxProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
