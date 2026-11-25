import Link from "next/link";
import { sql } from "@/lib/db";

export default async function SubscribersPage() {
  const subscribers = await sql`SELECT * FROM subscribers ORDER BY subscribed_at DESC LIMIT 200`;

  const activeCount = (subscribers ?? []).filter((s: any) => s.status === "active").length;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink">Subscribers</h1>
        <p className="text-ink-mute text-sm mt-1">{activeCount} active subscribers</p>
      </div>

      <div className="bg-card border border-line-soft rounded-xl overflow-hidden">
        {(subscribers ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📧</p>
            <p className="text-ink-mute">No subscribers yet</p>
            <p className="text-ink-mute text-sm mt-1">Add the newsletter form to your site</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-soft">
                <th className="text-left px-6 py-3 text-xs text-ink-mute font-medium uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-ink-mute font-medium uppercase">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {(subscribers ?? []).map((sub: any) => (
                <tr key={sub.id} className="hover:bg-card2/30 transition">
                  <td className="px-6 py-3 text-sm text-ink">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-ink-mute">{sub.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sub.status === "active"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : "bg-card2 text-ink-mute"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-mute">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 p-4 bg-card border border-line-soft rounded-lg text-sm text-ink-mute">
        💡 Newsletters are sent with Resend —{" "}
        <Link href="/admin/campaigns" className="text-cyan font-medium">
          send a campaign →
        </Link>
      </div>
    </div>
  );
}
