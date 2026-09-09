import type { Metadata } from "next";
import { StudioEmptyState, StudioPage, StudioPageHeader } from "@/components/studio/page-header";
import { DeleteButton } from "@/components/studio/row-actions";
import { formatDateTime } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { deleteMessage, setMessageRead } from "./actions";

export const metadata: Metadata = { title: "Inbox" };

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  created_at: string;
};

export default async function InboxPage() {
  const supabase = await createClient();
  // Newest first: this is inbound mail, not an ordered list — there
  // is no display_order column on this table (SCHEMA.md), and there
  // shouldn't be one.
  const { data } = await supabase
    .from("contact_messages")
    .select("id, name, email, message, read, created_at")
    .order("created_at", { ascending: false });

  const messages = (data ?? []) as ContactMessage[];
  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <StudioPage>
      <StudioPageHeader
        eyebrow="Inbox"
        title="Messages"
        description={
          unreadCount > 0
            ? `${unreadCount} unread ${unreadCount === 1 ? "message" : "messages"}.`
            : "You're caught up."
        }
      />

      {messages.length === 0 ? (
        <StudioEmptyState
          title="No messages yet."
          consequence="Messages sent through your site's contact form will show up here."
        />
      ) : (
        <ul className="mt-10 flex flex-col gap-3">
          {messages.map((message) => (
            <li
              key={message.id}
              className={[
                "rounded-xl border p-5 transition-colors",
                message.read
                  ? "border-border bg-surface"
                  : "border-accent/25 bg-accent/5",
              ].join(" ")}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {/* Unread dot — the same signal Overview's count
                        card uses, so "unread" means one thing across
                        the whole studio. */}
                    {!message.read && (
                      <span
                        aria-hidden
                        className="h-2 w-2 shrink-0 rounded-full bg-accent"
                      />
                    )}
                    <p className="truncate text-base font-medium text-ink">
                      {message.name}
                    </p>
                  </div>
                  <a
                    href={`mailto:${message.email}`}
                    className="link-underline mt-0.5 inline-flex text-sm text-muted hover:text-accent"
                  >
                    {message.email}
                  </a>
                </div>

                <p className="shrink-0 text-xs tabular-nums text-muted">
                  {formatDateTime(message.created_at)}
                </p>
              </div>

              <p className="mt-4 whitespace-pre-wrap text-base leading-relaxed text-ink">
                {message.message}
              </p>

              <div className="mt-4 flex items-center gap-4">
                <a
                  href={`mailto:${message.email}`}
                  className="tap inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm text-ink transition-colors hover:border-neutral-400"
                >
                  Reply by email
                </a>

                <form action={setMessageRead}>
                  <input type="hidden" name="id" value={message.id} />
                  <input
                    type="hidden"
                    name="read"
                    value={message.read ? "false" : "true"}
                  />
                  <button
                    type="submit"
                    className="tap flex min-h-11 items-center rounded-full px-3 text-sm text-muted transition-colors hover:text-ink"
                  >
                    {message.read ? "Mark as unread" : "Mark as read"}
                  </button>
                </form>

                <DeleteButton
                  id={message.id}
                  label={`the message from ${message.name}`}
                  action={deleteMessage}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </StudioPage>
  );
}
