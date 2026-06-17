import { createFileRoute } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
    EmptyState,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/subscriptions")({
    head: () => ({ meta: [{ title: "Subscriptions - Naked Profile" }] }),
    component: SubscriptionsPage,
});

function SubscriptionsPage() {
    return (
        <AccountPageShell
            title="Subscriptions"
            description="Manage creator subscriptions, renewal status, and billing preferences."
        >
            <AccountCard>
                <EmptyState
                    icon={<CreditCard className="h-9 w-9" />}
                    text="You do not have any active subscriptions yet."
                />
            </AccountCard>
        </AccountPageShell>
    );
}
