import { createFileRoute } from "@tanstack/react-router";
import {
    BadgeCheck,
    CheckCircle2,
    DollarSign,
    Heart,
    Headphones,
    Loader2,
    Search,
    Sparkles,
    WalletCards,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import logo from "../../assets/logo.png";
import creator1 from "../../assets/creator1.jpg";
import creator2 from "../../assets/creator2.jpg";
import creator3 from "../../assets/creator3.jpg";
import creator4 from "../../assets/creator4.jpg";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "../../components/ui/accordion";
import { supabase } from "../../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated/become-creator")({
    head: () => ({ meta: [{ title: "Become A Creator - Naked Profile" }] }),
    component: BecomeCreatorPage,
});

const features = [
    {
        icon: Search,
        title: "Powerful Discoverability",
        text: "Get seen by fans who already love your niche and content style.",
    },
    {
        icon: BadgeCheck,
        title: "Spicy Work Approved",
        text: "Build a paid community with creator-friendly moderation.",
    },
    {
        icon: DollarSign,
        title: "Referral Bonuses",
        text: "Earn extra rewards when you bring creators into Naked Profile.",
    },
    {
        icon: Headphones,
        title: "Superior Customer Service",
        text: "Creator support is ready when you need account help.",
    },
    {
        icon: Sparkles,
        title: "Incredible Features",
        text: "Posts, messages, subscriptions, collections, and creator tools.",
    },
    {
        icon: WalletCards,
        title: "Standard 80/20 split",
        text: "You keep 80% of eligible creator earnings.",
    },
];

const stories = [
    {
        image: creator1,
        name: "Sage Rose",
        text: "Naked Profile lets me package my shoots, keep subscribers close, and launch new sets without jumping between tools.",
    },
    {
        image: creator2,
        name: "Axel Atlas",
        text: "The dashboard made it simple to turn my fitness audience into monthly supporters.",
    },
    {
        image: creator3,
        name: "Nova Rae",
        text: "I moved my behind-the-scenes posts here and saw better fan replies within the first week.",
    },
    {
        image: creator4,
        name: "Luna Vale",
        text: "Collections, paid posts, and messaging give my members a smoother experience.",
    },
    {
        image: creator1,
        name: "Althea",
        text: "The creator split and payout flow gave me more confidence to post consistently.",
    },
    {
        image: creator2,
        name: "Kendall",
        text: "I can manage promos, subscribers, and direct messages without losing the personal feel.",
    },
    {
        image: creator3,
        name: "Mila Joy",
        text: "Naked Profile helped me turn casual fans into a real paid community.",
    },
    {
        image: creator4,
        name: "Tess Lane",
        text: "My regulars love having one place for updates, media, and private messages.",
    },
];

const faqs = [
    {
        q: "What is Naked Profile?",
        a: "Naked Profile is a platform for creators to publish content, manage subscriptions, and build paid fan communities.",
    },
    {
        q: "How can I get started?",
        a: "Submit the creator application with your creator name, niche, portfolio link, and payout email. The team can then review your profile.",
    },
    {
        q: "How much can I earn on Naked Profile?",
        a: "Earnings depend on your pricing, audience, posting cadence, and fan retention. The standard split lets creators keep 80% of eligible earnings.",
    },
    {
        q: "What currencies and payout methods are available?",
        a: "Payout availability depends on your region and the payment partners connected to your account.",
    },
];

function BecomeCreatorPage() {
    const [showVerification, setShowVerification] = useState(false);
    const [startingVerification, setStartingVerification] = useState(false);

    async function startVerification() {
        setStartingVerification(true);

        try {
            const accessToken = await getFreshAccessToken();
            let response = await fetch(getVerificationApiUrl(), {
                method: "POST",
                headers: {
                    authorization: `Bearer ${accessToken}`,
                    "content-type": "application/json",
                },
            });

            if (response.status === 401) {
                const retryToken = await getFreshAccessToken(true);
                response = await fetch(getVerificationApiUrl(), {
                    method: "POST",
                    headers: {
                        authorization: `Bearer ${retryToken}`,
                        "content-type": "application/json",
                    },
                });
            }

            const payload = (await response.json().catch(() => ({}))) as {
                error?: string;
                verificationUrl?: string;
            };

            if (!response.ok || !payload.verificationUrl) {
                throw new Error(
                    payload.error ?? "Could not start AgeVerif verification.",
                );
            }

            window.location.href = payload.verificationUrl;
        } catch (error) {
            toast.error(
                error instanceof Error
                    ? error.message
                    : "Could not start AgeVerif verification.",
            );
            setStartingVerification(false);
        }
    }

    return (
        <main className="min-h-screen bg-[#111318] text-white">
            <header className="flex h-16 w-full items-center border-b border-white/10 px-8 lg:px-24">
                <div className="flex items-center gap-3">
                    <img
                        src={logo}
                        alt="Naked Profile"
                        className="h-10 w-10 object-contain"
                    />
                    <span className="text-2xl font-black tracking-tight">
                        Naked Profile
                    </span>
                </div>
            </header>

            {showVerification ? (
                <VerificationIntro
                    onStart={startVerification}
                    starting={startingVerification}
                />
            ) : (
                <CreatorLanding onApply={() => setShowVerification(true)} />
            )}
        </main>
    );
}

function CreatorLanding({ onApply }: { onApply: () => void }) {
    return (
        <>
            <section className="relative overflow-hidden bg-[#1a1d24]">
                <div className="absolute left-[16%] top-[-90px] h-48 w-56 rotate-12 rounded-3xl border border-white/5 bg-white/[0.03]" />
                <div className="absolute right-[14%] top-[-60px] h-44 w-52 -rotate-6 rounded-3xl border border-white/5 bg-white/[0.03]" />
                <div className="grid min-h-[260px] w-full grid-cols-1 items-center gap-8 px-8 py-10 md:grid-cols-[1fr_auto_1fr] lg:px-24">
                    <p className="text-center text-base font-bold md:text-left">
                        Apply to become a Verified Creator within hours!
                    </p>

                    <div className="relative mx-auto h-52 w-[520px] max-w-full">
                        {[creator1, creator2, creator3, creator4].map(
                            (image, index) => (
                                <img
                                    key={image}
                                    src={image}
                                    alt=""
                                    className="absolute bottom-5 h-44 w-32 rounded-t-full object-cover shadow-2xl ring-2 ring-[#1a1d24]"
                                    style={{
                                        left: `${56 + index * 78}px`,
                                        transform: `rotate(${[-8, -2, 4, 9][index]}deg)`,
                                    }}
                                />
                            ),
                        )}
                        <button
                            onClick={onApply}
                            className="absolute left-1/2 top-24 z-10 h-11 -translate-x-1/2 rounded-full bg-[#129cff] px-8 text-sm font-black uppercase text-white shadow-lg transition hover:bg-[#2aa7ff]"
                        >
                            Apply Now
                        </button>
                        <div className="absolute bottom-0 left-10 right-10 h-10 bg-gradient-to-t from-[#1a1d24] to-transparent" />
                    </div>

                    <div className="hidden justify-self-end text-sm font-bold uppercase text-white/70 md:block">
                        Creator platform
                    </div>
                </div>
            </section>

            <section className="border-y border-white/5 bg-[#101216] px-8 py-14 lg:px-24">
                <div className="mx-auto w-full max-w-7xl">
                    <h2 className="text-center text-xl font-black uppercase">
                        What Sets Us Apart
                    </h2>
                    <div className="mt-12 grid grid-cols-1 gap-x-20 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="text-center">
                                <feature.icon
                                    className="mx-auto h-14 w-14 text-[#129cff]"
                                    strokeWidth={1.8}
                                />
                                <h3 className="mt-5 text-xl font-black">
                                    {feature.title}
                                </h3>
                                <p className="mx-auto mt-3 max-w-80 text-base leading-7 text-[#6984b8]">
                                    {feature.text}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="bg-[#1a1d24] px-8 py-12 lg:px-24">
                <h2 className="flex items-center justify-center gap-2 text-lg font-black uppercase">
                    <Heart className="h-6 w-6 text-[#129cff]" />
                    Creator Success Stories
                </h2>
                <div className="mx-auto mt-8 grid w-full grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {stories.map((story) => (
                        <article
                            key={story.name}
                            className="overflow-hidden rounded-md bg-[#323746]"
                        >
                            <img
                                src={story.image}
                                alt=""
                                className="h-40 w-full object-cover"
                            />
                            <div className="p-5">
                                <div className="flex items-center gap-1 text-[#129cff]">
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="text-sm font-bold">
                                        {story.name}
                                    </span>
                                </div>
                                <p className="mt-3 text-sm leading-6 text-[#d7e3ff]">
                                    {story.text}
                                </p>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="border-t border-white/5 bg-[#101216] px-8 py-14 lg:px-24">
                <h2 className="text-center text-base font-black uppercase">
                    FAQ
                </h2>
                <Accordion
                    type="single"
                    collapsible
                    className="mx-auto mt-7 w-full max-w-4xl space-y-4"
                >
                    {faqs.map((item) => (
                        <AccordionItem
                            key={item.q}
                            value={item.q}
                            className="rounded-md border border-[#41495c] bg-[#171a21] px-5"
                        >
                            <AccordionTrigger className="py-4 text-sm font-bold text-white hover:no-underline">
                                {item.q}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm leading-6 text-[#8fa6d4]">
                                {item.a}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </section>
        </>
    );
}

function VerificationIntro({
    onStart,
    starting,
}: {
    onStart: () => void;
    starting: boolean;
}) {
    return (
        <section className="min-h-[calc(100vh-4rem)] w-full bg-[#0f1115] px-6 py-5 text-[#7894c8] lg:px-8">
            <div className="w-full max-w-[1280px]">
                <h1 className="text-[20px] font-semibold leading-7 text-[#eff5ff]">
                    Naked Profile Creator Application
                </h1>
                <div className="mt-2 border-t border-[#252a33]" />
                <div className="mt-3 max-w-[1180px] space-y-1 text-base leading-7">
                    <p>
                        Naked Profile utilizes an authentication service for
                        identity verification to speed up our application
                        processing. Once you have successfully completed the
                        identity verification process with our authentication
                        partner, you will gain access to the Naked Profile
                        Application Form.
                    </p>
                    <p>
                        The identity used must match with the application and
                        your payment details.
                    </p>
                    <p className="font-medium text-[#95addc]">
                        Verification requires camera access.
                    </p>
                </div>
                <button
                    onClick={onStart}
                    disabled={starting}
                    className="mt-4 h-10 rounded-md bg-[#289bf2] px-7 text-sm font-bold text-white transition hover:bg-[#43aaff]"
                >
                    <span className="inline-flex items-center gap-2">
                        {starting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : null}
                        {starting ? "Starting..." : "Start Verification"}
                    </span>
                </button>
                <div className="mt-7 max-w-[1180px] space-y-1 text-sm leading-6">
                    <p>
                        If you have an issue completing your verification
                        through AgeVerif, please contact our support at
                        support@nakedprofile.com with the error you are seeing.
                    </p>
                    <p>
                        Make sure you have sufficient lighting when completing
                        this verification step. Make sure you are in a well lit
                        environment.
                    </p>
                </div>
            </div>
        </section>
    );
}

function getVerificationApiUrl() {
    const base = import.meta.env.VITE_BACKEND_URL ?? "http://127.0.0.1:3001";
    return `${base.replace(/\/$/, "")}/api/creator-applications/verification`;
}

async function getFreshAccessToken(forceRefresh = false) {
    if (forceRefresh) {
        const {
            data: { session },
            error,
        } = await supabase.auth.refreshSession();

        if (error || !session?.access_token) {
            throw new Error(
                "Please log in again before starting verification.",
            );
        }

        return session.access_token;
    }

    const {
        data: { user },
        error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
        const {
            data: { session },
            error,
        } = await supabase.auth.refreshSession();

        if (error || !session?.access_token) {
            throw new Error("Please log in before starting verification.");
        }

        return session.access_token;
    }

    const {
        data: { session },
        error,
    } = await supabase.auth.getSession();

    if (error || !session?.access_token) {
        throw new Error("Please log in before starting verification.");
    }

    return session.access_token;
}
