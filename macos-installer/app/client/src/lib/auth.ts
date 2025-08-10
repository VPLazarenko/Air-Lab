import { apiRequest } from "@/lib/queryClient";
import type { LoginData, RegisterData, User } from "@shared/schema";

class AuthAPI {
  async login(data: LoginData): Promise<{ user: User; token: string }> {
    return apiRequest("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async register(data: RegisterData): Promise<{ user: User; token: string }> {
    return apiRequest("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        await apiRequest("/api/auth/logout", {
          method: "POST",
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
      localStorage.removeItem('authToken');
    }
  }

  async getCurrentUser(): Promise<User> {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No auth token');
    }
    
    return apiRequest("/api/auth/me", {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
  }

  setToken(token: string): void {
    localStorage.setItem('authToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('authToken');
  }

  clearToken(): void {
    localStorage.removeItem('authToken');
  }
}

export const authAPI = new AuthAPI();