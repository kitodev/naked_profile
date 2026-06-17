import { createFileRoute } from "@tanstack/react-router";
import { Languages } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/language")({
    head: () => ({ meta: [{ title: "Language - Naked Profile" }] }),
    component: LanguagePage,
});

function LanguagePage() {
    const languages = ["English", "Deutsch", "Español", "Français"];

    return (
        <AccountPageShell
            title="Language"
            description="Choose the language used for navigation and account screens."
        >
            <AccountCard>
                <div className="space-y-2">
                    {languages.map((language) => (
                        <button
                            key={language}
                            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm hover:bg-background/60"
                        >
                            <Languages className="h-4 w-4 text-primary" />
                            {language}
                        </button>
                    ))}
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
