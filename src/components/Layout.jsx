import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { useState } from 'react';
import {
    LayoutDashboard, Shield, AlertTriangle, Zap, BarChart3,
    Bell, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin', label: 'Admin Panel', icon: BarChart3 },
    { path: '/claims', label: 'Claims', icon: Shield },
    { path: '/alerts', label: 'Risk Alerts', icon: Bell },
    { path: '/demo', label: 'Demo Mode', icon: Zap },
];

export default function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="flex min-h-screen">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-64 z-50
        bg-dark-800/95 backdrop-blur-xl border-r border-white/[0.06]
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl gradient-india flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            G
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white leading-none">
                                GigGuard<span className="text-gradient">AI</span>
                            </h1>
                            <p className="text-xs text-slate-400 mt-0.5">Income Protection</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 flex flex-col gap-1 mt-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200 group
                  ${isActive
                                        ? 'bg-primary/15 text-primary-light border border-primary/20 shadow-lg shadow-primary/5'
                                        : 'text-slate-400 hover:text-white hover:bg-white/[0.04]'
                                    }
                `}
                            >
                                <Icon size={18} className={isActive ? 'text-primary-light' : 'text-slate-500 group-hover:text-slate-300'} />
                                {item.label}
                                {isActive && <ChevronRight size={14} className="ml-auto text-primary-light/60" />}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="glass p-3 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                            <span className="text-xs text-slate-400">System Status</span>
                        </div>
                        <p className="text-xs text-slate-500">All engines operational</p>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 border-b border-white/[0.06] bg-dark-900/80 backdrop-blur-xl flex items-center px-4 lg:px-6 gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] text-slate-400"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 border border-success/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                            <span className="text-xs font-medium text-success">Protected</span>
                        </div>
                        <div className="w-8 h-8 rounded-full gradient-india flex items-center justify-center text-white text-xs font-bold">
                            RK
                        </div>
                    </div>
                </header>

                {/* Page content */}
                <main className="flex-1 p-4 lg:p-6 overflow-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
