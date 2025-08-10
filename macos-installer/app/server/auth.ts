import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { storage } from './storage';
import type { User, LoginData, RegisterData } from '@shared/schema';

export class AuthService {
  private static readonly SALT_ROUNDS = 12;
  private static readonly SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, this.SALT_ROUNDS);
  }

  // Verify password
  static async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  // Generate session token
  static generateSessionToken(): string {
    return randomBytes(32).toString('hex');
  }

  // Register new user
  static async register(data: RegisterData): Promise<{ user: User; token: string }> {
    // Check if user already exists
    const existingUser = await storage.getUserByEmail(data.email);
    if (existingUser) {
      throw new Error('Пользователь с таким email уже существует');
    }

    const existingUsername = await storage.getUserByUsername(data.username);
    if (existingUsername) {
      throw new Error('Пользователь с таким именем уже существует');
    }

    // Hash password
    const hashedPassword = await this.hashPassword(data.password);

    // Create user
    const user = await storage.createUser({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      settings: {}
    });

    // Create session
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);
    
    await storage.createSession({
      userId: user.id,
      token,
      expiresAt
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  // Login user
  static async login(data: LoginData): Promise<{ user: User; token: string }> {
    // Find user by email
    const user = await storage.getUserByEmail(data.email);
    if (!user) {
      throw new Error('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new Error('Аккаунт заблокирован');
    }

    // Verify password
    const isValidPassword = await this.verifyPassword(data.password, user.password);
    if (!isValidPassword) {
      throw new Error('Неверный email или пароль');
    }

    // Create session
    const token = this.generateSessionToken();
    const expiresAt = new Date(Date.now() + this.SESSION_DURATION);
    
    await storage.createSession({
      userId: user.id,
      token,
      expiresAt
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, token };
  }

  // Logout user
  static async logout(token: string): Promise<void> {
    await storage.deleteSession(token);
  }

  // Get user by session token
  static async getUserByToken(token: string): Promise<User | null> {
    const session = await storage.getSessionByToken(token);
    if (!session) {
      return null;
    }

    const user = await storage.getUser(session.userId);
    if (!user || !user.isActive) {
      return null;
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }

  // Middleware for authentication
  static async authenticate(token: string): Promise<User | null> {
    return this.getUserByToken(token);
  }
}