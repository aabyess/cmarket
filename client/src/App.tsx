import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import RfqCreation from "@/pages/rfq-creation";
import RfqDetail from "@/pages/rfq-detail";
import Checkout from "@/pages/checkout";
import NotFound from "@/pages/not-found";

function Router() {
  // For demo purposes, bypass authentication and always show authenticated routes
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/create-rfq" component={RfqCreation} />
      <Route path="/rfq/:id" component={RfqDetail} />
      <Route path="/checkout/:orderId" component={Checkout} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
