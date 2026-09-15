import { sql } from "@/lib/db";
import CampaignSender from "./CampaignSender";

export const revalidate = 0; // Don't cache admin pages

export default async function CampaignsPage() {
  const subscribers = await sql`SELECT count(*) as count FROM subscribers WHERE status = 'active'`;
  const activeCount = subscribers[0]?.count ?? 0;

  const campaigns = await sql`SELECT * FROM newsletter_campaigns ORDER BY sent_at DESC LIMIT 20`;

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Newsletter Campaigns</h1>
        <p className="text-gray-400 text-sm mt-1">Send emails to your active subscribers</p>
      </div>

      <CampaignSender activeSubscribersCount={activeCount} />

      <h3 className="text-lg font-semibold text-white mb-4">Recent Campaigns</h3>
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        {(campaigns ?? []).length === 0 ? (
          <div className="py-12 text-center text-gray-500">
            No campaigns sent yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-6 py-3 text-xs text-gray-500 font-medium uppercase">Subject</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase">Sent Count</th>
                <th className="px-4 py-3 text-xs text-gray-500 font-medium uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {campaigns.map((camp: any) => (
                <tr key={camp.id} className="hover:bg-gray-800/30 transition">
                  <td className="px-6 py-4 text-sm text-white font-medium">{camp.subject}</td>
                  <td className="px-4 py-4 text-sm text-gray-400">{camp.sent_count}</td>
                  <td className="px-4 py-4 text-xs text-gray-500">
                    {new Date(camp.sent_at).toLocaleString("en-BD")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
