import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Sprout,
  LayoutDashboard,
  Tractor,
  Warehouse,
  TestTube,
  Users,
  LogOut,
  Calendar,
  Shield,
  MessageSquare,
  Menu
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
  { to: '/admin/tools', icon: Tractor, label: 'Tools' },
  { to: '/admin/warehouses', icon: Warehouse, label: 'Warehouses' },
  { to: '/admin/tool-bookings', icon: Calendar, label: 'Tool Bookings' },
  { to: '/admin/warehouse-bookings', icon: Calendar, label: 'Warehouse Bookings' },
  { to: '/admin/soil-checks', icon: TestTube, label: 'Soil Checks' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
  { to: '/admin/moderation', icon: Shield, label: 'Moderation' }
];

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const { signOut } = useAuth();
  const [open, setOpen] = React.useState(false);

  const isActive = (path: string, exact: boolean = false) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const NavContent = ({ mobile = false }) => (
    <div className={cn("flex flex-col h-full", mobile ? "py-4" : "")}>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        <nav className="flex flex-col space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => mobile && setOpen(false)}
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

      <div className="p-4 border-t mt-auto">
        <Button variant="outline" onClick={signOut} className="w-full justify-start gap-3">
          <LogOut className="h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar (hidden on mobile) */}
      <aside className="hidden lg:flex w-64 border-r bg-card flex-col h-screen sticky top-0">
        <div className="p-6 border-b">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Sprout className="h-8 w-8 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">KrishiSanjivni</span>
          </Link>
          <p className="text-sm text-muted-foreground mt-1 text-center lg:text-left">Admin Panel</p>
        </div>
        <NavContent />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header (visible only on small screens) */}
        <header className="lg:hidden h-16 border-b bg-card flex items-center justify-between px-4 shrink-0">
          <Link to="/" className="flex items-center gap-2 font-bold text-lg">
            <Sprout className="h-6 w-6 text-primary" />
            <span className="bg-gradient-hero bg-clip-text text-transparent">KrishiSanjivni</span>
          </Link>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <SheetHeader className="p-6 border-b text-left">
                <SheetTitle className="flex items-center gap-2">
                  <Sprout className="h-6 w-6 text-primary" />
                  <span className="bg-gradient-hero bg-clip-text text-transparent">KrishiSanjivni</span>
                </SheetTitle>
              </SheetHeader>
              <NavContent mobile />
            </SheetContent>
          </Sheet>
        </header>

        {/* Dynamic Content */}
        <main className="flex-1 overflow-hidden flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
