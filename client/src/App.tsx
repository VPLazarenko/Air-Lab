import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Playground from "@/pages/playground.tsx";
import NotFound from "@/pages/not-found.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Playground} />
      <Route path="/playground" component={Playground} />
      <Route path="/playground/:assistantId" component={Playground} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
