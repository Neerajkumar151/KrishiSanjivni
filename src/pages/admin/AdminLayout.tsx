import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sprout, LayoutDashboard, Tractor, Warehouse, TestTube, Users, LogOut, Calendar, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();

  const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { to: '/admin/tools', icon: Tractor, label: 'Tools' },
    { to: '/admin/warehouses', icon: Warehouse, label: 'Warehouses' },
    { to: '/admin/tool-bookings', icon: Calendar, label: 'Tool Bookings' },
    { to: '/admin/warehouse-bookings', icon: Calendar, label: 'Warehouse Bookings' },
    { to: '/admin/soil-checks', icon: TestTube, label: 'Soil Checks' },
    { to: '/admin/users', icon: Users, label: 'Users' },
    { to: '/admin/moderation', icon: Shield, label: 'Moderation' }
  ];

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar fixed */}
      <aside className="w-64 border-r bg-card flex flex-col h-screen sticky top-0">
        {/* Header */}
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">KrishiSanjivni</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-1">Admin Panel</p>
        </div>

        {/* Scrollable nav links */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          <nav className="flex flex-col space-y-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                  isActive(item.to, item.exact)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent text-foreground/80"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout fixed at bottom */}
        <div className="p-4 border-t">
          <Button variant="outline" onClick={signOut} className="w-full justify-start gap-3">
            <LogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
