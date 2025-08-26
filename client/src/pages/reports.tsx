import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Reports() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

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
        
        {/* Page Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900" data-testid="text-page-title">Reports</h1>
              <p className="text-sm text-gray-600" data-testid="text-page-description">Analyze your financial data with detailed reports</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Date Range Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle data-testid="text-date-range-title">Report Date Range</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    data-testid="input-start-date"
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    data-testid="input-end-date"
                  />
                </div>
                <Button 
                  className="bg-primary hover:bg-blue-700 text-white"
                  disabled={!startDate || !endDate}
                  data-testid="button-generate-report"
                >
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Report Types Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Income Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-green-600" data-testid="text-income-report-title">Income Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed breakdown of all income sources by category and payment method.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Income:</span>
                    <span className="font-medium text-green-600">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entries:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!startDate || !endDate}
                  data-testid="button-view-income-report"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Expense Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-red-600" data-testid="text-expense-report-title">Expense Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Complete expense analysis with category and subcategory breakdowns.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total Expenses:</span>
                    <span className="font-medium text-red-600">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Entries:</span>
                    <span className="font-medium">0</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!startDate || !endDate}
                  data-testid="button-view-expense-report"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Summary Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600" data-testid="text-summary-report-title">Summary Report</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Overall financial summary with savings rate and trends.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Net Savings:</span>
                    <span className="font-medium text-blue-600">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Savings Rate:</span>
                    <span className="font-medium">0%</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!startDate || !endDate}
                  data-testid="button-view-summary-report"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Payment Method Report */}
            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600" data-testid="text-payment-report-title">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Breakdown of transactions by payment method for better credit card management.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Credit Card:</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Cash:</span>
                    <span className="font-medium">₹0</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!startDate || !endDate}
                  data-testid="button-view-payment-report"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-orange-600" data-testid="text-trends-report-title">Monthly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Month-over-month analysis of income and expense patterns.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Avg Monthly Income:</span>
                    <span className="font-medium">₹0</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg Monthly Expenses:</span>
                    <span className="font-medium">₹0</span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  disabled={!startDate || !endDate}
                  data-testid="button-view-trends-report"
                >
                  View Details
                </Button>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="text-gray-600" data-testid="text-export-title">Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Export your financial data in various formats for external analysis.
                </p>
                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!startDate || !endDate}
                    data-testid="button-export-csv"
                  >
                    Export to CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    disabled={!startDate || !endDate}
                    data-testid="button-export-pdf"
                  >
                    Export to PDF
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
