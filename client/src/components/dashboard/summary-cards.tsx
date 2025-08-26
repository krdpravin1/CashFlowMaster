import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topExpenseCategories: Array<{ categoryName: string; amount: number; percentage: number }>;
}

export default function SummaryCards() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-200 rounded-md"></div>
                  <div className="ml-4 flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const totalIncome = summary?.totalIncome || 0;
  const totalExpenses = summary?.totalExpenses || 0;
  const netSavings = summary?.netSavings || 0;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {/* Total Income Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">↑</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500" data-testid="text-total-income-label">Total Income</h3>
              <p className="text-2xl font-semibold text-gray-900" data-testid="text-total-income">
                ₹{totalIncome.toLocaleString()}
              </p>
              <p className="text-xs text-green-600" data-testid="text-income-trend">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Expenses Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-red-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">↓</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500" data-testid="text-total-expenses-label">Total Expenses</h3>
              <p className="text-2xl font-semibold text-gray-900" data-testid="text-total-expenses">
                ₹{totalExpenses.toLocaleString()}
              </p>
              <p className="text-xs text-red-600" data-testid="text-expenses-trend">This month</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Savings Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">🏦</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500" data-testid="text-net-savings-label">Net Savings</h3>
              <p className="text-2xl font-semibold text-gray-900" data-testid="text-net-savings">
                ₹{netSavings.toLocaleString()}
              </p>
              <p className="text-xs text-green-600" data-testid="text-savings-rate">
                {savingsRate}% savings rate
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Savings Goal Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-600 rounded-md flex items-center justify-center">
                <span className="text-white text-sm">🎯</span>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-500" data-testid="text-savings-goal-label">Monthly Goal</h3>
              <p className="text-2xl font-semibold text-gray-900" data-testid="text-savings-goal">
                ₹{Math.max(60000, netSavings).toLocaleString()}
              </p>
              <p className="text-xs text-orange-600" data-testid="text-goal-progress">
                {netSavings > 0 ? Math.min(100, Math.round((netSavings / 60000) * 100)) : 0}% achieved
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
