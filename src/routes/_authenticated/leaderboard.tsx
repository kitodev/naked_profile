import { createFileRoute } from "@tanstack/react-router";
import { Trophy } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/leaderboard")({
    head: () => ({ meta: [{ title: "Leaderboard - Naked Profile" }] }),
    component: LeaderboardPage,
});

function LeaderboardPage() {
    const rows = ["Aria Mae", "Luna Park", "Theo Vance"];

    return (
        <AccountPageShell
            title="Leaderboard"
            description="See trending creators and active community rankings."
        >
            <AccountCard>
                <div className="space-y-3">
                    {rows.map((name, index) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 rounded-lg bg-background/60 p-3"
                        >
                            <Trophy className="h-5 w-5 text-primary" />
                            <div className="text-sm font-semibold">
                                #{index + 1}
                            </div>
                            <div className="text-sm">{name}</div>
                        </div>
                    ))}
                </div>
            </AccountCard>
        </AccountPageShell>
    );
}
