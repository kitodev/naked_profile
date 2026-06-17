import { AppTopBar } from "./app-top-bar";

type AccountPageShellProps = {
    action?: React.ReactNode;
    children: React.ReactNode;
    description: string;
    eyebrow?: string;
    title: string;
};

export function AccountPageShell({
    action,
    children,
    description,
    eyebrow = "Account",
    title,
}: AccountPageShellProps) {
    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 px-4 py-6">
                <main className="space-y-5">
                    <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                    {eyebrow}
                                </p>
                                <h1 className="mt-2 text-2xl font-bold tracking-tight">
                                    {title}
                                </h1>
                                <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                                    {description}
                                </p>
                            </div>
                            {action}
                        </div>
                    </section>
                    {children}
                </main>
            </div>
        </div>
    );
}

export function AccountCard({ children }: { children: React.ReactNode }) {
    return (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            {children}
        </section>
    );
}

export function EmptyState({
    icon,
    text,
}: {
    icon: React.ReactNode;
    text: string;
}) {
    return (
        <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-muted-foreground">
            {icon}
            <p className="text-sm">{text}</p>
        </div>
    );
}

export function FieldRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border py-4 last:border-0">
            <div>
                <div className="text-sm font-semibold">{label}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                    {value}
                </div>
            </div>
            <button className="rounded-full bg-secondary px-4 py-2 text-xs font-semibold text-secondary-foreground hover:bg-accent">
                Manage
            </button>
        </div>
    );
}
