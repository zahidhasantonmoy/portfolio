import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";
import { Toaster } from "react-hot-toast";
import { sql } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const unreadRes = await sql`
    SELECT count(*) as count FROM contact_messages WHERE status = 'unread'
  `.catch(() => [{ count: 0 }]);
  const unreadMessagesCount = Number(unreadRes[0]?.count ?? 0);

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col lg:flex-row">
      <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />
      <AdminNav userEmail={session.user?.email ?? ""} initialUnreadCount={unreadMessagesCount} />
      <main className="flex-1 min-w-0 lg:ml-64 pt-20 lg:pt-8 p-4 sm:p-6 lg:p-8 overflow-x-hidden">{children}</main>
    </div>
  );
}
