import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/i18n";
import Dashboard from "@/pages/dashboard.tsx";
import Playground from "@/pages/playground.tsx";
import FileManager from "@/pages/file-manager.tsx";
import WidgetDesigner from "@/pages/widget-designer.tsx";
import Chat from "@/pages/chat.tsx";
import PhotoEditor from "@/pages/PhotoEditor.tsx";
import UserProfile from "@/pages/user-profile.tsx";
import AdminPanel from "@/pages/admin-panel.tsx";
import PlatformDescription from "@/pages/platform-description.tsx";
import PlatformFeatures from "@/pages/platform-features.tsx";
import Documentation from "@/pages/documentation.tsx";
import UserInstructions from "@/pages/user-instructions.tsx";
import PrivacyPolicy from "@/pages/privacy-policy.tsx";
import TermsOfService from "@/pages/terms-of-service.tsx";
import TermsConditions from "@/pages/terms-conditions.tsx";
import CookiePolicy from "@/pages/cookie-policy.tsx";
import SupportCenter from "@/pages/support-center.tsx";
import NotFound from "@/pages/not-found.tsx";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/playground" component={Playground} />
      <Route path="/playground/:assistantId" component={Playground} />
      <Route path="/widget-designer/:assistantId" component={WidgetDesigner} />
      <Route path="/chat/:assistantId" component={Chat} />
      <Route path="/photo-editor" component={PhotoEditor} />
      <Route path="/files" component={FileManager} />
      <Route path="/profile" component={UserProfile} />
      <Route path="/admin" component={AdminPanel} />
      <Route path="/platform-description" component={PlatformDescription} />
      <Route path="/platform-features" component={PlatformFeatures} />
      <Route path="/documentation" component={Documentation} />
      <Route path="/user-instructions" component={UserInstructions} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms-of-service" component={TermsOfService} />
      <Route path="/terms-conditions" component={TermsConditions} />
      <Route path="/cookie-policy" component={CookiePolicy} />
      <Route path="/support-center" component={SupportCenter} />
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
