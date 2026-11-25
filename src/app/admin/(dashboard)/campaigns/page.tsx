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
        <h1 className="text-2xl font-bold text-ink">Newsletter Campaigns</h1>
        <p className="text-ink-mute text-sm mt-1">Send emails to your active subscribers</p>
      </div>

      <CampaignSender activeSubscribersCount={activeCount} />

      <h3 className="text-lg font-semibold text-ink mb-4">Recent Campaigns</h3>
      <div className="bg-card border border-line-soft rounded-xl overflow-hidden">
        {(campaigns ?? []).length === 0 ? (
          <div className="py-12 text-center text-ink-mute">
            No campaigns sent yet.
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-line-soft text-left">
                <th className="px-6 py-3 text-xs text-ink-mute font-medium uppercase">Subject</th>
                <th className="px-4 py-3 text-xs text-ink-mute font-medium uppercase">Sent Count</th>
                <th className="px-4 py-3 text-xs text-ink-mute font-medium uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-soft">
              {campaigns.map((camp: any) => (
                <tr key={camp.id} className="hover:bg-card2/30 transition">
                  <td className="px-6 py-4 text-sm text-ink font-medium">{camp.subject}</td>
                  <td className="px-4 py-4 text-sm text-ink-mute">{camp.sent_count}</td>
                  <td className="px-4 py-4 text-xs text-ink-mute">
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
