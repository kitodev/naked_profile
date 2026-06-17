import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { useRef, useState, useEffect } from "react";
import {
    Heart,
    Sparkles,
    Lock,
    DollarSign,
    Video,
    MessageCircle,
    Shield,
    Zap,
    Check,
    Play,
    Pause,
    EyeOff,
    Volume2,
    VolumeX,
    X,
} from "lucide-react";
import logo from "../assets/logo.png";
import creator1 from "../assets/creator1.jpg";
import creator2 from "../assets/creator2.jpg";
import creator3 from "../assets/creator3.jpg";
import creator4 from "../assets/creator4.jpg";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/")({
    head: () => ({
        meta: [
            { title: "Naked Profile — Connect with your favorite creators" },
            {
                name: "description",
                content:
                    "Naked Profile is the home for creators and fans. Subscribe, chat, tip and unlock exclusive content from creators you love.",
            },
            {
                property: "og:title",
                content: "Naked Profile — Connect with your favorite creators",
            },
            {
                property: "og:description",
                content:
                    "Subscribe, chat, tip and unlock exclusive content from creators you love.",
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
    component: Index,
});

const creators = [
    {
        name: "Aria Nakamura",
        handle: "@arianakamura",
        img: creator1,
        tier: "$9.99/mo",
        category: "Lifestyle",
    },
    {
        name: "Marcus Vale",
        handle: "@marcusvale",
        img: creator2,
        tier: "$12.99/mo",
        category: "Fitness",
    },
    {
        name: "Luna Pop",
        handle: "@lunapop",
        img: creator3,
        tier: "$7.99/mo",
        category: "Cosplay",
    },
    {
        name: "Theo Wren",
        handle: "@theowren",
        img: creator4,
        tier: "$5.99/mo",
        category: "Music",
    },
];

const features = [
    {
        icon: DollarSign,
        title: "Keep 80% of earnings",
        desc: "Industry-leading payouts. Get paid weekly with no hidden fees.",
    },
    {
        icon: MessageCircle,
        title: "Direct messages",
        desc: "Build real relationships with your audience through private chats and tips.",
    },
    {
        icon: Video,
        title: "Live streaming",
        desc: "Go live to your subscribers with HD streaming and real-time tipping.",
    },
    {
        icon: Lock,
        title: "Pay-per-view posts",
        desc: "Monetize individual posts, photos and videos beyond your subscription.",
    },
    {
        icon: Shield,
        title: "Creator-first safety",
        desc: "DMCA protection, watermarking, and tools to block, geo-restrict, and report.",
    },
    {
        icon: Zap,
        title: "Instant payouts",
        desc: "Cash out anytime to your bank or card. No waiting weeks for your money.",
    },
];

function Nav() {
    return (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                <Link to="/" className="flex items-center gap-2">
                    <img
                        src={logo}
                        alt="Naked Profile logo"
                        className="h-8 w-8"
                        width={32}
                        height={32}
                    />
                    <span className="text-2xl font-bold tracking-tight">
                        Naked Profile
                    </span>
                </Link>
                <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
                    <a href="#explore" className="hover:text-foreground">
                        Explore
                    </a>
                    <a href="#creators" className="hover:text-foreground">
                        For creators
                    </a>
                    <a href="#pricing" className="hover:text-foreground">
                        Pricing
                    </a>
                    <a href="#faq" className="hover:text-foreground">
                        FAQ
                    </a>
                </nav>
                <div className="flex items-center gap-3">
                    <Link
                        to="/login"
                        className="hidden rounded-full px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground sm:block"
                    >
                        Log in
                    </Link>
                    <Link
                        to="/signup"
                        className="rounded-full bg-success px-5 py-2 text-sm font-semibold text-success-foreground transition hover:brightness-110"
                    >
                        Sign up
                    </Link>
                </div>
            </div>
        </header>
    );
}

function Hero() {
    return (
        <section
            className="relative overflow-hidden"
            style={{ background: "var(--gradient-hero)" }}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                    backgroundImage:
                        "radial-gradient(circle at 20% 20%, oklch(0.72 0.17 235 / 0.4), transparent 40%), radial-gradient(circle at 80% 30%, oklch(0.65 0.20 320 / 0.3), transparent 40%)",
                }}
            />
            <div className="relative mx-auto grid max-w-7xl gap-12 px-6 py-24 md:grid-cols-2 md:items-center md:py-32">
                <div>
                    <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur">
                        <Sparkles className="h-3.5 w-3.5 text-primary" />
                        Now paying creators 80% — the highest in the industry
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight md:text-7xl">
                        Where fans
                        <br />
                        <span
                            className="bg-clip-text text-transparent"
                            style={{
                                backgroundImage: "var(--gradient-primary)",
                            }}
                        >
                            meet creators.
                        </span>
                    </h1>
                    <p className="mt-6 max-w-lg text-lg text-muted-foreground">
                        Naked Profile is the home for independent creators and
                        the people who love them. Subscribe, chat, tip and
                        unlock exclusive content — all in one place.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link
                            to="/signup"
                            className="rounded-full bg-success px-7 py-3.5 text-base font-semibold text-success-foreground transition hover:brightness-110"
                            style={{
                                boxShadow:
                                    "0 10px 30px -10px oklch(0.78 0.20 145 / 0.6)",
                            }}
                        >
                            Create your account
                        </Link>
                        <Link
                            to="/discover"
                            className="rounded-full border border-border bg-card/50 px-7 py-3.5 text-base font-semibold text-foreground backdrop-blur transition hover:bg-card"
                        >
                            Browse creators
                        </Link>
                    </div>
                    <div className="mt-10 flex items-center gap-6 text-sm text-muted-foreground">
                        <div>
                            <span className="text-2xl font-bold text-foreground">
                                2M+
                            </span>
                            <div>Creators</div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                            <span className="text-2xl font-bold text-foreground">
                                $1.2B
                            </span>
                            <div>Paid to creators</div>
                        </div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                            <span className="text-2xl font-bold text-foreground">
                                190+
                            </span>
                            <div>Countries</div>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div
                        className="absolute -inset-8 rounded-3xl"
                        style={{
                            background: "var(--gradient-primary)",
                            filter: "blur(80px)",
                            opacity: 0.3,
                        }}
                    />
                    <div className="relative grid grid-cols-2 gap-4">
                        {creators.map((c, i) => (
                            <div
                                key={c.handle}
                                className={`group relative overflow-hidden rounded-2xl border border-border ${i % 2 === 0 ? "translate-y-6" : ""}`}
                                style={{
                                    background: "var(--gradient-card)",
                                    boxShadow: "var(--shadow-card)",
                                }}
                            >
                                <img
                                    src={c.img}
                                    alt={c.name}
                                    className="aspect-[4/5] w-full object-cover transition duration-700 group-hover:scale-105"
                                    loading={i === 0 ? "eager" : "lazy"}
                                    width={512}
                                    height={640}
                                />
                                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-background/95 via-background/70 to-transparent p-4">
                                    <div className="text-sm font-semibold">
                                        {c.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {c.handle} · {c.tier}
                                    </div>
                                </div>
                                <div className="absolute right-3 top-3 rounded-full bg-background/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                                    {c.category}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

function Explore() {
    return (
        <section id="explore" className="mx-auto max-w-7xl px-6 py-24">
            <div className="mb-12 flex items-end justify-between">
                <div>
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Discover what you love
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">
                        Trending creators across every category.
                    </p>
                </div>
                <a
                    href="#"
                    className="hidden text-sm font-medium text-primary hover:underline md:block"
                >
                    View all →
                </a>
            </div>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                {creators.map((c) => (
                    <div
                        key={c.handle}
                        className="group cursor-pointer overflow-hidden rounded-2xl border border-border"
                        style={{ background: "var(--gradient-card)" }}
                    >
                        <div className="relative">
                            <img
                                src={c.img}
                                alt={c.name}
                                className="aspect-square w-full object-cover transition duration-500 group-hover:scale-105"
                                loading="lazy"
                                width={512}
                                height={512}
                            />
                            <div className="absolute right-2 top-2 rounded-full bg-success px-2 py-0.5 text-[10px] font-bold uppercase text-success-foreground">
                                Live
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="font-semibold">{c.name}</div>
                            <div className="text-xs text-muted-foreground">
                                {c.handle}
                            </div>
                            <button className="mt-3 w-full rounded-full bg-primary py-2 text-xs font-semibold text-primary-foreground transition hover:brightness-110">
                                Subscribe · {c.tier}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function Features() {
    return (
        <section id="creators" className="border-y border-border bg-card/30">
            <div className="mx-auto max-w-7xl px-6 py-24">
                <div className="mx-auto mb-16 max-w-2xl text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary">
                        <Heart className="h-3.5 w-3.5" /> For creators
                    </div>
                    <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                        Built to help you earn more
                    </h2>
                    <p className="mt-4 text-lg text-muted-foreground">
                        Everything you need to grow, engage, and monetize your
                        audience — without taking a cut of your soul.
                    </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, desc }) => (
                        <div
                            key={title}
                            className="group rounded-2xl border border-border p-6 transition hover:border-primary/50"
                            style={{ background: "var(--gradient-card)" }}
                        >
                            <div
                                className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl"
                                style={{
                                    background: "var(--gradient-primary)",
                                }}
                            >
                                <Icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold">{title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">
                                {desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

function Pricing() {
    const plans = [
        {
            name: "Fan",
            price: "Free",
            desc: "Browse, follow and subscribe to creators.",
            features: [
                "Free account",
                "Tip your favorites",
                "Direct messages",
                "Watch live streams",
            ],
            cta: "Sign up free",
            highlight: false,
        },
        {
            name: "Creator",
            price: "Free",
            desc: "Start earning from day one. We take 20%.",
            features: [
                "Set your subscription price",
                "Pay-per-view posts",
                "Live streaming + tips",
                "Weekly payouts",
                "Full analytics",
            ],
            cta: "Become a creator",
            highlight: true,
        },
        {
            name: "Agency",
            price: "Custom",
            desc: "Manage a roster of creators with team tools.",
            features: [
                "Multi-account dashboard",
                "Role-based permissions",
                "Bulk messaging",
                "Priority support",
                "Custom contracts",
            ],
            cta: "Contact sales",
            highlight: false,
        },
    ];
    return (
        <section id="pricing" className="mx-auto max-w-7xl px-6 py-24">
            <div className="mx-auto mb-16 max-w-2xl text-center">
                <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
                    Simple, creator-friendly pricing
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                    No setup fees. No monthly costs. You only pay when you earn.
                </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
                {plans.map((p) => (
                    <div
                        key={p.name}
                        className={`relative rounded-3xl border p-8 ${p.highlight ? "border-primary/60" : "border-border"}`}
                        style={{
                            background: p.highlight
                                ? "var(--gradient-primary)"
                                : "var(--gradient-card)",
                            boxShadow: p.highlight
                                ? "var(--shadow-glow)"
                                : "var(--shadow-card)",
                        }}
                    >
                        {p.highlight && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-success px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-success-foreground">
                                Most popular
                            </div>
                        )}
                        <div
                            className={
                                p.highlight ? "text-primary-foreground" : ""
                            }
                        >
                            <h3 className="text-xl font-bold">{p.name}</h3>
                            <div className="mt-4 text-5xl font-bold">
                                {p.price}
                            </div>
                            <p
                                className={`mt-2 text-sm ${p.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                            >
                                {p.desc}
                            </p>
                            <ul className="my-8 space-y-3">
                                {p.features.map((f) => (
                                    <li
                                        key={f}
                                        className="flex items-start gap-2 text-sm"
                                    >
                                        <Check
                                            className={`mt-0.5 h-4 w-4 shrink-0 ${p.highlight ? "text-success-foreground" : "text-success"}`}
                                        />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                            <button
                                className={`w-full rounded-full py-3 text-sm font-semibold transition ${p.highlight ? "bg-background text-foreground hover:brightness-110" : "bg-success text-success-foreground hover:brightness-110"}`}
                            >
                                {p.cta}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

function FAQ() {
    const items = [
        {
            q: "Who can become a Naked Profile creator?",
            a: "Anyone 18+ who passes our verification process. We welcome creators across all SFW and adult categories.",
        },
        {
            q: "How much does Naked Profile take?",
            a: "We take a flat 20% — you keep 80% of all subscriptions, tips, and pay-per-view earnings.",
        },
        {
            q: "How fast do I get paid?",
            a: "Earnings settle daily and can be cashed out instantly to your bank or card with no minimum threshold.",
        },
        {
            q: "Is my content protected?",
            a: "Yes. Every upload is watermarked, DMCA-protected, and we provide takedown support if your content is leaked.",
        },
    ];
    return (
        <section id="faq" className="border-t border-border">
            <div className="mx-auto max-w-3xl px-6 py-24">
                <h2 className="mb-12 text-center text-4xl font-bold tracking-tight md:text-5xl">
                    Questions, answered
                </h2>
                <div className="space-y-3">
                    {items.map((it) => (
                        <details
                            key={it.q}
                            className="group rounded-2xl border border-border p-6 transition open:border-primary/40"
                            style={{ background: "var(--gradient-card)" }}
                        >
                            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">
                                {it.q}
                                <span className="text-primary transition group-open:rotate-45">
                                    +
                                </span>
                            </summary>
                            <p className="mt-3 text-sm text-muted-foreground">
                                {it.a}
                            </p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}

function CTA() {
    return (
        <section className="mx-auto max-w-7xl px-6 pb-24">
            <div
                className="relative overflow-hidden rounded-3xl border border-primary/30 p-12 text-center md:p-20"
                style={{
                    background: "var(--gradient-primary)",
                    boxShadow: "var(--shadow-glow)",
                }}
            >
                <div
                    className="pointer-events-none absolute inset-0 opacity-20"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 30% 30%, white, transparent 40%)",
                    }}
                />
                <h2 className="relative text-4xl font-bold tracking-tight text-primary-foreground md:text-6xl">
                    Your fans are waiting.
                </h2>
                <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
                    Start earning in minutes. No setup fees, no monthly costs,
                    no nonsense.
                </p>
                <button className="relative mt-8 rounded-full bg-background px-8 py-4 text-base font-semibold text-foreground transition hover:brightness-110">
                    Create your free account
                </button>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="border-t border-border">
            <div className="mx-auto max-w-7xl px-6 py-12">
                <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
                    <div>
                        <Link to="/" className="flex items-center gap-2">
                            <img
                                src={logo}
                                alt="Naked Profile logo"
                                className="h-7 w-7"
                                width={28}
                                height={28}
                                loading="lazy"
                            />
                            <span className="text-xl font-bold">
                                Naked Profile
                            </span>
                        </Link>
                        <p className="mt-3 text-sm text-muted-foreground">
                            Where fans meet creators.
                        </p>
                    </div>
                    <div className="grid grid-cols-3 gap-12 text-sm">
                        <div className="space-y-2">
                            <div className="font-semibold">Product</div>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                Explore
                            </a>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                Pricing
                            </a>
                        </div>
                        <div className="space-y-2">
                            <div className="font-semibold">Company</div>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                About
                            </a>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                Careers
                            </a>
                        </div>
                        <div className="space-y-2">
                            <div className="font-semibold">Legal</div>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                Terms
                            </a>
                            <a
                                className="block text-muted-foreground hover:text-foreground"
                                href="#"
                            >
                                Privacy
                            </a>
                        </div>
                    </div>
                </div>
                <div className="mt-10 border-t border-border pt-6 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Naked Profile. All rights
                    reserved. 18+ only.
                </div>
            </div>
        </footer>
    );
}

const reels = [
    {
        name: "Aria",
        handle: "@arianakamura",
        poster: creator1,
        src: "https://cdn.coverr.co/videos/coverr-a-woman-laughing-at-a-cafe-9171/1080p.mp4",
        locked: false,
    },
    {
        name: "Hidden",
        handle: "@private",
        poster: creator2,
        src: "",
        locked: true,
    },
    {
        name: "Marcus",
        handle: "@marcusvale",
        poster: creator2,
        src: "https://cdn.coverr.co/videos/coverr-a-man-skateboarding-1573/1080p.mp4",
        locked: false,
    },
    {
        name: "Luna",
        handle: "@lunapop",
        poster: creator3,
        src: "https://cdn.coverr.co/videos/coverr-a-woman-in-a-floral-dress-5244/1080p.mp4",
        locked: false,
    },
    {
        name: "Theo",
        handle: "@theowren",
        poster: creator4,
        src: "https://cdn.coverr.co/videos/coverr-a-musician-playing-guitar-2849/1080p.mp4",
        locked: false,
    },
];

function ReelCard({
    reel,
    onOpen,
}: {
    reel: (typeof reels)[number];
    onOpen: () => void;
}) {
    return (
        <button
            onClick={reel.locked ? undefined : onOpen}
            className="group relative aspect-[9/16] overflow-hidden rounded-2xl border border-border bg-card text-left"
            style={{ boxShadow: "var(--shadow-card)" }}
        >
            <img
                src={reel.poster}
                alt={reel.name}
                className={`h-full w-full object-cover transition duration-500 group-hover:scale-105 ${reel.locked ? "blur-2xl scale-110" : ""}`}
                loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/10 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-background/40 backdrop-blur-md ring-1 ring-white/20 transition group-hover:scale-110">
                    {reel.locked ? (
                        <EyeOff className="h-7 w-7 text-foreground/80" />
                    ) : (
                        <Play className="ml-1 h-7 w-7 fill-foreground text-foreground" />
                    )}
                </div>
            </div>
            {!reel.locked && (
                <div className="absolute inset-x-0 bottom-0 p-3">
                    <div className="text-xs font-semibold">{reel.name}</div>
                    <div className="text-[10px] text-muted-foreground">
                        {reel.handle}
                    </div>
                </div>
            )}
            {reel.locked && (
                <div className="absolute left-1/2 top-[62%] -translate-x-1/2 rounded-full bg-background/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider backdrop-blur">
                    Subscribe to unlock
                </div>
            )}
        </button>
    );
}

function VideoPlayer({
    src,
    poster,
    onClose,
}: {
    src: string;
    poster: string;
    onClose: () => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [playing, setPlaying] = useState(true);
    const [muted, setMuted] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    const toggle = () => {
        const v = videoRef.current;
        if (!v) return;
        if (v.paused) {
            v.play();
            setPlaying(true);
        } else {
            v.pause();
            setPlaying(false);
        }
    };
    const toggleMute = () => {
        const v = videoRef.current;
        if (!v) return;
        v.muted = !v.muted;
        setMuted(v.muted);
    };
    const onTime = () => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        setProgress((v.currentTime / v.duration) * 100);
    };
    const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const v = videoRef.current;
        if (!v || !v.duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const pct = (e.clientX - rect.left) / rect.width;
        v.currentTime = pct * v.duration;
    };

    return (
        <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-background/90 backdrop-blur-xl p-4"
            onClick={onClose}
        >
            <button
                onClick={onClose}
                className="absolute right-5 top-5 rounded-full bg-card/80 p-2 text-foreground hover:bg-card"
                aria-label="Close"
            >
                <X className="h-5 w-5" />
            </button>
            <div
                className="relative aspect-[9/16] h-full max-h-[85vh] overflow-hidden rounded-3xl border border-border bg-black"
                style={{ boxShadow: "var(--shadow-glow)" }}
                onClick={(e) => e.stopPropagation()}
            >
                <video
                    ref={videoRef}
                    src={src}
                    poster={poster}
                    autoPlay
                    loop
                    playsInline
                    onTimeUpdate={onTime}
                    onClick={toggle}
                    className="h-full w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div
                        className="mb-3 h-1 cursor-pointer overflow-hidden rounded-full bg-white/20"
                        onClick={onSeek}
                    >
                        <div
                            className="h-full bg-primary transition-[width]"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-3 text-foreground">
                        <button
                            onClick={toggle}
                            className="rounded-full bg-white/15 p-2 backdrop-blur hover:bg-white/25"
                            aria-label={playing ? "Pause" : "Play"}
                        >
                            {playing ? (
                                <Pause className="h-4 w-4" />
                            ) : (
                                <Play className="h-4 w-4" />
                            )}
                        </button>
                        <button
                            onClick={toggleMute}
                            className="rounded-full bg-white/15 p-2 backdrop-blur hover:bg-white/25"
                            aria-label={muted ? "Unmute" : "Mute"}
                        >
                            {muted ? (
                                <VolumeX className="h-4 w-4" />
                            ) : (
                                <Volume2 className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Reels() {
    const [active, setActive] = useState<number | null>(null);
    return (
        <section className="border-y border-border bg-background">
            <div className="mx-auto max-w-7xl px-6 py-24">
                <div className="mb-10 text-center">
                    <h2
                        className="text-5xl font-bold tracking-tight md:text-7xl"
                        style={{
                            backgroundImage: "var(--gradient-primary)",
                            WebkitBackgroundClip: "text",
                            backgroundClip: "text",
                            color: "transparent",
                        }}
                    >
                        Naked Profile
                    </h2>
                    <p className="mt-3 text-lg text-muted-foreground">
                        Tap a reel to watch in full screen.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
                    {reels.map((r, i) => (
                        <ReelCard
                            key={i}
                            reel={r}
                            onOpen={() => setActive(i)}
                        />
                    ))}
                </div>
            </div>
            {active !== null && !reels[active].locked && (
                <VideoPlayer
                    src={reels[active].src}
                    poster={reels[active].poster}
                    onClose={() => setActive(null)}
                />
            )}
        </section>
    );
}

function Index() {
    return (
        <div className="min-h-screen">
            <Nav />
            <main>
                <Hero />
                <Reels />
                <Explore />
                <Features />
                <Pricing />
                <FAQ />
                <CTA />
            </main>
            <Footer />
        </div>
    );
}
