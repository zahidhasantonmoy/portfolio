"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "🏠" },
  { href: "/admin/posts", label: "Blog Posts", icon: "📝" },
  { href: "/admin/journal", label: "Dev Journal", icon: "📓" },
  { href: "/admin/projects", label: "Projects", icon: "🚀" },
  { href: "/admin/skills", label: "Skills", icon: "⚡" },
  { href: "/admin/messages", label: "Messages", icon: "💬" },
  { href: "/admin/subscribers", label: "Subscribers", icon: "📧" },
  { href: "/admin/campaigns", label: "Campaigns", icon: "📢" },
  { href: "/", label: "← View Site", icon: "🌐", external: true },
];

export default function AdminNav({ userEmail }: { userEmail: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOut({ callbackUrl: "/admin/login" });
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-gray-900 border-r border-gray-800 flex flex-col z-50">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-sm font-bold">
            Z
          </div>
          <div>
            <p className="font-semibold text-sm text-white">Admin CMS</p>
            <p className="text-xs text-gray-500 truncate max-w-[140px]">{userEmail}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = item.href === "/admin"
            ? pathname === "/admin"
            : pathname.startsWith(item.href) && item.href !== "/";

          return item.external ? (
            <Link
              key={item.href}
              href={item.href}
              target="_blank"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-400 hover:text-white hover:bg-gray-800 transition"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition ${
                isActive
                  ? "bg-indigo-600 text-white font-medium"
                  : "text-gray-400 hover:text-white hover:bg-gray-800"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Quick Actions */}
      <div className="px-3 py-4 border-t border-gray-800 space-y-1">
        <Link
          href="/admin/posts/new"
          className="flex items-center justify-center gap-2 w-full px-3 py-2.5 rounded-lg text-sm bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition"
        >
          <span>+</span>
          <span>New Post</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-500 hover:text-red-400 hover:bg-gray-800 transition w-full"
        >
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
