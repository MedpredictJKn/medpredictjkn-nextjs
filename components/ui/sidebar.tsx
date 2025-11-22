"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { Activity, MessageCircle, LogOut, LayoutDashboard, Users, Stethoscope, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProfileAvatar } from './profile-avatar';

interface SidebarProps {
    onLogout: () => void;
    userName?: string;
    userEmail?: string;
    userRole?: string;
    profilePhoto?: string;
}

export function Sidebar({ onLogout, userName, userEmail, userRole, profilePhoto }: SidebarProps) {
    const pathname = usePathname();
    const [isHydrated, setIsHydrated] = useState(false);

    // Only compute nav items after hydration to prevent mismatch
    const navItems = useMemo(() => {
        // Default to patient items on server/initial render
        if (!isHydrated) {
            return [
                {
                    label: 'Dashboard',
                    href: '/dashboard',
                    icon: LayoutDashboard,
                },
                {
                    label: 'Cek Kesehatan',
                    href: '/cek-kesehatan',
                    icon: Activity,
                },
                {
                    label: 'Chat AI',
                    href: '/chat',
                    icon: MessageCircle,
                },
            ];
        }

        // Patient navigation items
        const patientItems = [
            {
                label: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                label: 'Cek Kesehatan',
                href: '/cek-kesehatan',
                icon: Activity,
            },
            {
                label: 'Chat AI',
                href: '/chat',
                icon: MessageCircle,
            },
        ];

        // Doctor navigation items
        const doctorItems = [
            {
                label: 'Dashboard',
                href: '/dashboard',
                icon: LayoutDashboard,
            },
            {
                label: 'Monitoring',
                href: '/doctor/monitoring',
                icon: Users,
            },
        ];

        return userRole === 'doctor' ? doctorItems : patientItems;
    }, [userRole, isHydrated]);

    // Set hydration flag on mount
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    const isActive = (href: string) => pathname === href;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-linear-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-white/10 flex flex-col backdrop-blur-xl overflow-hidden" suppressHydrationWarning>
            {/* Background Effects */}
            <div className="absolute top-20 left-0 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-20 right-0 w-80 h-80 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none"></div>

            {/* Logo Section */}
            <div className="h-[90px] px-6 flex items-center justify-center gap-2 relative z-10">
                <Link href="/dashboard" className="flex items-center justify-center gap-1.5 w-full h-full">
                    <div className="shrink-0">
                        <Image
                            src="/images/medpredictjkn.png"
                            alt="MedPredict"
                            width={50}
                            height={50}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0 text-center">
                        <h2 className="text-xl font-bold text-white leading-tight tracking-tight">
                            <span style={{ color: "#ffffff", textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)" }}>Medpredict</span><span style={{ color: "#76c04a", textShadow: "0 2px 8px rgba(118, 192, 74, 0.5)" }}>JKn</span>
                        </h2>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 py-3 space-y-2 overflow-y-auto relative z-10">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200',
                                active
                                    ? 'bg-white/10 text-blue-400 border border-white/20 shadow-lg shadow-blue-500/10'
                                    : 'text-gray-400 hover:bg-white/5 hover:text-white border border-transparent'
                            )}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="p-4 space-y-3 border-t border-white/10 relative z-10" suppressHydrationWarning>
                {/* User Info */}
                <div suppressHydrationWarning>
                    <Link href={userName ? "/profil" : "/dashboard"} className="block px-4 py-4 bg-linear-to-br from-blue-500/20 to-cyan-500/10 rounded-lg hover:from-blue-500/30 hover:to-cyan-500/20 transition-all duration-200 border border-blue-400/30 hover:border-blue-400/50 cursor-pointer group">
                        {userName ? (
                            <>
                                <div className="flex items-center gap-3 mb-3">
                                    <ProfileAvatar src={profilePhoto} alt={userName} name={userName} size="md" className="group-hover:shadow-blue-500/50 transition-all" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-white truncate group-hover:text-blue-200 transition-colors">{userName}</p>
                                        {userEmail && (
                                            <p className="text-xs text-gray-300 truncate group-hover:text-gray-100 transition-colors">{userEmail}</p>
                                        )}
                                    </div>
                                </div>
                                <p className="text-xs text-blue-200 font-semibold uppercase tracking-widest flex items-center gap-2">
                                    {userRole === 'doctor' ? (
                                        <>
                                            <Stethoscope className="w-4 h-4" />
                                            Dokter
                                        </>
                                    ) : (
                                        <>
                                            <User className="w-4 h-4" />
                                            Pasien
                                        </>
                                    )}
                                </p>
                            </>
                        ) : (
                            <div className="h-20"></div>
                        )}
                    </Link>
                </div>

                {/* Logout Button */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg font-medium transition-all duration-200 border border-red-500/20 hover:border-red-500/30"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="text-sm">Keluar</span>
                </button>
            </div>
        </aside>
    );
}