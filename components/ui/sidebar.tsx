import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Activity, MessageCircle, LogOut, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
    onLogout: () => void;
    userName?: string;
    userEmail?: string;
}

export function Sidebar({ onLogout, userName, userEmail }: SidebarProps) {
    const pathname = usePathname();

    const navItems = [
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

    const isActive = (href: string) => pathname === href;

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-100 flex flex-col shadow-sm">
            {/* Logo Section - Match Dashboard Header */}
            <div className="border-b border-gray-100 bg-white/80 backdrop-blur-sm px-6 py-4 h-20 flex items-center gap-3 group">
                <Link href="/dashboard" className="flex items-center gap-3 group w-full h-full">
                    <div className="shrink-0">
                        <Image
                            src="/images/medpredictjkn.png"
                            alt="MedPredict"
                            width={32}
                            height={32}
                            className="object-contain"
                        />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-bold text-gray-900 leading-tight tracking-tight">
                            <span style={{ color: "#123c70" }}>Medpredict</span><span style={{ color: "#76c04a" }}>JKn</span>
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">Health Prediction</p>
                    </div>
                </Link>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto border-t border-gray-200">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.href);
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 relative',
                                active
                                    ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600 shadow-sm'
                                    : 'text-gray-700 hover:bg-gray-50 border-l-4 border-transparent hover:text-blue-600'
                            )}
                        >
                            <Icon className="w-5 h-5 shrink-0" />
                            <span className="text-sm font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Section */}
            <div className="border-t border-gray-100 p-3 space-y-3 bg-white">
                {/* User Info */}
                {userName && (
                    <Link href="/profil" className="block px-4 py-3.5 bg-linear-to-br from-blue-50 to-indigo-50 rounded-lg hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 border border-blue-100 hover:border-blue-200 cursor-pointer group shadow-sm hover:shadow-md">
                        <p className="text-xs text-blue-700 font-bold uppercase tracking-wider">Pengguna Aktif</p>
                        <p className="text-sm font-bold text-gray-900 mt-1.5 truncate group-hover:text-blue-600 transition-colors">{userName}</p>
                        {userEmail && (
                            <p className="text-xs text-gray-600 mt-1 truncate group-hover:text-blue-600 transition-colors">{userEmail}</p>
                        )}
                    </Link>
                )}

                {/* Action Buttons */}
                <button
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg font-medium transition-all duration-200 border border-transparent hover:border-red-200"
                >
                    <LogOut className="w-5 h-5 shrink-0" />
                    <span className="text-sm">Keluar</span>
                </button>
            </div>
        </aside>
    );
}
