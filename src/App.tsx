import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { LoadingFallback } from "./components/LoadingFallback";
import Index from "./pages/Index";
import { TooltipProvider } from "./components/ui/tooltip";

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <TooltipProvider>
        <BrowserRouter>
          <Toaster position="top-right" />
          <Index />
        </BrowserRouter>
      </TooltipProvider>
    </Suspense>
  );
}

export default App;