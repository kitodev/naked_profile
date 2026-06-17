import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
    EmptyState,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/inbox")({
    head: () => ({ meta: [{ title: "Inbox - Naked Profile" }] }),
    component: InboxPage,
});

function InboxPage() {
    return (
        <AccountPageShell
            title="Inbox"
            description="Review system messages, account updates, and creator announcements."
        >
            <AccountCard>
                <EmptyState
                    icon={<Mail className="h-9 w-9" />}
                    text="Your inbox is empty."
                />
            </AccountCard>
        </AccountPageShell>
    );
}
