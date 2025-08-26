import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import UserSwitcher from "@/components/ui/user-switcher";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Income", href: "/income", icon: "📈" },
  { name: "Expenses", href: "/expenses", icon: "📉" },
  { name: "Reports", href: "/reports", icon: "📋" },
  { name: "Categories", href: "/categories", icon: "🏷️" },
  { name: "Settings", href: "/settings", icon: "⚙️" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [selectedUser, setSelectedUser] = useState("current");

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64 bg-white border-r border-gray-200">
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white text-lg">💰</span>
            </div>
            <span className="text-lg font-semibold text-gray-900" data-testid="text-app-title">ExpenseTracker</span>
          </div>
        </div>
        
        {/* User Switcher */}
        <div className="p-4 border-b border-gray-200">
          <UserSwitcher value={selectedUser} onValueChange={setSelectedUser} />
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-4 space-y-2">
          {navigation.map((item) => {
            const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
            
            return (
              <Link key={item.name} href={item.href}>
                <div 
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer",
                    isActive
                      ? "text-white bg-primary"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                  data-testid={`nav-${item.name.toLowerCase()}`}
                >
                  <span className="mr-3 text-sm">{item.icon}</span>
                  {item.name}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-gray-200">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = '/api/logout'}
            data-testid="button-logout"
          >
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
