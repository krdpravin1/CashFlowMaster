import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/layout/sidebar";
import MobileHeader from "@/components/layout/mobile-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Save, Calendar, DollarSign } from "lucide-react";
import type { UserSettings } from "@shared/schema";

export default function SettingsPage() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  
  const [financialYearStart, setFinancialYearStart] = useState("04-01");
  const [financialYearEnd, setFinancialYearEnd] = useState("03-31");
  const [currency, setCurrency] = useState("USD");

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

  // Fetch user settings
  const { data: userSettings, isLoading: settingsLoading } = useQuery<UserSettings>({
    queryKey: ['/api/user-settings'],
    retry: false,
  });

  // Update local state when settings are loaded
  useEffect(() => {
    if (userSettings) {
      setFinancialYearStart(userSettings.financialYearStart);
      setFinancialYearEnd(userSettings.financialYearEnd);
      setCurrency(userSettings.currency);
    }
  }, [userSettings]);

  // Save settings mutation
  const saveSettings = useMutation({
    mutationFn: async (data: { financialYearStart: string; financialYearEnd: string; currency: string }) => {
      return await fetch('/api/user-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      }).then(res => res.json());
    },
    onSuccess: () => {
      toast({
        title: "Settings Updated",
        description: "Your preferences have been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/user-settings'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
      console.error("Error saving settings:", error);
    },
  });

  const handleSave = () => {
    saveSettings.mutate({
      financialYearStart,
      financialYearEnd,
      currency,
    });
  };

  const monthOptions = [
    { value: "01-01", label: "January 1st" },
    { value: "04-01", label: "April 1st (India)" },
    { value: "07-01", label: "July 1st (Australia)" },
    { value: "10-01", label: "October 1st" },
  ];

  const currencyOptions = [
    { value: "USD", label: "US Dollar ($)" },
    { value: "EUR", label: "Euro (€)" },
    { value: "GBP", label: "British Pound (£)" },
    { value: "INR", label: "Indian Rupee (₹)" },
    { value: "AUD", label: "Australian Dollar (A$)" },
    { value: "CAD", label: "Canadian Dollar (C$)" },
    { value: "JPY", label: "Japanese Yen (¥)" },
  ];

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
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-gray-200 px-6 py-6">
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-xl">
              <Settings className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900" data-testid="text-page-title">Settings</h1>
              <p className="text-sm text-gray-600" data-testid="text-page-description">Configure your financial year and preferences</p>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-auto p-6 bg-gray-50/50">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Financial Year Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">Financial Year Configuration</CardTitle>
                    <CardDescription className="text-gray-600">
                      Set your financial year period. This affects reporting and year-to-date calculations.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fy-start" className="text-sm font-medium text-gray-700">
                      Financial Year Starts
                    </Label>
                    <Select value={financialYearStart} onValueChange={setFinancialYearStart}>
                      <SelectTrigger className="bg-white border-gray-300" data-testid="select-fy-start">
                        <SelectValue placeholder="Select start date" />
                      </SelectTrigger>
                      <SelectContent>
                        {monthOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fy-end" className="text-sm font-medium text-gray-700">
                      Financial Year Ends
                    </Label>
                    <Select value={financialYearEnd} onValueChange={setFinancialYearEnd}>
                      <SelectTrigger className="bg-white border-gray-300" data-testid="select-fy-end">
                        <SelectValue placeholder="Select end date" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="03-31">March 31st</SelectItem>
                        <SelectItem value="06-30">June 30th</SelectItem>
                        <SelectItem value="09-30">September 30th</SelectItem>
                        <SelectItem value="12-31">December 31st</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <Calendar className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-900">Financial Year Examples</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        • India: April 1st to March 31st<br />
                        • US/UK: January 1st to December 31st<br />
                        • Australia: July 1st to June 30th
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Currency Settings */}
            <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <div>
                    <CardTitle className="text-xl text-gray-900">Currency Preferences</CardTitle>
                    <CardDescription className="text-gray-600">
                      Choose your primary currency for transactions and reports.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currency" className="text-sm font-medium text-gray-700">
                    Primary Currency
                  </Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="bg-white border-gray-300 max-w-md" data-testid="select-currency">
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Card className="shadow-lg border-0 bg-gradient-to-r from-green-50 to-emerald-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Save Changes</h3>
                    <p className="text-sm text-gray-600">Click save to update your preferences</p>
                  </div>
                  <Button
                    onClick={handleSave}
                    disabled={saveSettings.isPending || settingsLoading}
                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl hover:scale-105"
                    data-testid="button-save-settings"
                  >
                    {saveSettings.isPending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    Save Settings
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