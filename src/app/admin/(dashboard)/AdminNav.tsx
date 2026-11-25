"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/posts", label: "Blog Posts", icon: "📝" },
  { href: "/admin/calendar", label: "Content Calendar", icon: "📅" },
  { href: "/admin/audit", label: "SEO & Link Audit", icon: "🕷️" },
  { href: "/admin/social", label: "Social Posts", icon: "📡" },
  { href: "/admin/media", label: "Media Library", icon: "🖼️" },
  { href: "/admin/journal", label: "Dev Journal", icon: "📓" },
  { href: "/admin/projects", label: "Projects", icon: "🚀" },
  { href: "/admin/skills", label: "Skills", icon: "⚡" },
  { href: "/admin/messages", label: "Messages", icon: "💬" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "📧" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "📢" },
  { href: "/", label: "← View Site", icon: "🌐", external: true },
];

export default function AdminNav({
  userEmail,
  initialUnreadCount = 0,
}: {
  userEmail: string;
  initialUnreadCount?: number;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState<number>(initialUnreadCount);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  useEffect(() => {
    setUnreadCount(initialUnreadCount);
  }, [initialUnreadCount]);

  // Polling for live new messages every 30 seconds
  useEffect(() => {
    let isMounted = true;
    async function checkNotifications() {
      try {
        const res = await fetch("/api/admin/notifications");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && typeof data.unreadMessages === "number") {
            setUnreadCount(data.unreadMessages);
          }
        }
      } catch {
        // silent polling catch
      }
    }

    const interval = setInterval(checkNotifications, 30000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  async function handleLogout() {
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <>
      {/* Mobile Top App Bar (Visible on < lg screens) */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-card/95 backdrop-blur-md border-b border-line-soft flex items-center justify-between px-4 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center text-sm font-bold text-[#060a13] shadow-sm">
            Z
          </div>
          <div>
            <p className="font-semibold text-sm text-ink leading-tight">Admin CMS</p>
            <p className="text-[11px] text-ink-mute truncate max-w-[130px] sm:max-w-[200px]">{userEmail}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Link
              href="/admin/messages"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30"
            >
              <span>💬</span>
              <span>{unreadCount}</span>
            </Link>
          )}

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            type="button"
            aria-label="Toggle admin navigation menu"
            className="p-2 rounded-lg bg-card2 text-ink-soft hover:text-ink hover:bg-card transition active:scale-95"
          >
            {isMobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </header>

      {/* Backdrop overlay for mobile */}
      {isMobileOpen && (
        <div
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
        />
      )}

      {/* Main Sidebar (Desktop persistent + Mobile Drawer) */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-card border-r border-line-soft flex flex-col z-50 transition-transform duration-300 ease-in-out ${
          isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-line-soft flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan flex items-center justify-center text-sm font-bold text-[#060a13] shadow-sm">
              Z
            </div>
            <div>
              <p className="font-semibold text-sm text-ink">Admin CMS</p>
              <p className="text-xs text-ink-mute truncate max-w-[130px]">{userEmail}</p>
            </div>
          </div>
          {/* Mobile close icon inside drawer */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-ink-mute hover:text-ink hover:bg-card2 transition"
            aria-label="Close menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href) && item.href !== "/";

            const isMessages = item.href === "/admin/messages";

            return item.external ? (
              <Link
                key={item.href}
                href={item.href}
                target="_blank"
                onClick={() => setIsMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-mute hover:text-ink hover:bg-card2 transition"
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition relative ${
                  isActive
                    ? "bg-cyan text-[#060a13] font-bold"
                    : "text-ink-mute hover:text-ink hover:bg-card2"
                }`}
              >
                <span className="relative">
                  {item.icon}
                  {isMessages && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  )}
                </span>
                <span>{item.label}</span>
                {isMessages && unreadCount > 0 && (
                  <span className="ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-500 text-white shadow-sm shadow-rose-500/30">
                    {unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        <div className="px-3 py-4 border-t border-line-soft space-y-1">
          <Link
            href="/admin/posts/new"
            onClick={() => setIsMobileOpen(false)}
            className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm bg-cyan hover:bg-amber text-[#060a13] font-bold transition active:scale-95"
          >
            <span>+</span>
            <span>New Post</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-ink-mute hover:text-red-400 hover:bg-card2 transition w-full"
          >
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
