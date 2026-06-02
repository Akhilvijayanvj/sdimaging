import { useState, useEffect } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FolderOpen, 
  HardDrive, 
  Moon, 
  Sun,
  Menu,
  X,
  Search
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useAuth } from '../lib/AuthContext';
import { ShieldAlert } from 'lucide-react';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

export function Layout() {
  const [isDark, setIsDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Projects', path: '/projects', icon: FolderOpen },
    { name: 'HDDs', path: '/hdds', icon: HardDrive },
  ];

  if (user?.role === 'ADMIN') {
    navItems.push({ name: 'Team', path: '/team', icon: ShieldAlert });
  }

  return (
    <div className="flex h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden md:flex w-64 flex-col border-r border-border/50 bg-card/40 backdrop-blur-xl shadow-sm z-10">
        <div className="h-16 flex items-center px-6 border-b border-border/50">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-cyan-400 bg-clip-text text-transparent">
            SD Imaging
          </h1>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group",
                isActive 
                  ? "bg-primary/10 text-primary shadow-sm border border-primary/20" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <item.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
              <span className="font-medium tracking-wide text-sm">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm">
          <div className="fixed inset-y-0 left-0 w-64 bg-card border-r border-border shadow-xl p-6">
            <div className="flex items-center justify-between mb-8">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">SD Imaging</span>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 rounded-md hover:bg-muted">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="space-y-2">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                </NavLink>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 border-b border-border bg-card/80 backdrop-blur-md z-10 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 rounded-md hover:bg-muted text-muted-foreground"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-muted rounded-full border border-border focus-within:ring-2 focus-within:ring-primary focus-within:border-transparent transition-all">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search projects, HDDs..." 
                className="bg-transparent border-none outline-none text-sm w-64 placeholder:text-muted-foreground text-foreground"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Toggle Dark Mode"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold shadow-md uppercase text-sm">
                {user?.username.charAt(0) || 'U'}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-medium leading-none">{user?.username}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.role.replace('_', ' ')}</p>
              </div>
              <button onClick={logout} className="ml-2 text-xs font-medium text-red-500 hover:text-red-600 hover:underline">
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 bg-background relative">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
