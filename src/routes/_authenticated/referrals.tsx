import { createFileRoute } from "@tanstack/react-router";
import { Copy, Users } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/referrals")({
    head: () => ({ meta: [{ title: "Referrals - Naked Profile" }] }),
    component: ReferralsPage,
});

function ReferralsPage() {
    return (
        <AccountPageShell
            title="Referrals"
            description="Invite friends and track referral rewards."
        >
            <AccountCard>
                <Users className="h-6 w-6 text-primary" />
                <div className="mt-3 text-sm font-semibold">
                    Your referral link
                </div>
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-border bg-background/60 px-3 py-2">
                    <code className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
                        https://nakedprofile.local/ref/you
                    </code>
                    <button className="rounded-full p-2 text-primary hover:bg-card">
                        <Copy className="h-4 w-4" />
                    </button>
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
