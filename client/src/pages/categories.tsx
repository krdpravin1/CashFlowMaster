import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { IncomeCategory, ExpenseCategory, ExpenseSubcategory, PaymentMethod } from "@shared/schema";

export default function Categories() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [newIncomeCategoryName, setNewIncomeCategoryName] = useState('');
  const [newIncomeEarnerName, setNewIncomeEarnerName] = useState('');
  const [newExpenseCategoryName, setNewExpenseCategoryName] = useState('');
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [selectedParentCategory, setSelectedParentCategory] = useState<string>('');
  const [newPaymentMethodName, setNewPaymentMethodName] = useState('');

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Fetch data
  const { data: incomeCategories, error: incomeCategoriesError } = useQuery<IncomeCategory[]>({
    queryKey: ["/api/income-categories"],
    enabled: isAuthenticated,
  });

  const { data: expenseCategories, error: expenseCategoriesError } = useQuery<ExpenseCategory[]>({
    queryKey: ["/api/expense-categories"],
    enabled: isAuthenticated,
  });

  const { data: expenseSubcategories, error: expenseSubcategoriesError } = useQuery<ExpenseSubcategory[]>({
    queryKey: ["/api/expense-subcategories"],
    enabled: isAuthenticated,
  });

  const { data: paymentMethods, error: paymentMethodsError } = useQuery<PaymentMethod[]>({
    queryKey: ["/api/payment-methods"],
    enabled: isAuthenticated,
  });

  // Handle errors
  useEffect(() => {
    const errors = [incomeCategoriesError, expenseCategoriesError, expenseSubcategoriesError, paymentMethodsError];
    for (const error of errors) {
      if (error && isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        break;
      }
    }
  }, [incomeCategoriesError, expenseCategoriesError, expenseSubcategoriesError, paymentMethodsError, toast]);

  // Mutations
  const createIncomeCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; incomeEarnerName?: string }) => {
      await apiRequest('POST', '/api/income-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/income-categories'] });
      setNewIncomeCategoryName('');
      setNewIncomeEarnerName('');
      toast({
        title: "Success",
        description: "Income category created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create income category",
        variant: "destructive",
      });
    },
  });

  const createExpenseCategoryMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      await apiRequest('POST', '/api/expense-categories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-categories'] });
      setNewExpenseCategoryName('');
      toast({
        title: "Success",
        description: "Expense category created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create expense category",
        variant: "destructive",
      });
    },
  });

  const createExpenseSubcategoryMutation = useMutation({
    mutationFn: async (data: { name: string; categoryId: number }) => {
      await apiRequest('POST', '/api/expense-subcategories', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/expense-subcategories'] });
      setNewSubcategoryName('');
      setSelectedParentCategory('');
      toast({
        title: "Success",
        description: "Expense subcategory created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create expense subcategory",
        variant: "destructive",
      });
    },
  });

  const createPaymentMethodMutation = useMutation({
    mutationFn: async (data: { name: string }) => {
      await apiRequest('POST', '/api/payment-methods', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/payment-methods'] });
      setNewPaymentMethodName('');
      toast({
        title: "Success",
        description: "Payment method created successfully",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error as Error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create payment method",
        variant: "destructive",
      });
    },
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <MobileHeader />
        
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">Categories & Settings</h1>
            <p className="text-sm text-gray-600" data-testid="text-page-description">Manage your income categories, expense categories, and payment methods</p>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Income Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600" data-testid="text-income-categories-title">Income Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new income category */}
                <div className="space-y-3">
                  <Label className="text-base font-medium">Add New Income Category</Label>
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="income-category" className="text-sm text-gray-600">Category Name</Label>
                      <Input
                        id="income-category"
                        placeholder="e.g., Salary, Freelance, Rental Income"
                        value={newIncomeCategoryName}
                        onChange={(e) => setNewIncomeCategoryName(e.target.value)}
                        data-testid="input-new-income-category"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="income-earner" className="text-sm text-gray-600">Income Earner Name (Optional)</Label>
                      <Input
                        id="income-earner"
                        placeholder="e.g., John Doe, Jane Smith"
                        value={newIncomeEarnerName}
                        onChange={(e) => setNewIncomeEarnerName(e.target.value)}
                        data-testid="input-income-earner-name"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={() => createIncomeCategoryMutation.mutate({ 
                        name: newIncomeCategoryName,
                        incomeEarnerName: newIncomeEarnerName.trim() || undefined
                      })}
                      disabled={!newIncomeCategoryName.trim() || createIncomeCategoryMutation.isPending}
                      data-testid="button-add-income-category"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {createIncomeCategoryMutation.isPending ? 'Adding...' : 'Add Income Category'}
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* List existing income categories */}
                <div className="space-y-3">
                  <h4 className="font-medium text-base">Existing Income Categories</h4>
                  {incomeCategories && incomeCategories.length > 0 ? (
                    <div className="space-y-2">
                      {incomeCategories.map((category) => (
                        <div key={category.id} className="p-3 bg-green-50 border border-green-200 rounded-lg" data-testid={`category-income-${category.id}`}>
                          <div className="font-medium text-green-800">{category.name}</div>
                          {category.incomeEarnerName && (
                            <div className="text-sm text-green-600 mt-1">
                              Earner: {category.incomeEarnerName}
                            </div>
                          )}
                          {category.description && (
                            <div className="text-sm text-gray-600 mt-1">{category.description}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500" data-testid="text-no-income-categories">No income categories found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600" data-testid="text-expense-categories-title">Expense Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new expense category */}
                <div className="space-y-2">
                  <Label htmlFor="expense-category">Add New Expense Category</Label>
                  <div className="flex gap-2">
                    <Input
                      id="expense-category"
                      placeholder="Category name"
                      value={newExpenseCategoryName}
                      onChange={(e) => setNewExpenseCategoryName(e.target.value)}
                      data-testid="input-new-expense-category"
                    />
                    <Button
                      onClick={() => createExpenseCategoryMutation.mutate({ name: newExpenseCategoryName })}
                      disabled={!newExpenseCategoryName.trim() || createExpenseCategoryMutation.isPending}
                      data-testid="button-add-expense-category"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* List existing expense categories */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Existing Categories</h4>
                  {expenseCategories && expenseCategories.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {expenseCategories.map((category) => (
                        <div key={category.id} className="p-2 bg-red-50 rounded text-sm" data-testid={`category-expense-${category.id}`}>
                          {category.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500" data-testid="text-no-expense-categories">No expense categories found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Expense Subcategories */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600" data-testid="text-expense-subcategories-title">Expense Subcategories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new expense subcategory */}
                <div className="space-y-2">
                  <Label htmlFor="expense-subcategory">Add New Expense Subcategory</Label>
                  <Select value={selectedParentCategory} onValueChange={setSelectedParentCategory}>
                    <SelectTrigger data-testid="select-parent-category">
                      <SelectValue placeholder="Select parent category" />
                    </SelectTrigger>
                    <SelectContent>
                      {expenseCategories?.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Input
                      id="expense-subcategory"
                      placeholder="Subcategory name"
                      value={newSubcategoryName}
                      onChange={(e) => setNewSubcategoryName(e.target.value)}
                      data-testid="input-new-expense-subcategory"
                    />
                    <Button
                      onClick={() => createExpenseSubcategoryMutation.mutate({ 
                        name: newSubcategoryName, 
                        categoryId: parseInt(selectedParentCategory) 
                      })}
                      disabled={!newSubcategoryName.trim() || !selectedParentCategory || createExpenseSubcategoryMutation.isPending}
                      data-testid="button-add-expense-subcategory"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* List existing expense subcategories */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Existing Subcategories</h4>
                  {expenseSubcategories && expenseSubcategories.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                      {expenseSubcategories.map((subcategory) => (
                        <div key={subcategory.id} className="p-2 bg-orange-50 rounded text-sm" data-testid={`subcategory-expense-${subcategory.id}`}>
                          {subcategory.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500" data-testid="text-no-expense-subcategories">No expense subcategories found</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Payment Methods */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600" data-testid="text-payment-methods-title">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Add new payment method */}
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Add New Payment Method</Label>
                  <div className="flex gap-2">
                    <Input
                      id="payment-method"
                      placeholder="Payment method name"
                      value={newPaymentMethodName}
                      onChange={(e) => setNewPaymentMethodName(e.target.value)}
                      data-testid="input-new-payment-method"
                    />
                    <Button
                      onClick={() => createPaymentMethodMutation.mutate({ name: newPaymentMethodName })}
                      disabled={!newPaymentMethodName.trim() || createPaymentMethodMutation.isPending}
                      data-testid="button-add-payment-method"
                    >
                      Add
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                {/* List existing payment methods */}
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Existing Payment Methods</h4>
                  {paymentMethods && paymentMethods.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="p-2 bg-blue-50 rounded text-sm" data-testid={`method-payment-${method.id}`}>
                          {method.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500" data-testid="text-no-payment-methods">No payment methods found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
