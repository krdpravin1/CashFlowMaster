import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import UserSwitcher from "@/components/ui/user-switcher";

const navigation = [
  { name: "Dashboard", href: "/", icon: "📊" },
  { name: "Income", href: "/income", icon: "📈" },
  { name: "Expenses", href: "/expenses", icon: "📉" },
  { name: "Reports", href: "/reports", icon: "📋" },
  { name: "Categories", href: "/categories", icon: "🏷️" },
];

export default function MobileHeader() {
  const [location] = useLocation();
  const [selectedUser, setSelectedUser] = useState("current");
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden bg-white border-b border-gray-200 px-4 py-2">
      <div className="flex items-center justify-between">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" data-testid="button-mobile-menu">
              <span className="text-lg">☰</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64">
            <div className="flex flex-col h-full">
              {/* Logo */}
              <div className="flex items-center space-x-2 p-4 border-b border-gray-200">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-lg">💰</span>
                </div>
                <span className="text-lg font-semibold text-gray-900" data-testid="text-mobile-app-title">ExpenseTracker</span>
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
                        onClick={() => setOpen(false)}
                        data-testid={`mobile-nav-${item.name.toLowerCase()}`}
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
                  data-testid="button-mobile-logout"
                >
                  Logout
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-lg">💰</span>
          </div>
          <span className="text-lg font-semibold text-gray-900" data-testid="text-header-app-title">ExpenseTracker</span>
        </div>
        
        <div className="w-8"></div>
      </div>
    </div>
  );
}
