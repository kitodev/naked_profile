import { Link, createFileRoute } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    CreditCard,
    Gift,
    Info,
    Loader2,
    Plus,
    WalletCards,
    X,
} from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { AppTopBar } from "../../components/app-top-bar";
import { createStripeCheckoutSession } from "../../lib/payment-api";

export const Route = createFileRoute("/_authenticated/payment-method")({
    head: () => ({ meta: [{ title: "Payments - Naked Profile" }] }),
    component: PaymentMethodPage,
});

const createCheckoutSession = createServerFn({ method: "POST" })
    .inputValidator(
        z.object({
            mode: z.enum(["payment", "setup"]),
            origin: z.string().url(),
        }),
    )
    .handler(async ({ data }) => createStripeCheckoutSession(data));

const COUNTRIES = [
    "United States of America (the)",
    "Canada",
    "United Kingdom",
    "Germany",
    "France",
    "Spain",
    "Italy",
    "Netherlands",
    "Poland",
    "Portugal",
    "Australia",
    "Brazil",
    "Mexico",
    "Japan",
];

const US_STATES = [
    "Alaska",
    "Alabama",
    "Arkansas",
    "American Samoa (see also separate entry under AS)",
    "Arizona",
    "California",
    "Colorado",
    "Connecticut",
    "District of Columbia",
    "Delaware",
    "Florida",
    "Georgia",
    "Guam (see also separate entry under GU)",
    "Hawaii",
    "Iowa",
    "Idaho",
    "Illinois",
    "Indiana",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Massachusetts",
    "Maryland",
    "Maine",
    "Michigan",
    "Minnesota",
    "Missouri",
    "Mississippi",
    "Montana",
    "North Carolina",
    "North Dakota",
    "Nebraska",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "Nevada",
    "New York",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Puerto Rico",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Virginia",
    "Virgin Islands",
    "Vermont",
    "Washington",
    "Wisconsin",
    "West Virginia",
    "Wyoming",
];

function PaymentMethodPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showCardModal, setShowCardModal] = useState(false);
    const [showCryptoModal, setShowCryptoModal] = useState(false);
    const [showAlternativeModal, setShowAlternativeModal] = useState(false);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [activeTab, setActiveTab] = useState<"transactions" | "wallet">(
        "transactions",
    );

    async function startCheckout() {
        setLoading(true);
        setError(null);

        try {
            const data = await createCheckoutSession({
                data: { mode: "setup", origin: window.location.origin },
            });

            window.location.href = data.url;
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not start checkout.",
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            {showCardModal && (
                <AddCardModal
                    loading={loading}
                    onClose={() => setShowCardModal(false)}
                    onSubmit={startCheckout}
                />
            )}
            {showCryptoModal && (
                <CryptoModal onClose={() => setShowCryptoModal(false)} />
            )}
            {showAlternativeModal && (
                <AlternativePaymentModal
                    onClose={() => setShowAlternativeModal(false)}
                />
            )}
            {showGiftModal && (
                <GiftCodeModal onClose={() => setShowGiftModal(false)} />
            )}
            <main className="w-full px-4 py-5 sm:px-8 lg:px-12">
                <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
                    <Link
                        to="/settings"
                        aria-label="Back"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full text-primary hover:bg-card"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <h1 className="text-base font-bold text-foreground">
                        Payments
                    </h1>
                </div>

                <div className="space-y-6">
                    <PaymentSection title="Visa/MasterCard/Discover">
                        <PaymentTile
                            icon={<CreditCard className="h-12 w-12" />}
                            label="Add Card"
                            onClick={() => setShowCardModal(true)}
                        />
                    </PaymentSection>

                    <PaymentSection title="Crypto Wallet Top Up">
                        <PaymentTile
                            icon={<WalletCards className="h-12 w-12" />}
                            label="Deposit Crypto"
                            onClick={() => setShowCryptoModal(true)}
                        />
                    </PaymentSection>

                    <PaymentSection title="Alternative Payment Methods">
                        <PaymentTile
                            icon={<Building2 className="h-12 w-12" />}
                            label="Add Alternative Method"
                            onClick={() => setShowAlternativeModal(true)}
                        />
                    </PaymentSection>

                    <PaymentSection title="Gift Codes">
                        <PaymentTile
                            icon={<Gift className="h-12 w-12" />}
                            label="Claim Gift Code"
                            onClick={() => setShowGiftModal(true)}
                        />
                    </PaymentSection>
                </div>

                <div className="mt-3 rounded-md border border-border bg-card/30 px-3 py-3 text-xs font-semibold leading-5 text-foreground">
                    <div className="flex gap-2">
                        <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <p>
                            Naked Profile gift codes are not available for
                            purchase and are only distributed for promotional
                            purposes. Any website claiming to sell Naked Profile
                            gift codes is not affiliated with us.
                        </p>
                    </div>
                </div>

                {error && (
                    <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive-foreground">
                        {error}
                    </div>
                )}

                <section className="mt-5">
                    <h2 className="text-sm font-bold text-foreground">
                        Billing History
                    </h2>
                    <div className="mt-3 border-b border-border">
                        <div className="grid grid-cols-2 text-center text-xs font-semibold text-muted-foreground">
                            <button
                                onClick={() => setActiveTab("transactions")}
                                className={`border-b py-3 transition ${
                                    activeTab === "transactions"
                                        ? "border-primary text-primary"
                                        : "border-transparent hover:text-foreground"
                                }`}
                            >
                                Transaction History
                            </button>
                            <button
                                onClick={() => setActiveTab("wallet")}
                                className={`border-b py-3 transition ${
                                    activeTab === "wallet"
                                        ? "border-primary text-primary"
                                        : "border-transparent hover:text-foreground"
                                }`}
                            >
                                Wallet Transaction History
                            </button>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[720px] text-left text-xs">
                            <thead className="border-b border-border text-foreground">
                                <tr>
                                    <th className="px-12 py-6 font-bold">
                                        Date
                                    </th>
                                    <th className="px-5 py-6 font-bold">
                                        Status
                                    </th>
                                    <th className="px-5 py-6 font-bold">
                                        Order Number
                                    </th>
                                    <th className="px-5 py-6 font-bold">
                                        Description
                                    </th>
                                    <th className="px-5 py-6 font-bold">
                                        Total
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-muted-foreground"
                                    >
                                        No {activeTab} yet.
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>
        </div>
    );
}

function PaymentSection({
    children,
    title,
}: {
    children: React.ReactNode;
    title: string;
}) {
    return (
        <section>
            <h2 className="mb-2 text-xs font-bold text-foreground">{title}</h2>
            {children}
        </section>
    );
}

function PaymentTile({
    icon,
    label,
    loading = false,
    onClick,
}: {
    icon: React.ReactNode;
    label: string;
    loading?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            disabled={loading}
            className="group relative flex h-[94px] w-[260px] flex-col items-center justify-center rounded-md border border-border bg-card/30 text-primary transition hover:border-primary hover:bg-primary/10 disabled:cursor-not-allowed disabled:opacity-70"
        >
            {loading ? (
                <Loader2 className="h-10 w-10 animate-spin" />
            ) : (
                <span className="text-[#7894c8] transition group-hover:text-primary">
                    {icon}
                </span>
            )}
            <span className="mt-1 text-xs text-[#7894c8] transition group-hover:text-primary">
                {label}
            </span>
            {!loading && (
                <Plus className="absolute left-[calc(50%+28px)] top-[44px] h-6 w-6 text-[#7894c8] transition group-hover:text-primary" />
            )}
        </button>
    );
}

function AddCardModal({
    loading,
    onClose,
    onSubmit,
}: {
    loading: boolean;
    onClose: () => void;
    onSubmit: () => void;
}) {
    const [country, setCountry] = useState("United States of America (the)");
    const [state, setState] = useState("");

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/75 px-4 py-8 backdrop-blur-sm">
            <section className="flex max-h-[calc(100vh-4rem)] w-full max-w-[900px] flex-col overflow-hidden rounded-md border border-border bg-card text-foreground shadow-2xl">
                <header className="flex items-center justify-between border-b border-border px-5 py-4">
                    <h2 className="text-lg font-bold">
                        Add a new payment Method
                    </h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-1 text-muted-foreground transition hover:bg-background hover:text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>

                <div className="overflow-y-auto px-5 py-5 text-[#7894c8]">
                    <div className="space-y-5 text-base leading-6">
                        <p>
                            Please fill in your card details below to add the
                            card to Fansly
                        </p>
                        <p>
                            Select Media / Fansly (Select Media LLC, USA) is
                            fully compliant with Payment Card Industry Data
                            Security Standards.
                        </p>
                    </div>

                    <form
                        className="mt-8 space-y-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            onSubmit();
                        }}
                    >
                        <div className="grid gap-2 sm:grid-cols-2">
                            <PaymentInput placeholder="First/Given Name" />
                            <PaymentInput placeholder="Last Name" />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <PaymentInput placeholder="Address" />
                            <PaymentInput placeholder="City" />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <LabelledPaymentSelect
                                label="Country"
                                value={country}
                                options={COUNTRIES}
                                onChange={setCountry}
                            />
                            <LabelledPaymentSelect
                                label="State / Province"
                                value={state}
                                options={US_STATES}
                                placeholder="<Please Select>"
                                onChange={setState}
                            />
                        </div>

                        <PaymentInput placeholder="Zip Code" />

                        <div className="grid gap-2 sm:grid-cols-2">
                            <PaymentInput placeholder="Card Number" />
                            <PaymentInput placeholder="CVV/CVC" />
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                            <PaymentInput placeholder="Card Exp Month" />
                            <PaymentInput placeholder="Card Exp Year" />
                        </div>

                        <p className="text-sm leading-5">
                            Fansly will make a one-time charge up to $0.10 to
                            verify the card. This and all following charges show
                            as{" "}
                            <span className="font-bold text-destructive">
                                SelectMedia
                            </span>{" "}
                            or{" "}
                            <span className="font-bold text-destructive">
                                FANSLY
                            </span>
                            .
                        </p>
                    </form>
                </div>

                <footer className="flex flex-col gap-4 border-t border-border bg-card px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-2">
                        <CardBadge label="MasterCard" tone="blue" />
                        <CardBadge label="VISA" tone="indigo" />
                        <CardBadge label="DISCOVER" tone="white" />
                    </div>
                    <div className="flex items-center justify-end gap-6">
                        <button
                            onClick={onClose}
                            className="text-sm font-bold text-[#7894c8] transition hover:text-foreground"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={onSubmit}
                            disabled={loading}
                            className="inline-flex h-11 items-center gap-2 rounded-md bg-primary px-6 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <CreditCard className="h-4 w-4" />
                            )}
                            {loading ? "Starting..." : "Add Card"}
                        </button>
                    </div>
                </footer>
            </section>
        </div>
    );
}

function PaymentInput({ placeholder }: { placeholder: string }) {
    return (
        <input
            placeholder={placeholder}
            className="h-12 w-full rounded-md border border-border bg-background px-4 text-base text-foreground outline-none placeholder:text-[#7894c8] focus:border-primary"
        />
    );
}

function LabelledPaymentSelect({
    label,
    onChange,
    options,
    placeholder,
    value,
}: {
    label: string;
    onChange: (value: string) => void;
    options: string[];
    placeholder?: string;
    value: string;
}) {
    return (
        <label className="relative block">
            <span className="absolute -top-2 left-4 bg-card px-1 text-xs font-bold text-primary">
                {label}
            </span>
            <select
                onChange={(event) => onChange(event.target.value)}
                value={value}
                className="h-12 w-full rounded-md border border-border bg-background px-4 text-base text-[#7894c8] outline-none focus:border-primary"
            >
                {placeholder && <option value="">{placeholder}</option>}
                {options.map((option) => (
                    <option key={option} value={option}>
                        {option}
                    </option>
                ))}
            </select>
        </label>
    );
}

function CryptoModal({ onClose }: { onClose: () => void }) {
    const cryptoOptions = [
        { code: "BTC", name: "Bitcoin", symbol: "B", tone: "bg-orange-500" },
        {
            code: "ETH",
            name: "Ethereum Mainnet",
            symbol: "E",
            tone: "bg-indigo-500",
        },
        { code: "LTC", name: "Litecoin", symbol: "L", tone: "bg-zinc-300" },
        { code: "SOL", name: "Solana Mainnet", symbol: "S", tone: "bg-black" },
        {
            code: "USDT",
            name: "Tether USD (ERC20)",
            symbol: "T",
            tone: "bg-emerald-500",
        },
    ];

    return (
        <ModalFrame
            title="Crypto Wallet Top Up"
            onClose={onClose}
            width="max-w-[640px]"
        >
            <div className="grid grid-cols-2 border-b border-border text-sm font-bold">
                <button className="border-b-2 border-primary py-3 text-primary">
                    New Deposit
                </button>
                <button className="border-b-2 border-transparent py-3 text-[#7894c8]">
                    Deposits
                </button>
            </div>
            <div className="max-h-[410px] overflow-y-auto px-5 py-3">
                <p className="mb-4 text-sm text-[#7894c8]">
                    Select a cryptocurrency to deposit funds into your wallet.
                </p>
                <div className="space-y-1">
                    {cryptoOptions.map((item) => (
                        <button
                            key={item.code}
                            className="flex w-full items-center gap-4 rounded-md px-1 py-3 text-left transition hover:bg-background/60"
                        >
                            <span
                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-black text-white ${item.tone}`}
                            >
                                {item.symbol}
                            </span>
                            <span className="min-w-0 flex-1">
                                <span className="block text-base font-bold">
                                    {item.code}
                                </span>
                                <span className="block text-sm text-[#7894c8]">
                                    {item.name}
                                </span>
                            </span>
                            <ChevronRight className="h-6 w-6 text-[#7894c8]" />
                        </button>
                    ))}
                </div>
            </div>
        </ModalFrame>
    );
}

function AlternativePaymentModal({ onClose }: { onClose: () => void }) {
    const [country, setCountry] = useState("Poland");

    return (
        <ModalFrame
            title="Add a new Alternative Method"
            onClose={onClose}
            width="max-w-[720px]"
        >
            <div className="px-6 pb-8 pt-2">
                <p className="mb-8 max-w-xl text-sm leading-5 text-[#7894c8]">
                    Please select a country to see which alternative methods are
                    available for you.
                </p>
                <LabelledPaymentSelect
                    label="Country"
                    value={country}
                    options={COUNTRIES}
                    onChange={setCountry}
                />
                <h3 className="mt-5 text-sm font-bold">Select Method</h3>
                <div className="mt-5 grid gap-6 text-center sm:grid-cols-3">
                    <AlternativeMethod label="BLIK" mark="blik" />
                    <AlternativeMethod label="Przelewy24" mark="Przelewy24" />
                    <AlternativeMethod label="Pay by Bank" mark="dp" />
                </div>
            </div>
        </ModalFrame>
    );
}

function AlternativeMethod({ label, mark }: { label: string; mark: string }) {
    return (
        <button className="rounded-md p-2 transition hover:bg-background/60">
            <div className="mb-2 text-sm font-bold">{label}</div>
            <div className="flex h-14 items-center justify-center rounded-sm bg-white px-3 text-xl font-black text-slate-900">
                {mark}
            </div>
        </button>
    );
}

function GiftCodeModal({ onClose }: { onClose: () => void }) {
    const [giftCode, setGiftCode] = useState("");

    return (
        <ModalFrame
            title="Claim Gift Code"
            onClose={onClose}
            width="max-w-[560px]"
        >
            <div className="px-6 pb-8 pt-2 text-center">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/25 text-primary">
                    <Gift className="h-12 w-12" />
                </div>
                <p className="mx-auto mt-4 max-w-xs text-sm leading-5 text-[#7894c8]">
                    Enter your gift code below to redeem wallet balance.
                </p>
                <div className="mt-8 text-left">
                    <label className="relative block">
                        <span className="absolute -top-2 left-4 bg-card px-1 text-xs font-bold text-primary">
                            Gift Code
                        </span>
                        <input
                            value={giftCode}
                            onChange={(event) =>
                                setGiftCode(event.target.value)
                            }
                            placeholder="XXXX-XXXX-XXXX"
                            className="h-12 w-full rounded-md border border-primary bg-background px-4 text-base text-foreground outline-none placeholder:text-[#7894c8]"
                        />
                    </label>
                </div>
                <button
                    disabled={!giftCode.trim()}
                    className="mt-4 inline-flex h-11 items-center gap-2 rounded-md bg-primary px-9 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Gift className="h-4 w-4" />
                    Claim Gift Code
                </button>
            </div>
        </ModalFrame>
    );
}

function ModalFrame({
    children,
    onClose,
    title,
    width,
}: {
    children: React.ReactNode;
    onClose: () => void;
    title: string;
    width: string;
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/80 px-4 py-8 backdrop-blur-sm">
            <section
                className={`max-h-[calc(100vh-4rem)] w-full overflow-hidden rounded-md border border-border bg-card text-foreground shadow-2xl ${width}`}
            >
                <header className="flex items-center justify-between px-6 py-5">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        aria-label="Close"
                        className="rounded-full p-1 text-[#c5d7ff] transition hover:bg-background hover:text-foreground"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </header>
                {children}
            </section>
        </div>
    );
}

function CardBadge({
    label,
    tone,
}: {
    label: string;
    tone: "blue" | "indigo" | "white";
}) {
    const toneClass =
        tone === "blue"
            ? "bg-sky-500 text-orange-100"
            : tone === "indigo"
              ? "bg-indigo-700 text-yellow-100"
              : "bg-white text-slate-900";

    return (
        <span
            className={`flex h-10 w-10 items-center justify-center rounded-full text-[8px] font-black ${toneClass}`}
        >
            {label}
        </span>
    );
}
