import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MonthlyChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="text-monthly-chart-title">Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64 flex items-center justify-center bg-gray-50 rounded-md">
          <div className="text-center">
            <div className="text-4xl text-gray-400 mb-2">📊</div>
            <p className="text-sm text-gray-500" data-testid="text-chart-placeholder">
              Chart visualization will be implemented with a charting library
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Income vs Expenses trend over time
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
