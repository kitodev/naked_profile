import { createFileRoute } from "@tanstack/react-router";
import { List } from "lucide-react";
import {
    AccountCard,
    AccountPageShell,
    EmptyState,
} from "../../components/account-page-shell";

export const Route = createFileRoute("/_authenticated/lists")({
    head: () => ({ meta: [{ title: "Lists - Naked Profile" }] }),
    component: ListsPage,
});

function ListsPage() {
    return (
        <AccountPageShell
            title="Lists"
            description="Organize creators, subscribers, and saved accounts into private lists."
            action={
                <button className="rounded-full bg-success px-4 py-2 text-xs font-semibold text-success-foreground hover:brightness-110">
                    New List
                </button>
            }
        >
            <AccountCard>
                <EmptyState
                    icon={<List className="h-9 w-9" />}
                    text="You have not created any lists yet."
                />
            </AccountCard>
        </AccountPageShell>
    );
}
