import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { IncomeWithRelations, ExpenseWithRelations } from "@shared/schema";

export default function RecentTransactions() {
  const { data: incomeData, isLoading: incomeLoading } = useQuery<IncomeWithRelations[]>({
    queryKey: ["/api/income"],
    select: (data) => data?.slice(0, 5) || [],
  });

  const { data: expenseData, isLoading: expenseLoading } = useQuery<ExpenseWithRelations[]>({
    queryKey: ["/api/expenses"],
    select: (data) => data?.slice(0, 5) || [],
  });

  // Combine and sort transactions by date
  const allTransactions = [
    ...(incomeData?.map(income => ({
      id: `income-${income.id}`,
      date: income.date,
      description: income.description || 'Income',
      category: income.category.name,
      paymentMethod: income.paymentMethod.name,
      amount: Number(income.amount),
      type: 'income' as const,
    })) || []),
    ...(expenseData?.map(expense => ({
      id: `expense-${expense.id}`,
      date: expense.date,
      description: expense.description || 'Expense',
      category: expense.category.name,
      paymentMethod: expense.paymentMethod.name,
      amount: Number(expense.amount),
      type: 'expense' as const,
    })) || []),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const isLoading = incomeLoading || expenseLoading;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle data-testid="text-recent-transactions-title">Recent Transactions</CardTitle>
          <div className="space-x-2">
            <Link href="/income">
              <Button variant="outline" size="sm" data-testid="button-view-all-income">
                View All Income
              </Button>
            </Link>
            <Link href="/expenses">
              <Button variant="outline" size="sm" data-testid="button-view-all-expenses">
                View All Expenses
              </Button>
            </Link>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-gray-500">Loading transactions...</p>
          </div>
        ) : allTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allTransactions.map((transaction) => (
                  <TableRow key={transaction.id} data-testid={`row-transaction-${transaction.id}`}>
                    <TableCell data-testid={`text-transaction-date-${transaction.id}`}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell data-testid={`text-transaction-description-${transaction.id}`}>
                      {transaction.description}
                    </TableCell>
                    <TableCell data-testid={`text-transaction-category-${transaction.id}`}>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'income' 
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {transaction.category}
                      </span>
                    </TableCell>
                    <TableCell data-testid={`text-transaction-payment-${transaction.id}`}>
                      {transaction.paymentMethod}
                    </TableCell>
                    <TableCell 
                      className={`text-right font-medium ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                      data-testid={`text-transaction-amount-${transaction.id}`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}₹{transaction.amount.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-gray-500 text-sm" data-testid="text-no-transactions">
              No transactions found. Start by adding your income and expenses!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
