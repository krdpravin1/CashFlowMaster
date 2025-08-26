import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertIncomeSchema,
  insertExpenseSchema,
  insertIncomeCategorySchema,
  insertExpenseCategorySchema,
  insertExpenseSubcategorySchema,
  insertPaymentMethodSchema,
  insertUserSettingsSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default data on startup
  await storage.initializeDefaultData();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
  
  // User settings routes
  app.get('/api/user-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getUserSettings(userId);
      if (!settings) {
        // Create default settings if none exist
        const defaultSettings = await storage.upsertUserSettings({
          userId,
          financialYearStart: "04-01",
          financialYearEnd: "03-31",
          currency: "USD",
        });
        res.json(defaultSettings);
      } else {
        res.json(settings);
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });
  
  app.put('/api/user-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertUserSettingsSchema.parse({ ...req.body, userId });
      const settings = await storage.upsertUserSettings(validatedData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating user settings:", error);
      res.status(500).json({ message: "Failed to update user settings" });
    }
  });

  // Category routes
  app.get('/api/income-categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getIncomeCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching income categories:", error);
      res.status(500).json({ message: "Failed to fetch income categories" });
    }
  });

  app.post('/api/income-categories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertIncomeCategorySchema.parse(req.body);
      const category = await storage.createIncomeCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating income category:", error);
      res.status(500).json({ message: "Failed to create income category" });
    }
  });

  app.get('/api/expense-categories', isAuthenticated, async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching expense categories:", error);
      res.status(500).json({ message: "Failed to fetch expense categories" });
    }
  });

  app.post('/api/expense-categories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExpenseCategorySchema.parse(req.body);
      const category = await storage.createExpenseCategory(validatedData);
      res.json(category);
    } catch (error) {
      console.error("Error creating expense category:", error);
      res.status(500).json({ message: "Failed to create expense category" });
    }
  });

  app.get('/api/expense-subcategories', isAuthenticated, async (req, res) => {
    try {
      const categoryId = req.query.categoryId as string;
      if (categoryId) {
        const subcategories = await storage.getExpenseSubcategories(parseInt(categoryId));
        res.json(subcategories);
      } else {
        const subcategories = await storage.getAllExpenseSubcategories();
        res.json(subcategories);
      }
    } catch (error) {
      console.error("Error fetching expense subcategories:", error);
      res.status(500).json({ message: "Failed to fetch expense subcategories" });
    }
  });

  app.post('/api/expense-subcategories', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertExpenseSubcategorySchema.parse(req.body);
      const subcategory = await storage.createExpenseSubcategory(validatedData);
      res.json(subcategory);
    } catch (error) {
      console.error("Error creating expense subcategory:", error);
      res.status(500).json({ message: "Failed to create expense subcategory" });
    }
  });

  // Payment methods routes
  app.get('/api/payment-methods', isAuthenticated, async (req, res) => {
    try {
      const methods = await storage.getPaymentMethods();
      res.json(methods);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      res.status(500).json({ message: "Failed to fetch payment methods" });
    }
  });

  app.post('/api/payment-methods', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPaymentMethodSchema.parse(req.body);
      const method = await storage.createPaymentMethod(validatedData);
      res.json(method);
    } catch (error) {
      console.error("Error creating payment method:", error);
      res.status(500).json({ message: "Failed to create payment method" });
    }
  });

  // Income routes
  app.get('/api/income', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const income = await storage.getIncomeByUser(userId, limit);
      res.json(income);
    } catch (error) {
      console.error("Error fetching income:", error);
      res.status(500).json({ message: "Failed to fetch income" });
    }
  });

  app.post('/api/income', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const incomeDate = new Date(req.body.date);
      
      // Calculate financial year and month
      const financialYear = incomeDate.getMonth() >= 3 
        ? incomeDate.getFullYear().toString() 
        : (incomeDate.getFullYear() - 1).toString();
      const month = incomeDate.toLocaleString('default', { month: 'long' });

      const validatedData = insertIncomeSchema.parse({
        ...req.body,
        userId,
        financialYear,
        month
      });
      
      const income = await storage.createIncome(validatedData);
      res.json(income);
    } catch (error) {
      console.error("Error creating income:", error);
      res.status(500).json({ message: "Failed to create income" });
    }
  });

  // Expense routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const expenses = await storage.getExpensesByUser(userId, limit);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const expenseDate = new Date(req.body.date);
      
      // Calculate financial year and month
      const financialYear = expenseDate.getMonth() >= 3 
        ? expenseDate.getFullYear().toString() 
        : (expenseDate.getFullYear() - 1).toString();
      const month = expenseDate.toLocaleString('default', { month: 'long' });

      const validatedData = insertExpenseSchema.parse({
        ...req.body,
        userId,
        financialYear,
        month
      });
      
      const expense = await storage.createExpense(validatedData);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard/summary', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const month = req.query.month as string;
      const year = req.query.year as string;
      
      const summary = await storage.getDashboardSummary(userId, month, year);
      res.json(summary);
    } catch (error) {
      console.error("Error fetching dashboard summary:", error);
      res.status(500).json({ message: "Failed to fetch dashboard summary" });
    }
  });

  // Reports routes
  app.get('/api/reports/income', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const income = await storage.getIncomeByDateRange(userId, startDate, endDate);
      res.json(income);
    } catch (error) {
      console.error("Error fetching income report:", error);
      res.status(500).json({ message: "Failed to fetch income report" });
    }
  });

  app.get('/api/reports/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }
      
      const expenses = await storage.getExpensesByDateRange(userId, startDate, endDate);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses report:", error);
      res.status(500).json({ message: "Failed to fetch expenses report" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
