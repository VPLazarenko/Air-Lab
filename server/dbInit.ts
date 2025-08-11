import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";

/**
 * Initialize database with admin user only
 */
export async function initializeDatabase() {
  try {
    console.log("🔄 Инициализация базы данных...");
    
    // Create admin account for platform access
    const adminUser = await db.select().from(users).where(eq(users.username, "admin")).limit(1);
    if (adminUser.length === 0) {
      const hashedPassword = await bcrypt.hash("111111", 10);
      await db.insert(users).values({
        username: "admin",
        email: "admin@admin.ru",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isActive: true,
        plan: "premium",
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log("🔐 Админский аккаунт создан (admin@admin.ru / 111111)");
    }

    console.log("✅ Инициализация базы данных завершена");
    
    return {
      adminCreated: adminUser.length === 0
    };

  } catch (error) {
    console.error("❌ Ошибка инициализации базы данных:", error);
    throw error;
  }
}