import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import { AppLayout } from "@/components/AppLayout";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ChatPage from "./pages/ChatPage";
import CaseAnalysisPage from "./pages/CaseAnalysisPage";
import ResearchPage from "./pages/ResearchPage";
import DraftingPage from "./pages/DraftingPage";
import ContractPage from "./pages/ContractPage";
import EvidencePage from "./pages/EvidencePage";
import FIRPage from "./pages/FIRPage";
import StrengthPage from "./pages/StrengthPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import LawyersPage from "./pages/LawyersPage";
import LawyerNetworkPage from "./pages/LawyerNetworkPage";
import LawyerRegisterPage from "./pages/LawyerRegisterPage";
import LawyerProfilePage from "./pages/LawyerProfilePage";
import PoliceDashboardPage from "./pages/PoliceDashboardPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
            <Route path="/lawyers" element={<AppLayout><LawyersPage /></AppLayout>} />
            <Route path="/lawyers/join" element={<AppLayout><LawyerRegisterPage /></AppLayout>} />
            <Route path="/lawyer/:handle" element={<AppLayout><LawyerProfilePage /></AppLayout>} />
            <Route path="/lawyer-network" element={<AppLayout><LawyerNetworkPage /></AppLayout>} />
            <Route path="/police-dashboard" element={<AppLayout><PoliceDashboardPage /></AppLayout>} />
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
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
