import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/signup")({
    head: () => ({
        meta: [
            { title: "Sign up - Naked Profile" },
            {
                name: "description",
                content:
                    "Create your Naked Profile account and start using the platform.",
            },
        ],
    }),
    beforeLoad: async () => {
        if (typeof window === "undefined") return;

        const { data } = await supabase.auth.getSession();
        if (data.session) {
            throw redirect({ to: "/dashboard" });
        }
    },
    component: SignupPage,
});

function SignupPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [confirmationEmail, setConfirmationEmail] = useState<string | null>(
        null,
    );

    const cleanedUsername = useMemo(
        () =>
            username
                .trim()
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, ""),
        [username],
    );

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters");
            return;
        }

        if (!cleanedUsername || cleanedUsername.length < 2) {
            toast.error("Username must be at least 2 characters");
            return;
        }

        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
                options: {
                    emailRedirectTo: `${window.location.origin}/dashboard`,
                    data: {
                        username: cleanedUsername,
                        display_name: cleanedUsername,
                    },
                },
            });

            if (error) {
                toast.error(error.message);
                return;
            }

            if (data.session) {
                toast.success("Account created");
                navigate({ to: "/dashboard" });
                return;
            }

            setConfirmationEmail(email.trim());
            toast.success("Account created. Check your email to confirm it.");
            setEmail("");
            setPassword("");
            setUsername("");
        } catch (error) {
            toast.error(
                error instanceof TypeError
                    ? "Could not reach Supabase. Check the project URL and restart the dev server."
                    : "Could not create account. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="min-h-screen bg-background text-foreground">
            <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
                <Link
                    to="/"
                    className="mb-8 flex items-center justify-center gap-2"
                >
                    <Heart className="h-8 w-8 fill-primary text-primary" />
                    <span className="text-2xl font-bold tracking-tight">
                        Naked Profile
                    </span>
                </Link>

                <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                    <h1 className="text-2xl font-bold tracking-tight">
                        Create your account
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Join Naked Profile and start using your profile right
                        away.
                    </p>

                    {confirmationEmail ? (
                        <div className="mt-5 rounded-lg border border-success/40 bg-success/10 px-4 py-3 text-sm text-foreground">
                            We sent a confirmation link to{" "}
                            <span className="font-semibold">
                                {confirmationEmail}
                            </span>
                            . Confirm your email, then log in.
                        </div>
                    ) : null}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                        <Field label="Username">
                            <input
                                value={username}
                                onChange={(event) =>
                                    setUsername(event.target.value)
                                }
                                autoComplete="username"
                                required
                                minLength={2}
                                maxLength={30}
                                pattern="[a-zA-Z0-9_]+"
                                placeholder="yourname"
                                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                            />
                        </Field>

                        <Field label="Email">
                            <input
                                type="email"
                                value={email}
                                onChange={(event) =>
                                    setEmail(event.target.value)
                                }
                                autoComplete="email"
                                required
                                placeholder="you@example.com"
                                className="h-11 w-full rounded-lg border border-border bg-background px-4 text-sm outline-none transition focus:border-primary"
                            />
                        </Field>

                        <Field label="Password">
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(event) =>
                                        setPassword(event.target.value)
                                    }
                                    autoComplete="new-password"
                                    required
                                    minLength={6}
                                    placeholder="At least 6 characters"
                                    className="h-11 w-full rounded-lg border border-border bg-background px-4 pr-11 text-sm outline-none transition focus:border-primary"
                                />
                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowPassword((current) => !current)
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition hover:text-foreground"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </Field>

                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-full bg-success px-4 text-sm font-semibold text-success-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : null}
                            {loading ? "Creating account..." : "Create account"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="font-semibold text-primary hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </section>
            </div>
        </main>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
                {label}
            </span>
            {children}
        </label>
    );
}
