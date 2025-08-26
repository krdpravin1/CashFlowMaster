import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import SummaryCards from "@/components/dashboard/summary-cards";
import MonthlyChart from "@/components/dashboard/monthly-chart";
import ExpenseCategories from "@/components/dashboard/expense-categories";
import RecentTransactions from "@/components/dashboard/recent-transactions";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import AddIncomeModal from "@/components/forms/add-income-modal";
import AddExpenseModal from "@/components/forms/add-expense-modal";
import { Calendar, TrendingUp, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  
  // Financial year and month filters
  const currentYear = new Date().getFullYear();
  const currentMonth = format(new Date(), 'MMMM');
  const [selectedFinancialYear, setSelectedFinancialYear] = useState(`${currentYear}-${currentYear + 1}`);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Get user settings for financial year configuration
  const { data: userSettings } = useQuery({
    queryKey: ['/api/user-settings'],
    retry: false,
  });
  
  // Generate financial year options based on user settings
  const generateFinancialYears = () => {
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
      years.push(`${i}-${i + 1}`);
    }
    return years;
  };
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

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
        
        {/* Enhanced Page Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="bg-blue-100 p-3 rounded-xl">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Dashboard</h1>
                <p className="text-sm text-gray-600" data-testid="text-page-description">Track your financial health and spending patterns</p>
              </div>
            </div>
            
            {/* Financial Year and Month Filters */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-700">Financial Year:</span>
                    </div>
                    <Select value={selectedFinancialYear} onValueChange={setSelectedFinancialYear}>
                      <SelectTrigger className="w-32 h-8 bg-white border-gray-300" data-testid="select-financial-year">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {generateFinancialYears().map((year) => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-md">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Month:</span>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-32 h-8 bg-white border-gray-300" data-testid="select-month">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month} value={month}>{month}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
              
              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <Button
                  className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  onClick={() => setShowIncomeModal(true)}
                  data-testid="button-add-income"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  Add Income
                </Button>
                <Button
                  className="bg-orange-600 hover:bg-orange-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                  onClick={() => setShowExpenseModal(true)}
                  data-testid="button-add-expense"
                >
                  <ArrowDownRight className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Main Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <SummaryCards />
          
          {/* Charts and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <MonthlyChart />
            <ExpenseCategories />
          </div>

          {/* Recent Transactions */}
          <RecentTransactions />
        </div>
      </div>

      {/* Modals */}
      <AddIncomeModal 
        open={showIncomeModal} 
        onOpenChange={setShowIncomeModal} 
      />
      <AddExpenseModal 
        open={showExpenseModal} 
        onOpenChange={setShowExpenseModal} 
      />
    </div>
  );
}
