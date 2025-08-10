import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard.tsx";
import Playground from "@/pages/playground.tsx";
import FileManager from "@/pages/file-manager.tsx";
import WidgetDesigner from "@/pages/widget-designer.tsx";
import Chat from "@/pages/chat.tsx";
import UserProfile from "@/pages/user-profile.tsx";
import AdminPanel from "@/pages/admin-panel.tsx";
import NotFound from "@/pages/not-found.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/playground" component={Playground} />
      <Route path="/playground/:assistantId" component={Playground} />
      <Route path="/widget-designer/:assistantId" component={WidgetDesigner} />
      <Route path="/chat/:assistantId" component={Chat} />
      <Route path="/files" component={FileManager} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/admin" component={AdminPanel} />
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
