import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  topExpenseCategories: Array<{ categoryName: string; amount: number; percentage: number }>;
}

export default function ExpenseCategories() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  const colors = ['bg-red-500', 'bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-purple-500'];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-expense-categories-title">Top Expense Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-8"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const categories = summary?.topExpenseCategories || [];

  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-expense-categories-title">Top Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categories.length > 0 ? (
            categories.map((category, index) => (
              <div key={category.categoryName} className="flex items-center justify-between" data-testid={`category-${index}`}>
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 ${colors[index % colors.length]} rounded-full`}></div>
                  <span className="text-sm font-medium text-gray-900" data-testid={`text-category-name-${index}`}>
                    {category.categoryName}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900" data-testid={`text-category-amount-${index}`}>
                    ₹{category.amount.toLocaleString()}
                  </span>
                  <div className="text-xs text-gray-500" data-testid={`text-category-percentage-${index}`}>
                    {category.percentage}%
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500" data-testid="text-no-categories">
                No expense data available for this month
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
