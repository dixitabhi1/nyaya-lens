import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppLayout } from "@/components/AppLayout";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route element={<AppLayout><Routes><Route path="*" element={null} /></Routes></AppLayout>}>
          </Route>
          <Route path="/chat" element={<AppLayout><ChatPage /></AppLayout>} />
          <Route path="/case-analysis" element={<AppLayout><CaseAnalysisPage /></AppLayout>} />
          <Route path="/research" element={<AppLayout><ResearchPage /></AppLayout>} />
          <Route path="/drafting" element={<AppLayout><DraftingPage /></AppLayout>} />
          <Route path="/contracts" element={<AppLayout><ContractPage /></AppLayout>} />
          <Route path="/evidence" element={<AppLayout><EvidencePage /></AppLayout>} />
          <Route path="/fir" element={<AppLayout><FIRPage /></AppLayout>} />
          <Route path="/strength" element={<AppLayout><StrengthPage /></AppLayout>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
