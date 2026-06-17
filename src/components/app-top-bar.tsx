import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
    Bell,
    BellRing,
    Bookmark,
    ChevronDown,
    CircleDollarSign,
    Cog,
    CreditCard,
    FileText,
    Globe2,
    HelpCircle,
    Link2,
    Image as ImageIcon,
    Languages,
    LifeBuoy,
    List,
    LogOut,
    Mail,
    MessageCircle,
    Monitor,
    Search,
    Settings,
    Shield,
    ShieldCheck,
    Sparkles,
    Sun,
    UserCog,
    Trophy,
    UserCircle,
    Users,
    Wallet,
} from "lucide-react";
import { toast } from "sonner";
import logo from "../assets/logo.png";
import { supabase } from "../integrations/supabase/client";

type Status = "online" | "away" | "hidden";
type Profile = {
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
};

const STATUS_DOTS: Record<Status, string> = {
    online: "bg-success",
    away: "bg-yellow-400",
    hidden: "bg-muted-foreground",
};

export function AppTopBar() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [status, setStatus] = useState<Status>("online");

    useEffect(() => {
        (async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("profiles")
                .select("username, display_name, avatar_url")
                .eq("id", user.id)
                .maybeSingle();

            setProfile(
                data ?? {
                    username: user.email?.split("@")[0] ?? "user",
                    display_name: null,
                    avatar_url: null,
                },
            );
        })();
    }, []);

    return (
        <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
                <Link to="/dashboard" className="flex items-center gap-2">
                    <img src={logo} alt="Naked Profile" className="h-7 w-7" />
                    <span className="text-xl font-bold tracking-tight">
                        Naked Profile
                    </span>
                </Link>
                <div className="ml-2 hidden flex-1 max-w-md md:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            placeholder="Search creators, posts, tags..."
                            className="w-full rounded-full border border-border bg-card/60 py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
                        />
                    </div>
                </div>
                <div className="ml-auto flex items-center gap-1">
                    <TopIcon label="Messages" to="/messages">
                        <MessageCircle className="h-5 w-5" />
                    </TopIcon>
                    <TopIcon label="Discover" to="/discover">
                        <Globe2 className="h-5 w-5" />
                    </TopIcon>
                    <TopIcon label="Inbox" to="/inbox">
                        <Mail className="h-5 w-5" />
                    </TopIcon>
                    <TopIcon label="Notifications" to="/notifications">
                        <Bell className="h-5 w-5" />
                    </TopIcon>
                    <div className="ml-1 hidden items-center gap-1 rounded-full border border-border bg-card/60 px-3 py-1.5 text-sm font-medium sm:flex">
                        <span className="text-muted-foreground">$</span>
                        <span>0</span>
                    </div>
                    <TopUserMenu
                        profile={profile}
                        status={status}
                        setStatus={setStatus}
                    />
                </div>
            </div>
        </header>
    );
}

function TopUserMenu({
    profile,
    status,
    setStatus,
}: {
    profile: Profile | null;
    status: Status;
    setStatus: (status: Status) => void;
}) {
    const [open, setOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);
    const name = profile?.display_name || profile?.username || "you";
    const handle = profile?.username ? `@${profile.username}` : "";

    useEffect(() => {
        const handler = (event: MouseEvent) => {
            if (!ref.current?.contains(event.target as Node)) setOpen(false);
        };

        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    async function handleLogout() {
        await supabase.auth.signOut();
        toast.success("Logged out");
        window.location.href = "/";
    }

    return (
        <div className="relative" ref={ref}>
            <button
                onClick={() => setOpen((current) => !current)}
                className="ml-1 flex items-center gap-1 rounded-full border border-border bg-card/60 p-1 pl-1.5 hover:bg-card"
                aria-label="Account menu"
            >
                <Avatar profile={profile} size={28} />
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </button>

            {open && (
                <div className="absolute right-0 top-12 z-50 max-h-[calc(100vh-5rem)] w-72 overflow-y-auto rounded-xl border border-border bg-card shadow-2xl">
                    <div className="flex flex-col items-center gap-2 px-4 pb-3 pt-5">
                        <div className="relative">
                            <Avatar profile={profile} size={64} />
                            <span
                                className={`absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full ring-2 ring-card ${STATUS_DOTS[status]}`}
                            />
                        </div>
                        <div className="text-center">
                            <div className="text-sm font-semibold">{name}</div>
                            {handle && (
                                <div className="text-xs text-muted-foreground">
                                    {handle}
                                </div>
                            )}
                        </div>
                        <div className="mt-1 flex w-full rounded-lg border border-border bg-background/60 p-1">
                            {(["online", "away", "hidden"] as Status[]).map(
                                (item) => (
                                    <button
                                        key={item}
                                        onClick={() => setStatus(item)}
                                        className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-xs font-medium capitalize transition ${status === item ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                                    >
                                        <span
                                            className={`h-2 w-2 rounded-full ${STATUS_DOTS[item]}`}
                                        />
                                        {item}
                                    </button>
                                ),
                            )}
                        </div>
                        <div className="mt-2 grid w-full grid-cols-2 gap-2 text-center">
                            <Stat label="Likes" value={0} />
                            <Stat label="Followers" value={0} />
                        </div>
                    </div>
                    <div className="border-t border-border py-1">
                        <MenuItem
                            icon={<UserCircle className="h-4 w-4" />}
                            label="Profile"
                            to="/profile"
                        />
                        <MenuItem
                            icon={<CreditCard className="h-4 w-4" />}
                            label="Subscriptions"
                            to="/subscriptions"
                        />
                        <MenuItem
                            icon={<ImageIcon className="h-4 w-4" />}
                            label="Media Collection"
                            to="/media-collection"
                        />
                        <MenuItem
                            icon={<List className="h-4 w-4" />}
                            label="Lists"
                            to="/lists"
                        />
                        <MenuItem
                            icon={<Bookmark className="h-4 w-4" />}
                            label="Bookmarks"
                            to="/bookmarks"
                        />
                        <MenuItem
                            icon={<MessageCircle className="h-4 w-4" />}
                            label="Messages"
                            to="/messages"
                        />
                        <MenuItem
                            icon={<BellRing className="h-4 w-4" />}
                            label="Notifications"
                            to="/notifications"
                        />
                    </div>
                    <div className="border-t border-border py-1">
                        <MenuItem
                            icon={<Wallet className="h-4 w-4" />}
                            label="Add Payment Method"
                            to="/payment-method"
                        />
                        <MenuItem
                            icon={<Sparkles className="h-4 w-4 text-primary" />}
                            label="Become A Creator"
                            to="/become-creator"
                        />
                        <MenuItem
                            icon={<LifeBuoy className="h-4 w-4" />}
                            label="Contact Support"
                            to="/contact-support"
                        />
                        <MenuItem
                            icon={<HelpCircle className="h-4 w-4" />}
                            label="Help Center"
                            to="/help-center"
                        />
                        <MenuItem
                            icon={<Trophy className="h-4 w-4" />}
                            label="Leaderboard"
                            to="/leaderboard"
                        />
                        <MenuItem
                            icon={<Users className="h-4 w-4" />}
                            label="Referrals"
                            to="/referrals"
                        />
                    </div>
                    <div className="border-t border-border py-1">
                        <MenuItem
                            icon={<FileText className="h-4 w-4" />}
                            label="Terms"
                            to="/terms"
                        />
                        <MenuItem
                            icon={<Shield className="h-4 w-4" />}
                            label="Privacy Policy"
                            to="/privacy-policy"
                        />
                    </div>
                    <div className="border-t border-border py-1">
                        <button
                            onClick={() =>
                                setSettingsOpen((current) => !current)
                            }
                            className="flex w-full items-center gap-3 px-4 py-2 text-sm font-semibold text-foreground hover:bg-background/60"
                            aria-expanded={settingsOpen}
                        >
                            <span className="text-primary">
                                <Settings className="h-4 w-4" />
                            </span>
                            <span className="flex-1 text-left">Settings</span>
                            <ChevronDown
                                className={`h-4 w-4 text-muted-foreground transition-transform ${settingsOpen ? "rotate-180" : ""}`}
                            />
                        </button>
                        {settingsOpen && (
                            <div className="bg-background/25 py-1">
                                <MenuItem
                                    icon={<UserCog className="h-4 w-4" />}
                                    label="Account"
                                    to="/settings"
                                />
                                <MenuItem
                                    icon={<ShieldCheck className="h-4 w-4" />}
                                    label="Privacy & Safety"
                                    to="/privacy-policy"
                                />
                                <MenuItem
                                    icon={
                                        <CircleDollarSign className="h-4 w-4" />
                                    }
                                    label="Payments"
                                    to="/payment-method"
                                />
                                <MenuItem
                                    icon={<Monitor className="h-4 w-4" />}
                                    label="Display"
                                    to="/appearance"
                                />
                                <MenuItem
                                    icon={<Bell className="h-4 w-4" />}
                                    label="Notifications"
                                    to="/notifications"
                                />
                                <MenuItem
                                    icon={<Link2 className="h-4 w-4" />}
                                    label="Connections"
                                    to="/referrals"
                                />
                                <MenuItem
                                    icon={<Cog className="h-4 w-4" />}
                                    label="All Settings"
                                    to="/settings"
                                />
                                <MenuItem
                                    icon={<Languages className="h-4 w-4" />}
                                    label="Language"
                                    to="/language"
                                />
                                <MenuItem
                                    icon={<Sun className="h-4 w-4" />}
                                    label="Light Mode"
                                    to="/appearance"
                                />
                            </div>
                        )}
                    </div>
                    <div className="border-t border-border p-1">
                        <button
                            onClick={handleLogout}
                            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 hover:bg-background/60"
                        >
                            <LogOut className="h-4 w-4" />
                            Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

function MenuItem({
    icon,
    label,
    to,
    trailing,
}: {
    icon: React.ReactNode;
    label: string;
    to: string;
    trailing?: React.ReactNode;
}) {
    return (
        <Link
            to={to}
            className="flex w-full items-center gap-3 px-4 py-2 text-sm text-foreground/90 hover:bg-background/60"
        >
            <span className="text-muted-foreground">{icon}</span>
            <span className="flex-1 text-left">{label}</span>
            {trailing && (
                <span className="text-muted-foreground">{trailing}</span>
            )}
        </Link>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div className="rounded-md bg-background/60 px-2 py-1.5">
            <div className="text-sm font-semibold">{value}</div>
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                {label}
            </div>
        </div>
    );
}

function Avatar({ profile, size }: { profile: Profile | null; size: number }) {
    const letter = (profile?.display_name || profile?.username || "U")
        .charAt(0)
        .toUpperCase();

    if (profile?.avatar_url) {
        return (
            <img
                src={profile.avatar_url}
                alt=""
                className="rounded-full object-cover"
                style={{ width: size, height: size }}
            />
        );
    }

    return (
        <span
            className="flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-success font-semibold text-background"
            style={{ width: size, height: size, fontSize: size / 2.4 }}
        >
            {letter}
        </span>
    );
}

function TopIcon({
    children,
    label,
    to,
}: {
    children: React.ReactNode;
    label: string;
    to: string;
}) {
    return (
        <Link
            to={to}
            aria-label={label}
            className="relative rounded-full p-2 text-foreground/80 hover:bg-card hover:text-foreground"
        >
            {children}
        </Link>
    );
}
