import { createFileRoute } from "@tanstack/react-router";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/privacy-policy")({
    head: () => ({ meta: [{ title: "Privacy Policy - Naked Profile" }] }),
    component: PrivacyPolicyPage,
});

function PrivacyPolicyPage() {
    return (
        <AccountPageShell
            title="Privacy Policy"
            description="Understand how Naked Profile handles account, payment, and content data."
        >
            <AccountCard>
                <div className="space-y-4 text-sm text-muted-foreground">
                    <p>
                        We collect account information needed to operate the
                        service.
                    </p>
                    <p>
                        Private content and messages are protected by access
                        controls.
                    </p>
                    <p>
                        You can request account updates or deletion from
                        settings.
                    </p>
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
