import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
import { useAuth } from "@/hooks/useAuth";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  defaultMode?: "login" | "register";
}

export function AuthModal({ open, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">(defaultMode);
  const { isAuthenticated } = useAuth();

  // Закрываем модальное окно при успешной авторизации
  useEffect(() => {
    if (isAuthenticated && open) {
      onClose();
    }
  }, [isAuthenticated, open, onClose]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 border-none bg-transparent shadow-none" aria-describedby={undefined}>
        <DialogTitle className="sr-only">
          {mode === "login" ? "Вход в систему" : "Регистрация"}
        </DialogTitle>
        {mode === "login" ? (
          <LoginForm
            onSwitchToRegister={() => setMode("register")}
            onClose={onClose}
          />
        ) : (
          <RegisterForm
            onSwitchToLogin={() => setMode("login")}
            onClose={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}