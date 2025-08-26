import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">💰</span>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">ExpenseTracker Pro</CardTitle>
          </div>
          <CardDescription className="text-gray-600">
            Personal expense management for couples with comprehensive tracking and reporting features.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Features include:</p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• Multi-user support for couples</li>
              <li>• Detailed income and expense tracking</li>
              <li>• Two-level expense categorization</li>
              <li>• Comprehensive reporting and analytics</li>
              <li>• Payment method tracking</li>
            </ul>
          </div>
          <Button
            className="w-full bg-primary hover:bg-blue-700 text-white"
            onClick={() => window.location.href = '/api/login'}
            data-testid="button-login"
          >
            Get Started
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
