import {
    createFileRoute,
    Link,
    redirect,
    useNavigate,
} from "@tanstack/react-router";
import { useState } from "react";
import { Eye, EyeOff, Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/login")({
    head: () => ({
        meta: [
            { title: "Log in - Naked Profile" },
            {
                name: "description",
                content:
                    "Log in to Naked Profile to access your dashboard and profile.",
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
    component: LoginPage,
});

function LoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleSubmit(event: React.FormEvent) {
        event.preventDefault();
        setLoading(true);

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                if (
                    error.message.toLowerCase().includes("email not confirmed")
                ) {
                    toast.error("Please confirm your email before logging in.");
                    return;
                }

                toast.error(error.message);
                return;
            }

            toast.success("Welcome back");
            navigate({ to: "/dashboard" });
        } catch (error) {
            toast.error(
                error instanceof TypeError
                    ? "Could not reach Supabase. Check the project URL and restart the dev server."
                    : "Could not log in. Please try again.",
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
                        Welcome back
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Log in to continue to Naked Profile.
                    </p>

                    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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
                                    autoComplete="current-password"
                                    required
                                    placeholder="Your password"
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
                            {loading ? "Logging in..." : "Log in"}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-muted-foreground">
                        New to Naked Profile?{" "}
                        <Link
                            to="/signup"
                            className="font-semibold text-primary hover:underline"
                        >
                            Create an account
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
