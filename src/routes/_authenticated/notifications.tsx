import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, Heart, MessageCircle, Sparkles, UserPlus } from "lucide-react";
import { useState } from "react";
import {
    AccountCard,
    AccountPageShell,
    EmptyState,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/notifications")({
    head: () => ({ meta: [{ title: "Notifications - Naked Profile" }] }),
    component: NotificationsPage,
});

const notifications = [
    {
        id: "n1",
        icon: Heart,
        title: "Aria Mae liked your reply",
        body: "Keep the conversation going from the home feed.",
        link: "/dashboard",
        unread: true,
    },
    {
        id: "n2",
        icon: MessageCircle,
        title: "New message from Luna Park",
        body: "A creator sent you a private update.",
        link: "/messages",
        unread: true,
    },
    {
        id: "n3",
        icon: Sparkles,
        title: "Subscriber post unlocked",
        body: "Your unlocked media is available in Media Collection.",
        link: "/media-collection",
        unread: false,
    },
    {
        id: "n4",
        icon: UserPlus,
        title: "Theo Vance followed you back",
        body: "Visit Discover to find more creators.",
        link: "/discover",
        unread: false,
    },
];

function NotificationsPage() {
    const [readIds, setReadIds] = useState<string[]>([]);
    const visible = notifications.map((item) => ({
        ...item,
        unread: item.unread && !readIds.includes(item.id),
    }));

    return (
        <AccountPageShell
            title="Notifications"
            description="Stay up to date on follows, messages, subscriptions, and account activity."
            action={
                <button
                    onClick={() =>
                        setReadIds(notifications.map((item) => item.id))
                    }
                    className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent"
                >
                    Mark all read
                </button>
            }
        >
            <AccountCard>
                {visible.length ? (
                    <div className="space-y-2">
                        {visible.map(
                            ({ body, icon: Icon, id, link, title, unread }) => (
                                <Link
                                    key={id}
                                    to={link}
                                    onClick={() =>
                                        setReadIds((current) => [
                                            ...current,
                                            id,
                                        ])
                                    }
                                    className="flex items-start gap-3 rounded-lg border border-border bg-background/60 p-3 hover:bg-background"
                                >
                                    <div className="mt-0.5 rounded-full bg-card p-2 text-primary">
                                        <Icon className="h-4 w-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center gap-2">
                                            <div className="truncate text-sm font-semibold">
                                                {title}
                                            </div>
                                            {unread && (
                                                <span className="h-2 w-2 rounded-full bg-primary" />
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-muted-foreground">
                                            {body}
                                        </p>
                                    </div>
                                </Link>
                            ),
                        )}
                    </div>
                ) : (
                    <EmptyState
                        icon={<Bell className="h-9 w-9" />}
                        text="You do not have any notifications."
                    />
                )}
            </AccountCard>
        </AccountPageShell>
    );
}
