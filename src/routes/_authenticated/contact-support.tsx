import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy, Send } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/contact-support")({
    head: () => ({ meta: [{ title: "Contact Support - Naked Profile" }] }),
    component: ContactSupportPage,
});

function ContactSupportPage() {
    return (
        <AccountPageShell
            title="Contact Support"
            description="Send a message to support about account, billing, or content issues."
        >
            <AccountCard>
                <div className="flex items-center gap-3">
                    <LifeBuoy className="h-6 w-6 text-primary" />
                    <div>
                        <div className="text-sm font-semibold">
                            Support Request
                        </div>
                        <div className="text-xs text-muted-foreground">
                            We will reply in your messages.
                        </div>
                    </div>
                </div>
                <textarea
                    rows={5}
                    placeholder="Describe what you need help with..."
                    className="mt-4 w-full resize-none rounded-lg border border-border bg-background/60 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary"
                />
                <div className="mt-3 flex justify-end">
                    <button className="inline-flex items-center gap-2 rounded-full bg-success px-4 py-2 text-xs font-semibold text-success-foreground hover:brightness-110">
                        <Send className="h-4 w-4" />
                        Send
                    </button>
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
