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
        fixed lg:sticky top-0 left-0 h-screen w-60 z-50
        bg-[#0a0a14] border-r border-white/[0.06]
        flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="p-5 border-b border-white/[0.06]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center text-white font-bold text-base">
                            F
                        </div>
                        <div>
                            <h1 className="text-base font-bold text-white leading-none tracking-tight">
                                FlexCover
                            </h1>
                            <p className="text-[11px] text-slate-500 mt-0.5">Gig Worker Coverage</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 p-3 flex flex-col gap-0.5 mt-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                onClick={() => setSidebarOpen(false)}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium
                  transition-all duration-200 group
                  ${isActive
                                        ? 'bg-white/[0.06] text-white'
                                        : 'text-slate-500 hover:text-slate-300 hover:bg-white/[0.03]'
                                    }
                `}
                            >
                                <Icon size={17} className={isActive ? 'text-[#6366f1]' : 'text-slate-600 group-hover:text-slate-400'} />
                                {item.label}
                                {isActive && <ChevronRight size={13} className="ml-auto text-slate-600" />}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Sidebar footer */}
                <div className="p-4 border-t border-white/[0.06]">
                    <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-[11px] text-slate-600">All systems operational</span>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-14 border-b border-white/[0.06] bg-[#07040f]/90 backdrop-blur-md flex items-center px-4 lg:px-6 gap-4">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden p-2 rounded-lg hover:bg-white/[0.06] text-slate-400"
                    >
                        <Menu size={20} />
                    </button>

                    <div className="flex-1" />

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-xs font-medium text-emerald-500">Protected</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold">
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
