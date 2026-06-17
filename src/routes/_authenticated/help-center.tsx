import { createFileRoute, Link } from "@tanstack/react-router";
import {
    CircleHelp,
    CreditCard,
    Edit3,
    Globe2,
    MonitorPlay,
    Search,
    Send,
    Sparkles,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/help-center")({
    head: () => ({ meta: [{ title: "Help Center - Naked Profile" }] }),
    component: HelpCenterPage,
});

const categories = [
    {
        articles: 16,
        description:
            "These articles are important for everyone on Naked Profile.",
        icon: Send,
        title: "Naked Profile Account Basics",
    },
    {
        articles: 7,
        description: "Staying compliant when applying and collaborating.",
        icon: Edit3,
        title: "Applying & Collaborators",
    },
    {
        articles: 95,
        description:
            "Checked out our Creator Hub and still have questions? Check out the articles here!",
        icon: Sparkles,
        title: "Creator Features and FAQs",
    },
    {
        articles: 8,
        description:
            "Covers everything fans will need to know to manage their subscriptions.",
        icon: MonitorPlay,
        title: "Purchasing Content & Managing Purchased Content",
    },
    {
        articles: 2,
        description:
            "This is for general age verification to access Naked Profile, for information on how to apply, check out the applying guides.",
        icon: CreditCard,
        title: "Age Verification Requirements",
    },
    {
        articles: 21,
        description:
            "Answers and troubleshooting steps to our most common questions.",
        icon: CircleHelp,
        title: "FAQs & Basic Troubleshooting",
    },
];

function HelpCenterPage() {
    return (
        <main className="min-h-screen bg-[#172538] text-white">
            <section className="min-h-screen bg-[linear-gradient(180deg,#4b9df2_0%,#3f85ce_18%,#172538_48%,#172538_100%)] px-5">
                <header className="mx-auto flex h-12 w-full max-w-[900px] items-center justify-between text-xs font-semibold">
                    <Link to="/dashboard" className="text-white/95">
                        Naked Profile Help Center
                    </Link>
                    <button className="inline-flex items-center gap-1 text-white/90">
                        <Globe2 className="h-3.5 w-3.5" />
                        English
                        <span className="text-[10px]">⌄</span>
                    </button>
                </header>

                <div className="mx-auto flex w-full max-w-[900px] flex-col items-center pt-6">
                    <h1 className="text-center text-[26px] font-black tracking-tight text-white sm:text-[30px]">
                        Advice and answers from the Naked Profile Team
                    </h1>

                    <label className="relative mt-8 w-full max-w-[440px]">
                        <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-white" />
                        <input
                            aria-label="Search for articles"
                            placeholder="Search for articles..."
                            className="h-14 w-full rounded-2xl border border-white/15 bg-white/20 pl-14 pr-5 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(18,69,126,0.25)] outline-none placeholder:text-white/95 transition focus:border-white/50 focus:bg-white/25"
                        />
                    </label>

                    <div className="mt-14 grid w-full grid-cols-1 gap-5 md:grid-cols-2">
                        {categories.map((category) => (
                            <HelpCard key={category.title} {...category} />
                        ))}
                    </div>
                </div>

                <footer className="mx-auto flex min-h-[260px] w-full max-w-[900px] flex-col items-center justify-end gap-8 pb-8 pt-16 text-[#86a4cf]">
                    <Link to="/help-center" className="text-sm">
                        Naked Profile Help Center
                    </Link>
                    <div className="flex items-center gap-8 text-xs">
                        <Link to="/terms" className="hover:text-white">
                            Terms
                        </Link>
                        <Link
                            to="/contact-support"
                            className="hover:text-white"
                        >
                            Complaint Process
                        </Link>
                    </div>
                </footer>
            </section>
        </main>
    );
}

function HelpCard({
    articles,
    description,
    icon: Icon,
    title,
}: {
    articles: number;
    description: string;
    icon: React.ElementType;
    title: string;
}) {
    return (
        <article className="group min-h-[170px] rounded-lg border border-[#315078] bg-[#17263a]/95 p-7 shadow-[0_22px_50px_rgba(4,12,24,0.18)] transition hover:-translate-y-0.5 hover:border-[#479df4] hover:bg-[#1b2b42]">
            <Icon
                className="h-8 w-8 text-[#40a6ff] transition group-hover:scale-105"
                strokeWidth={1.8}
            />
            <h2 className="mt-7 text-[15px] font-black leading-5 text-white">
                {title}
            </h2>
            <p className="mt-1 line-clamp-2 max-w-[380px] text-[13px] font-bold leading-5 text-white">
                {description}
            </p>
            <p className="mt-5 text-xs font-semibold text-white/90">
                {articles} articles
            </p>
        </article>
    );
}
