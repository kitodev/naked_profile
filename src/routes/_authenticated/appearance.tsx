import { createFileRoute } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/appearance")({
    head: () => ({ meta: [{ title: "Appearance - Naked Profile" }] }),
    component: AppearancePage,
});

function AppearancePage() {
    return (
        <AccountPageShell
            title="Appearance"
            description="Choose light or dark display preferences."
        >
            <AccountCard>
                <div className="grid gap-3 sm:grid-cols-2">
                    <button className="flex items-center gap-3 rounded-lg border border-border bg-background/60 p-4 text-left">
                        <Moon className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold">Dark Mode</span>
                    </button>
                    <button className="flex items-center gap-3 rounded-lg border border-border p-4 text-left hover:bg-background/60">
                        <Sun className="h-5 w-5 text-primary" />
                        <span className="text-sm font-semibold">
                            Light Mode
                        </span>
                    </button>
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
