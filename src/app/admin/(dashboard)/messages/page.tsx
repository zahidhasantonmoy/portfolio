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

import MessagesManagerClient from "./MessagesManagerClient";

export default async function MessagesPage() {
  const messagesRows = await sql`
    SELECT * FROM contact_messages
    ORDER BY created_at DESC
  `.catch(() => []); // Fallback if table doesn't exist yet

  return (
    <div className="max-w-5xl mx-auto">
      <MessagesManagerClient
        initialMessages={(messagesRows || []) as any}
        onMarkRead={markAsRead}
        onMarkUnread={markAsUnread}
        onDelete={deleteMessage}
      />
    </div>
  );
}
