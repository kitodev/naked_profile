import { createFileRoute } from "@tanstack/react-router";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/terms")({
    head: () => ({ meta: [{ title: "Terms - Naked Profile" }] }),
    component: TermsPage,
});

function TermsPage() {
    return (
        <AccountPageShell
            title="Terms"
            description="Review the terms that govern your use of Naked Profile."
        >
            <AccountCard>
                <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        Use Naked Profile responsibly and follow all applicable
                        laws.
                    </p>
                    <p>
                        Creators retain ownership of their content and grant
                        Naked Profile permission to host it.
                    </p>
                    <p>
                        Subscriptions, messages, and uploads must comply with
                        platform safety rules.
                    </p>
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
