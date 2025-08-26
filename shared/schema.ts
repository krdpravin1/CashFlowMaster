import { sql } from 'drizzle-orm';
import { relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  text,
  timestamp,
  varchar,
  decimal,
  date,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User settings table
export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  financialYearStart: varchar("financial_year_start", { length: 5 }).notNull().default("04-01"), // MM-DD format
  financialYearEnd: varchar("financial_year_end", { length: 5 }).notNull().default("03-31"), // MM-DD format
  currency: varchar("currency", { length: 10 }).notNull().default("USD"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Income categories
export const incomeCategories = pgTable("income_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  incomeEarnerName: varchar("income_earner_name", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expense categories (main categories)
export const expenseCategories = pgTable("expense_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Expense subcategories
export const expenseSubcategories = pgTable("expense_subcategories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  categoryId: serial("category_id").notNull().references(() => expenseCategories.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Payment methods
export const paymentMethods = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 50 }).notNull().unique(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Income records
export const income = pgTable("income", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: serial("category_id").notNull().references(() => incomeCategories.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  paymentMethodId: serial("payment_method_id").notNull().references(() => paymentMethods.id),
  financialYear: varchar("financial_year", { length: 10 }).notNull(),
  month: varchar("month", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense records
export const expenses = pgTable("expenses", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  categoryId: serial("category_id").notNull().references(() => expenseCategories.id),
  subcategoryId: serial("subcategory_id").references(() => expenseSubcategories.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  description: text("description"),
  date: date("date").notNull(),
  paymentMethodId: serial("payment_method_id").notNull().references(() => paymentMethods.id),
  financialYear: varchar("financial_year", { length: 10 }).notNull(),
  month: varchar("month", { length: 20 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  income: many(income),
  expenses: many(expenses),
  settings: one(userSettings),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
  user: one(users, {
    fields: [userSettings.userId],
    references: [users.id],
  }),
}));

export const incomeCategoriesRelations = relations(incomeCategories, ({ many }) => ({
  income: many(income),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
  subcategories: many(expenseSubcategories),
}));

export const expenseSubcategoriesRelations = relations(expenseSubcategories, ({ one, many }) => ({
  category: one(expenseCategories, {
    fields: [expenseSubcategories.categoryId],
    references: [expenseCategories.id],
  }),
  expenses: many(expenses),
}));

export const paymentMethodsRelations = relations(paymentMethods, ({ many }) => ({
  income: many(income),
  expenses: many(expenses),
}));

export const incomeRelations = relations(income, ({ one }) => ({
  user: one(users, {
    fields: [income.userId],
    references: [users.id],
  }),
  category: one(incomeCategories, {
    fields: [income.categoryId],
    references: [incomeCategories.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [income.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

export const expensesRelations = relations(expenses, ({ one }) => ({
  user: one(users, {
    fields: [expenses.userId],
    references: [users.id],
  }),
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  subcategory: one(expenseSubcategories, {
    fields: [expenses.subcategoryId],
    references: [expenseSubcategories.id],
  }),
  paymentMethod: one(paymentMethods, {
    fields: [expenses.paymentMethodId],
    references: [paymentMethods.id],
  }),
}));

// Insert schemas
export const insertIncomeCategorySchema = createInsertSchema(incomeCategories).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseCategorySchema = createInsertSchema(expenseCategories).omit({
  id: true,
  createdAt: true,
});

export const insertExpenseSubcategorySchema = createInsertSchema(expenseSubcategories).omit({
  id: true,
  createdAt: true,
});

export const insertPaymentMethodSchema = createInsertSchema(paymentMethods).omit({
  id: true,
  createdAt: true,
});

export const insertIncomeSchema = createInsertSchema(income).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertIncomeCategory = z.infer<typeof insertIncomeCategorySchema>;
export type IncomeCategory = typeof incomeCategories.$inferSelect;

export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
export type UserSettings = typeof userSettings.$inferSelect;

export type InsertExpenseCategory = z.infer<typeof insertExpenseCategorySchema>;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;

export type InsertExpenseSubcategory = z.infer<typeof insertExpenseSubcategorySchema>;
export type ExpenseSubcategory = typeof expenseSubcategories.$inferSelect;

export type InsertPaymentMethod = z.infer<typeof insertPaymentMethodSchema>;
export type PaymentMethod = typeof paymentMethods.$inferSelect;

export type InsertIncome = z.infer<typeof insertIncomeSchema>;
export type Income = typeof income.$inferSelect;

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;

// Extended types with relations
export type IncomeWithRelations = Income & {
  category: IncomeCategory;
  paymentMethod: PaymentMethod;
};

export type ExpenseWithRelations = Expense & {
  category: ExpenseCategory;
  subcategory?: ExpenseSubcategory;
  paymentMethod: PaymentMethod;
};
