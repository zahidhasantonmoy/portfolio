import { sql } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const revalidate = 0; // Don't cache admin messages

async function markAsRead(id: string) {
  "use server";
  await sql`UPDATE contact_messages SET status = 'read' WHERE id = ${id}`;
  revalidatePath("/admin/messages");
  revalidatePath("/admin"); // update unread count on dashboard
  revalidatePath("/admin", "layout");
}

async function markAsUnread(id: string) {
  "use server";
  await sql`UPDATE contact_messages SET status = 'unread' WHERE id = ${id}`;
  revalidatePath("/admin/messages");
  revalidatePath("/admin"); // update unread count on dashboard
  revalidatePath("/admin", "layout");
}

async function deleteMessage(id: string) {
  "use server";
  await sql`DELETE FROM contact_messages WHERE id = ${id}`;
  revalidatePath("/admin/messages");
  revalidatePath("/admin"); // update unread count on dashboard
  revalidatePath("/admin", "layout");
}

export default async function MessagesPage() {
  const messagesRows = await sql`
    SELECT * FROM contact_messages
    ORDER BY created_at DESC
  `.catch(() => []); // Fallback if table doesn't exist yet

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white">Contact Messages</h1>
          <p className="text-gray-400 mt-1">Manage messages sent from your portfolio contact form.</p>
        </div>
        <div className="text-sm px-3 py-1 bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
          Total: {messagesRows.length}
        </div>
      </div>

      <div className="space-y-4">
        {messagesRows.length === 0 ? (
          <div className="text-center py-20 bg-gray-900 border border-gray-800 rounded-xl">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-gray-400">No messages found.</p>
          </div>
        ) : (
          messagesRows.map((msg: any) => (
            <div
              key={msg.id}
              className={`p-6 rounded-xl border transition-all ${
                msg.status === "unread"
                  ? "bg-gray-800 border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                  : "bg-gray-900 border-gray-800 opacity-70 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col md:flex-row justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-white">{msg.name}</h3>
                    {msg.status === "unread" && (
                      <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500 text-white rounded-full">
                        New
                      </span>
                    )}
                  </div>
                  <a
                    href={`mailto:${msg.email}`}
                    className="text-indigo-400 text-sm hover:underline flex items-center gap-2"
                  >
                    <span>📧</span> {msg.email}
                  </a>
                </div>
                <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString("en-BD", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </div>
              </div>

              <div className="bg-gray-950/50 p-4 rounded-lg text-gray-300 text-sm whitespace-pre-wrap border border-gray-800/50">
                {msg.message}
              </div>

              <div className="mt-4 flex gap-3 justify-end border-t border-gray-800 pt-4">
                <a
                  href={`mailto:${msg.email}?subject=Reply from Zahid Hasan Tonmoy&body=Hi ${msg.name},%0D%0A%0D%0A`}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                >
                  Reply Email
                </a>
                
                {msg.status === "unread" ? (
                  <form action={markAsRead.bind(null, msg.id)}>
                    <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition">
                      Mark Read
                    </button>
                  </form>
                ) : (
                  <form action={markAsUnread.bind(null, msg.id)}>
                    <button className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition">
                      Mark Unread
                    </button>
                  </form>
                )}

                <form action={deleteMessage.bind(null, msg.id)}>
                  <button className="px-4 py-2 bg-red-900/30 hover:bg-red-900/60 text-red-400 hover:text-red-300 rounded-lg text-sm font-medium transition border border-red-900/50">
                    Delete
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
