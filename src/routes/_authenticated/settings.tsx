import { Link, createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, Check, Loader2, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AppTopBar } from "../../components/app-top-bar";
import { supabase } from "../../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/settings")({
    head: () => ({ meta: [{ title: "Account - Naked Profile" }] }),
    component: SettingsPage,
});

type AccountProfile = {
    displayName: string;
    email: string;
    username: string;
};

function SettingsPage() {
    const [profile, setProfile] = useState<AccountProfile>({
        displayName: "",
        email: "",
        username: "user",
    });
    const [displayName, setDisplayName] = useState("");
    const [loadingAction, setLoadingAction] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("username, display_name")
                .eq("id", user.id)
                .maybeSingle();

            const nextProfile = {
                displayName: data?.display_name ?? "",
                email: user.email ?? "",
                username: data?.username ?? user.email?.split("@")[0] ?? "user",
            };

            setProfile(nextProfile);
            setDisplayName(nextProfile.displayName);
        })();
    }, []);

    async function updateAccount(
        action: string,
        updates: {
            displayName?: string;
            email?: string;
            password?: string;
            username?: string;
        },
    ) {
        setLoadingAction(action);

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error("Please log in before changing account data.");
            }

            const response = await fetch(getAccountApiUrl(), {
                method: "PATCH",
                headers: {
                    authorization: `Bearer ${session.access_token}`,
                    "content-type": "application/json",
                },
                body: JSON.stringify(updates),
            });
            const payload = (await response.json().catch(() => ({}))) as {
                account?: AccountProfile;
                error?: string;
                message?: string;
            };

            if (!response.ok) {
                throw new Error(payload.error ?? "Could not update account.");
            }

            if (payload.account) {
                setProfile(payload.account);
                setDisplayName(payload.account.displayName);
            }

            toast.success(payload.message ?? "Account updated.");
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not update account.",
            );
        } finally {
            setLoadingAction(null);
        }
    }

    function changeUsername() {
        const nextUsername = window.prompt("New username", profile.username);
        if (!nextUsername) return;
        void updateAccount("username", { username: nextUsername });
    }

    function saveDisplayName() {
        const nextDisplayName = displayName.trim();
        if (!nextDisplayName) {
            toast.error("Display name is required.");
            return;
        }

        void updateAccount("displayName", { displayName: nextDisplayName });
    }

    function changeEmail() {
        const nextEmail = window.prompt("New email", profile.email);
        if (!nextEmail) return;
        void updateAccount("email", { email: nextEmail });
    }

    function changePassword() {
        const nextPassword = window.prompt("New password");
        if (!nextPassword) return;
        void updateAccount("password", { password: nextPassword });
    }

    async function deleteAccount() {
        const confirmed = window.confirm(
            "Delete your account permanently? This cannot be undone.",
        );
        if (!confirmed) return;

        setLoadingAction("delete");

        try {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error("Please log in before deleting your account.");
            }

            const response = await fetch(getAccountApiUrl(), {
                method: "DELETE",
                headers: {
                    authorization: `Bearer ${session.access_token}`,
                },
            });
            const payload = (await response.json().catch(() => ({}))) as {
                error?: string;
            };

            if (!response.ok) {
                throw new Error(payload.error ?? "Could not delete account.");
            }

            await supabase.auth.signOut();
            toast.success("Account deleted.");
            window.location.href = "/";
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not delete account.",
            );
            setLoadingAction(null);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-5 flex items-center gap-3 border-b border-border pb-3">
                    <Link
                        to="/dashboard"
                        aria-label="Back"
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-2xl font-bold tracking-tight">
                        Account
                    </h1>
                </div>

                <section className="divide-y divide-border">
                    <AccountSection>
                        <h2 className="text-sm font-bold text-foreground">
                            Username (Profile)
                        </h2>
                        <p className="mt-1 text-sm font-semibold text-foreground">
                            nakedprofile.com/{profile.username}
                        </p>
                        <FanlyButton
                            className="mt-3"
                            loading={loadingAction === "username"}
                            onClick={changeUsername}
                        >
                            Change Username
                        </FanlyButton>
                    </AccountSection>

                    <AccountSection>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            <input
                                value={displayName}
                                onChange={(event) =>
                                    setDisplayName(event.target.value)
                                }
                                placeholder="Display Name"
                                className="h-10 w-full max-w-xs rounded-md border border-border bg-card px-3 text-sm text-foreground outline-none placeholder:text-muted-foreground focus:border-primary"
                            />
                            <button
                                onClick={saveDisplayName}
                                disabled={loadingAction === "displayName"}
                                className="h-9 rounded-md bg-primary px-5 text-xs font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="inline-flex items-center gap-2">
                                    {loadingAction === "displayName" && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Change
                                </span>
                            </button>
                        </div>
                    </AccountSection>

                    <AccountSection>
                        <h2 className="text-sm font-bold text-foreground">
                            Email
                        </h2>
                        <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{profile.email || "No email connected"}</span>
                            {profile.email && (
                                <Check className="h-4 w-4 text-primary" />
                            )}
                        </div>
                        <FanlyButton
                            className="mt-3"
                            loading={loadingAction === "email"}
                            onClick={changeEmail}
                        >
                            Change Email
                        </FanlyButton>
                    </AccountSection>

                    <AccountSection>
                        <div className="flex items-start gap-3">
                            <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
                            <div>
                                <h2 className="text-sm font-bold text-foreground">
                                    Manage 2FA
                                </h2>
                                <p className="mt-1 max-w-4xl text-sm leading-6 text-muted-foreground">
                                    Protect your account and content by enabling
                                    2FA. You can use apps such as Authy, Google
                                    Authenticator and many others to view your
                                    2FA codes.
                                </p>
                                <FanlyButton
                                    className="mt-3"
                                    onClick={() =>
                                        toast.info(
                                            "2FA setup needs the Supabase MFA QR verification flow.",
                                        )
                                    }
                                >
                                    Setup 2 Factor Authentication
                                </FanlyButton>
                            </div>
                        </div>
                    </AccountSection>

                    <AccountSection>
                        <h2 className="text-sm font-bold text-foreground">
                            Password
                        </h2>
                        <FanlyButton
                            className="mt-3"
                            loading={loadingAction === "password"}
                            onClick={changePassword}
                        >
                            Change Password
                        </FanlyButton>
                    </AccountSection>

                    <AccountSection>
                        <h2 className="text-sm font-bold text-foreground">
                            Account Status
                        </h2>
                        <div className="mt-3 flex flex-col items-start gap-2">
                            <button
                                onClick={deleteAccount}
                                disabled={loadingAction === "delete"}
                                className="h-9 rounded-md border border-destructive bg-card px-7 text-xs font-bold text-foreground transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <span className="inline-flex items-center gap-2">
                                    {loadingAction === "delete" && (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    )}
                                    Delete Account
                                </span>
                            </button>
                            <Link
                                to="/become-creator"
                                className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-card px-7 text-xs font-bold text-foreground transition hover:border-primary hover:bg-primary/10"
                            >
                                Creator Application
                            </Link>
                        </div>
                    </AccountSection>
                </section>
            </main>
        </div>
    );
}

function AccountSection({ children }: { children: React.ReactNode }) {
    return <div className="py-6">{children}</div>;
}

function FanlyButton({
    children,
    className = "",
    loading = false,
    onClick,
}: {
    children: React.ReactNode;
    className?: string;
    loading?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className={`h-9 rounded-md border border-border bg-card px-6 text-xs font-bold text-foreground transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        >
            <span className="inline-flex items-center gap-2">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {children}
            </span>
        </button>
    );
}

function getAccountApiUrl() {
    const base = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:3001";
    return `${base.replace(/\/$/, "")}/api/account`;
}
