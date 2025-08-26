import {
  users,
  userSettings,
  incomeCategories,
  expenseCategories,
  expenseSubcategories,
  paymentMethods,
  income,
  expenses,
  type User,
  type UpsertUser,
  type InsertUserSettings,
  type UserSettings,
  type InsertIncomeCategory,
  type IncomeCategory,
  type InsertExpenseCategory,
  type ExpenseCategory,
  type InsertExpenseSubcategory,
  type ExpenseSubcategory,
  type InsertPaymentMethod,
  type PaymentMethod,
  type InsertIncome,
  type Income,
  type InsertExpense,
  type Expense,
  type IncomeWithRelations,
  type ExpenseWithRelations,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // User settings operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  upsertUserSettings(settings: InsertUserSettings): Promise<UserSettings>;

  // Category operations
  getIncomeCategories(): Promise<IncomeCategory[]>;
  createIncomeCategory(category: InsertIncomeCategory): Promise<IncomeCategory>;
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory>;
  getExpenseSubcategories(categoryId: number): Promise<ExpenseSubcategory[]>;
  getAllExpenseSubcategories(): Promise<ExpenseSubcategory[]>;
  createExpenseSubcategory(subcategory: InsertExpenseSubcategory): Promise<ExpenseSubcategory>;

  // Payment method operations
  getPaymentMethods(): Promise<PaymentMethod[]>;
  createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod>;

  // Income operations
  getIncomeByUser(userId: string, limit?: number): Promise<IncomeWithRelations[]>;
  createIncome(incomeData: InsertIncome): Promise<Income>;
  getIncomeByDateRange(userId: string, startDate: string, endDate: string): Promise<IncomeWithRelations[]>;

  // Expense operations
  getExpensesByUser(userId: string, limit?: number): Promise<ExpenseWithRelations[]>;
  createExpense(expenseData: InsertExpense): Promise<Expense>;
  getExpensesByDateRange(userId: string, startDate: string, endDate: string): Promise<ExpenseWithRelations[]>;

  // Dashboard operations
  getDashboardSummary(userId: string, month?: string, year?: string): Promise<{
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    topExpenseCategories: Array<{ categoryName: string; amount: number; percentage: number }>;
  }>;

  // Initialization
  initializeDefaultData(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create default settings for new users
    await this.upsertUserSettings({
      userId: user.id,
      financialYearStart: "04-01",
      financialYearEnd: "03-31",
      currency: "USD",
    });
    
    return user;
  }
  
  // User settings operations
  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }
  
  async upsertUserSettings(settingsData: InsertUserSettings): Promise<UserSettings> {
    const [settings] = await db
      .insert(userSettings)
      .values(settingsData)
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          ...settingsData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return settings;
  }

  // Category operations
  async getIncomeCategories(): Promise<IncomeCategory[]> {
    return db.select().from(incomeCategories).orderBy(incomeCategories.name);
  }

  async createIncomeCategory(category: InsertIncomeCategory): Promise<IncomeCategory> {
    const [result] = await db.insert(incomeCategories).values(category).returning();
    return result;
  }

  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return db.select().from(expenseCategories).orderBy(expenseCategories.name);
  }

  async createExpenseCategory(category: InsertExpenseCategory): Promise<ExpenseCategory> {
    const [result] = await db.insert(expenseCategories).values(category).returning();
    return result;
  }

  async getExpenseSubcategories(categoryId: number): Promise<ExpenseSubcategory[]> {
    return db.select().from(expenseSubcategories)
      .where(eq(expenseSubcategories.categoryId, categoryId))
      .orderBy(expenseSubcategories.name);
  }

  async getAllExpenseSubcategories(): Promise<ExpenseSubcategory[]> {
    return db.select().from(expenseSubcategories).orderBy(expenseSubcategories.name);
  }

  async createExpenseSubcategory(subcategory: InsertExpenseSubcategory): Promise<ExpenseSubcategory> {
    const [result] = await db.insert(expenseSubcategories).values(subcategory).returning();
    return result;
  }

  // Payment method operations
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return db.select().from(paymentMethods).orderBy(paymentMethods.name);
  }

  async createPaymentMethod(method: InsertPaymentMethod): Promise<PaymentMethod> {
    const [result] = await db.insert(paymentMethods).values(method).returning();
    return result;
  }

  // Income operations
  async getIncomeByUser(userId: string, limit = 50): Promise<IncomeWithRelations[]> {
    return db.select()
      .from(income)
      .leftJoin(incomeCategories, eq(income.categoryId, incomeCategories.id))
      .leftJoin(paymentMethods, eq(income.paymentMethodId, paymentMethods.id))
      .where(eq(income.userId, userId))
      .orderBy(desc(income.date), desc(income.createdAt))
      .limit(limit)
      .then(results => results.map(row => ({
        ...row.income,
        category: row.income_categories!,
        paymentMethod: row.payment_methods!,
      })));
  }

  async createIncome(incomeData: InsertIncome): Promise<Income> {
    const [result] = await db.insert(income).values(incomeData).returning();
    return result;
  }

  async getIncomeByDateRange(userId: string, startDate: string, endDate: string): Promise<IncomeWithRelations[]> {
    return db.select()
      .from(income)
      .leftJoin(incomeCategories, eq(income.categoryId, incomeCategories.id))
      .leftJoin(paymentMethods, eq(income.paymentMethodId, paymentMethods.id))
      .where(and(
        eq(income.userId, userId),
        gte(income.date, startDate),
        lte(income.date, endDate)
      ))
      .orderBy(desc(income.date))
      .then(results => results.map(row => ({
        ...row.income,
        category: row.income_categories!,
        paymentMethod: row.payment_methods!,
      })));
  }

  // Expense operations
  async getExpensesByUser(userId: string, limit = 50): Promise<ExpenseWithRelations[]> {
    return db.select()
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .leftJoin(expenseSubcategories, eq(expenses.subcategoryId, expenseSubcategories.id))
      .leftJoin(paymentMethods, eq(expenses.paymentMethodId, paymentMethods.id))
      .where(eq(expenses.userId, userId))
      .orderBy(desc(expenses.date), desc(expenses.createdAt))
      .limit(limit)
      .then(results => results.map(row => ({
        ...row.expenses,
        category: row.expense_categories!,
        subcategory: row.expense_subcategories || undefined,
        paymentMethod: row.payment_methods!,
      })));
  }

  async createExpense(expenseData: InsertExpense): Promise<Expense> {
    const [result] = await db.insert(expenses).values(expenseData).returning();
    return result;
  }

  async getExpensesByDateRange(userId: string, startDate: string, endDate: string): Promise<ExpenseWithRelations[]> {
    return db.select()
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .leftJoin(expenseSubcategories, eq(expenses.subcategoryId, expenseSubcategories.id))
      .leftJoin(paymentMethods, eq(expenses.paymentMethodId, paymentMethods.id))
      .where(and(
        eq(expenses.userId, userId),
        gte(expenses.date, startDate),
        lte(expenses.date, endDate)
      ))
      .orderBy(desc(expenses.date))
      .then(results => results.map(row => ({
        ...row.expenses,
        category: row.expense_categories!,
        subcategory: row.expense_subcategories || undefined,
        paymentMethod: row.payment_methods!,
      })));
  }

  // Dashboard operations
  async getDashboardSummary(userId: string, month?: string, year?: string) {
    const currentDate = new Date();
    const targetMonth = month || currentDate.toLocaleString('default', { month: 'long' });
    const targetYear = year || currentDate.getFullYear().toString();

    // Get total income
    const totalIncomeResult = await db.select({
      total: sql<number>`COALESCE(SUM(${income.amount}), 0)::numeric`
    }).from(income)
    .where(and(
      eq(income.userId, userId),
      eq(income.month, targetMonth),
      eq(income.financialYear, targetYear)
    ));

    // Get total expenses
    const totalExpensesResult = await db.select({
      total: sql<number>`COALESCE(SUM(${expenses.amount}), 0)::numeric`
    }).from(expenses)
    .where(and(
      eq(expenses.userId, userId),
      eq(expenses.month, targetMonth),
      eq(expenses.financialYear, targetYear)
    ));

    const totalIncome = Number(totalIncomeResult[0]?.total || 0);
    const totalExpenses = Number(totalExpensesResult[0]?.total || 0);

    // Get top expense categories
    const topCategoriesResult = await db.select({
      categoryName: expenseCategories.name,
      amount: sql<number>`SUM(${expenses.amount})::numeric`
    }).from(expenses)
    .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
    .where(and(
      eq(expenses.userId, userId),
      eq(expenses.month, targetMonth),
      eq(expenses.financialYear, targetYear)
    ))
    .groupBy(expenseCategories.name)
    .orderBy(desc(sql`SUM(${expenses.amount})`))
    .limit(5);

    const topExpenseCategories = topCategoriesResult.map(row => ({
      categoryName: row.categoryName || 'Unknown',
      amount: Number(row.amount),
      percentage: totalExpenses > 0 ? Math.round((Number(row.amount) / totalExpenses) * 100) : 0
    }));

    return {
      totalIncome,
      totalExpenses,
      netSavings: totalIncome - totalExpenses,
      topExpenseCategories
    };
  }

  // Initialize default data
  async initializeDefaultData(): Promise<void> {
    // Check if data already exists
    const existingIncomeCategories = await this.getIncomeCategories();
    if (existingIncomeCategories.length > 0) return;

    // Default income categories
    const defaultIncomeCategories = [
      { name: 'Salary', description: 'Regular employment salary' },
      { name: 'Rental Income', description: 'Income from property rent' },
      { name: 'Dividend Income', description: 'Dividends from investments' },
      { name: 'Interest Income', description: 'Interest from savings and deposits' },
      { name: 'Business Income', description: 'Income from business activities' },
      { name: 'Freelance Income', description: 'Income from freelance work' },
      { name: 'Bonus', description: 'Performance bonus and incentives' },
      { name: 'Other Income', description: 'Other miscellaneous income' },
    ];

    // Default expense categories and subcategories
    const defaultExpenseCategories = [
      {
        name: 'Food & Dining',
        description: 'All food related expenses',
        subcategories: ['Grocery', 'Vegetables', 'Restaurants', 'Fast Food', 'Coffee Shops']
      },
      {
        name: 'Transportation',
        description: 'Travel and transportation expenses',
        subcategories: ['Fuel', 'Public Transport', 'Taxi/Uber', 'Vehicle Maintenance', 'Parking']
      },
      {
        name: 'Housing',
        description: 'Housing and accommodation expenses',
        subcategories: ['Rent', 'Mortgage', 'Property Tax', 'Home Maintenance', 'Furniture']
      },
      {
        name: 'Healthcare',
        description: 'Medical and health expenses',
        subcategories: ['Doctor Visits', 'Medicines', 'Health Insurance', 'Dental', 'Vision']
      },
      {
        name: 'Entertainment',
        description: 'Entertainment and leisure expenses',
        subcategories: ['Movies', 'Games', 'Books', 'Streaming Services', 'Events']
      },
      {
        name: 'Utilities',
        description: 'Utility bills and services',
        subcategories: ['Electricity', 'Water', 'Gas', 'Internet', 'Mobile Bill', 'Domestic Help']
      },
      {
        name: 'Insurance',
        description: 'Insurance premiums and policies',
        subcategories: ['Life Insurance', 'Health Insurance', 'Vehicle Insurance', 'Home Insurance']
      },
      {
        name: 'Education',
        description: 'Education and learning expenses',
        subcategories: ['School Fees', 'Books', 'Online Courses', 'Tuition', 'Supplies']
      },
      {
        name: 'Personal Care',
        description: 'Personal care and grooming',
        subcategories: ['Haircut', 'Cosmetics', 'Clothing', 'Gym', 'Spa']
      },
      {
        name: 'Kids Expenses',
        description: 'Children related expenses',
        subcategories: ['Toys', 'Clothes', 'School Activities', 'Sports', 'Healthcare']
      },
    ];

    // Default payment methods
    const defaultPaymentMethods = [
      { name: 'Cash', description: 'Cash payments' },
      { name: 'Credit Card', description: 'Credit card payments' },
      { name: 'Debit Card', description: 'Debit card payments' },
      { name: 'UPI', description: 'UPI and digital wallet payments' },
      { name: 'Net Banking', description: 'Online banking transfers' },
      { name: 'Bank Transfer', description: 'Direct bank transfers' },
      { name: 'Cheque', description: 'Cheque payments' },
      { name: 'Other', description: 'Other payment methods' },
    ];

    // Insert default data
    for (const category of defaultIncomeCategories) {
      await this.createIncomeCategory(category);
    }

    for (const category of defaultExpenseCategories) {
      const createdCategory = await this.createExpenseCategory({
        name: category.name,
        description: category.description
      });
      
      for (const subcategoryName of category.subcategories) {
        await this.createExpenseSubcategory({
          name: subcategoryName,
          categoryId: createdCategory.id
        });
      }
    }

    for (const method of defaultPaymentMethods) {
      await this.createPaymentMethod(method);
    }
  }
}

export const storage = new DatabaseStorage();
