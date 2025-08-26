import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import AddIncomeModal from "@/components/forms/add-income-modal";
import type { IncomeWithRelations } from "@shared/schema";

export default function Income() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [showIncomeModal, setShowIncomeModal] = useState(false);

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

  const { data: incomeData, isLoading: incomeLoading, error } = useQuery<IncomeWithRelations[]>({
    queryKey: ["/api/income"],
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error as Error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">Income</h1>
              <p className="text-sm text-gray-600" data-testid="text-page-description">Track your income sources</p>
            </div>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={() => setShowIncomeModal(true)}
              data-testid="button-add-income"
            >
              <span className="mr-2">+</span>
              Add Income
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle data-testid="text-income-list-title">Income Records</CardTitle>
            </CardHeader>
            <CardContent>
              {incomeLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Loading income records...</p>
                </div>
              ) : incomeData && incomeData.length > 0 ? (
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
                      {incomeData.map((income) => (
                        <TableRow key={income.id} data-testid={`row-income-${income.id}`}>
                          <TableCell data-testid={`text-date-${income.id}`}>
                            {new Date(income.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell data-testid={`text-description-${income.id}`}>
                            {income.description || '-'}
                          </TableCell>
                          <TableCell data-testid={`text-category-${income.id}`}>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              {income.category.name}
                            </span>
                          </TableCell>
                          <TableCell data-testid={`text-payment-method-${income.id}`}>
                            {income.paymentMethod.name}
                          </TableCell>
                          <TableCell className="text-right font-medium text-green-600" data-testid={`text-amount-${income.id}`}>
                            +₹{Number(income.amount).toLocaleString()}
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
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-sm" data-testid="text-no-income">
                    No income records found. Add your first income entry!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal */}
      <AddIncomeModal 
        open={showIncomeModal} 
        onOpenChange={setShowIncomeModal} 
      />
    </div>
  );
}
