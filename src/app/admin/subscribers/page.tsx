import { createAdminClient } from "@/lib/supabase-server";

export default async function SubscribersPage() {
  const admin = createAdminClient();
  const { data: subscribers } = await admin
    .from("subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });

  const activeCount = (subscribers ?? []).filter((s: { status: string }) => s.status === "active").length;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Subscribers</h1>
        <p className="text-gray-400 text-sm mt-1">{activeCount} active subscribers</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {(subscribers ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-4xl mb-3">📧</p>
            <p className="text-gray-400">No subscribers yet</p>
            <p className="text-gray-600 text-sm mt-1">Add the newsletter form to your site</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left px-6 py-3 text-xs text-gray-500 font-medium uppercase">Email</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs text-gray-500 font-medium uppercase">Subscribed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {(subscribers ?? []).map((sub: { id: string; email: string; name: string | null; status: string; subscribed_at: string }) => (
                <tr key={sub.id} className="hover:bg-gray-800/30 transition">
                  <td className="px-6 py-3 text-sm text-white">{sub.email}</td>
                  <td className="px-4 py-3 text-sm text-gray-400">{sub.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      sub.status === "active"
                        ? "bg-emerald-900/40 text-emerald-400"
                        : "bg-gray-800 text-gray-500"
                    }`}>
                      {sub.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(sub.subscribed_at).toLocaleDateString("en-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/40 rounded-lg text-sm text-blue-300">
        💡 Newsletter পাঠাতে <strong>Resend</strong> integrate করুন (Phase 2)।
        এখন manually subscriber-দের email করতে পারবেন।
      </div>
    </div>
  );
}
