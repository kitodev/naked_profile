import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
    CheckCheck,
    Clock3,
    Image as ImageIcon,
    MailPlus,
    MessageCircle,
    MoreHorizontal,
    Paperclip,
    RefreshCw,
    Search,
    Send,
    SlidersHorizontal,
    Smile,
    Star,
    UserPlus,
    X,
} from "lucide-react";
import { AppTopBar } from "../../components/app-top-bar";
import { supabase } from "../../integrations/supabase/client";
import { creators, readFanlyState } from "../../lib/fanly-data";

export const Route = createFileRoute("/_authenticated/messages")({
    head: () => ({ meta: [{ title: "Messages - Naked Profile" }] }),
    component: MessagesPage,
});

type Filter = "followed" | "subscribed" | "all";
type SortMode = "recent" | "unread" | "name";
type ChatAttachment = {
    name: string;
    type: "image" | "file";
    url?: string;
};
type ChatMessage = {
    id: string;
    author: "me" | "creator";
    body: string;
    createdAt: string;
    status?: "sent" | "read";
    attachment?: ChatAttachment;
};
type Conversation = {
    id: string;
    creatorId: string;
    name: string;
    handle: string;
    avatar: string;
    followed: boolean;
    subscribed: boolean;
    online: boolean;
    unread: number;
    lastMessageAt: string;
    messages: ChatMessage[];
    favorite?: boolean;
    muted?: boolean;
    archived?: boolean;
};

function MessagesPage() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [filter, setFilter] = useState<Filter>("all");
    const [query, setQuery] = useState("");
    const [draft, setDraft] = useState("");
    const [showNew, setShowNew] = useState(false);
    const [sortMode, setSortMode] = useState<SortMode>("recent");
    const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        void loadConversations();
    }, []);

    useEffect(() => {
        endRef.current?.scrollIntoView({ block: "end" });
    }, [activeId, conversations]);

    const activeConversation = conversations.find(
        (conversation) => conversation.id === activeId,
    );
    const filteredConversations = useMemo(() => {
        const normalized = query.trim().toLowerCase();

        return conversations
            .filter((conversation) => {
                const matchesFilter =
                    filter === "all" ||
                    (filter === "followed" && conversation.followed) ||
                    (filter === "subscribed" && conversation.subscribed);
                const matchesQuery =
                    !normalized ||
                    conversation.name.toLowerCase().includes(normalized) ||
                    conversation.handle.toLowerCase().includes(normalized);

                return !conversation.archived && matchesFilter && matchesQuery;
            })
            .sort((a, b) => sortConversations(a, b, sortMode));
    }, [conversations, filter, query, sortMode]);

    const counts = {
        all: conversations.filter((item) => !item.archived).length,
        followed: conversations.filter(
            (item) => item.followed && !item.archived,
        ).length,
        subscribed: conversations.filter(
            (item) => item.subscribed && !item.archived,
        ).length,
    };
    const unreadCount = conversations.reduce(
        (total, conversation) => total + conversation.unread,
        0,
    );

    async function loadConversations() {
        setConversations(await readConversations());
    }

    async function selectConversation(id: string) {
        setActiveId(id);
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === id
                    ? { ...conversation, unread: 0 }
                    : conversation,
            ),
        );
        await updateConversation(id, { unread_count: 0 });
    }

    async function markAllRead() {
        setConversations((current) =>
            current.map((conversation) => ({ ...conversation, unread: 0 })),
        );
        await markEveryConversationRead();
    }

    function cycleSortMode() {
        setSortMode((current) =>
            current === "recent"
                ? "unread"
                : current === "unread"
                  ? "name"
                  : "recent",
        );
    }

    async function toggleFavorite() {
        if (!activeId) return;
        const active = conversations.find((item) => item.id === activeId);
        const favorite = !active?.favorite;
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeId
                    ? { ...conversation, favorite }
                    : conversation,
            ),
        );
        await updateConversation(activeId, { favorite });
    }

    async function toggleMuted() {
        if (!activeId) return;
        const active = conversations.find((item) => item.id === activeId);
        const muted = !active?.muted;
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeId
                    ? { ...conversation, muted }
                    : conversation,
            ),
        );
        await updateConversation(activeId, { muted });
    }

    async function markActiveUnread() {
        if (!activeId) return;
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeId
                    ? { ...conversation, unread: conversation.unread || 1 }
                    : conversation,
            ),
        );
        await updateConversation(activeId, { unread_count: 1 });
    }

    async function clearActiveChat() {
        if (!activeId) return;
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeId
                    ? { ...conversation, messages: [], unread: 0 }
                    : conversation,
            ),
        );
        await supabase
            .from("fanly_messages")
            .delete()
            .eq("conversation_id", activeId);
    }

    async function archiveActiveChat() {
        if (!activeId) return;
        setConversations((current) =>
            current.map((conversation) =>
                conversation.id === activeId
                    ? { ...conversation, archived: true, unread: 0 }
                    : conversation,
            ),
        );
        await updateConversation(activeId, { archived: true, unread_count: 0 });
        setActiveId(null);
    }

    async function sendMessage() {
        if (!activeId || (!draft.trim() && !attachment)) return;

        const message: ChatMessage = {
            id: crypto.randomUUID(),
            author: "me",
            body: draft.trim(),
            createdAt: new Date().toISOString(),
            status: "sent",
            attachment: attachment ?? undefined,
        };

        setConversations((current) =>
            current
                .map((conversation) =>
                    conversation.id === activeId
                        ? {
                              ...conversation,
                              lastMessageAt: message.createdAt,
                              messages: [...conversation.messages, message],
                          }
                        : conversation,
                )
                .sort((a, b) => sortConversations(a, b, sortMode)),
        );
        setDraft("");
        setAttachment(null);
        await insertMessage(activeId, message);
        await updateConversation(activeId, {
            last_message_at: message.createdAt,
            unread_count: 0,
        });
    }

    async function startConversation(creatorId: string) {
        const existing = conversations.find(
            (conversation) => conversation.creatorId === creatorId,
        );
        if (existing) {
            selectConversation(existing.id);
            setShowNew(false);
            return;
        }

        const creator = creators.find((item) => item.id === creatorId);
        if (!creator) return;
        const state = await readFanlyState();
        const conversationId = crypto.randomUUID();
        const next: Conversation = {
            id: conversationId,
            creatorId: creator.id,
            name: creator.name,
            handle: creator.handle,
            avatar: creator.avatar,
            followed: state.followedCreatorIds.includes(creator.id),
            subscribed: state.subscribedCreatorIds.includes(creator.id),
            online: false,
            unread: 0,
            favorite: false,
            muted: false,
            archived: false,
            lastMessageAt: new Date().toISOString(),
            messages: [
                {
                    id: crypto.randomUUID(),
                    author: "creator",
                    body: `You started a conversation with ${creator.name}.`,
                    createdAt: new Date().toISOString(),
                    status: "read",
                },
            ],
        };

        setConversations((current) => [next, ...current]);
        setActiveId(next.id);
        setShowNew(false);
        await createConversation(next);
        await insertMessage(next.id, next.messages[0]);
    }

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppTopBar />
            <main className="grid h-[calc(100vh-65px)] grid-cols-1 overflow-hidden border-t border-border lg:grid-cols-[500px_minmax(0,1fr)]">
                <ConversationPanel
                    activeId={activeId}
                    conversations={filteredConversations}
                    counts={counts}
                    filter={filter}
                    markAllRead={markAllRead}
                    query={query}
                    refresh={loadConversations}
                    selectConversation={selectConversation}
                    setFilter={setFilter}
                    setQuery={setQuery}
                    setShowNew={setShowNew}
                    sortMode={sortMode}
                    toggleSortMode={cycleSortMode}
                    unreadCount={unreadCount}
                />
                <ChatPanel
                    activeConversation={activeConversation}
                    attachment={attachment}
                    archiveActiveChat={archiveActiveChat}
                    clearActiveChat={clearActiveChat}
                    draft={draft}
                    endRef={endRef}
                    markActiveUnread={markActiveUnread}
                    sendMessage={sendMessage}
                    setAttachment={setAttachment}
                    setDraft={setDraft}
                    setShowNew={setShowNew}
                    toggleFavorite={toggleFavorite}
                    toggleMuted={toggleMuted}
                />
            </main>
            {showNew && (
                <NewMessageDialog
                    onClose={() => setShowNew(false)}
                    onStart={startConversation}
                />
            )}
        </div>
    );
}

function ConversationPanel({
    activeId,
    conversations,
    counts,
    filter,
    markAllRead,
    query,
    refresh,
    selectConversation,
    setFilter,
    setQuery,
    setShowNew,
    sortMode,
    toggleSortMode,
    unreadCount,
}: {
    activeId: string | null;
    conversations: Conversation[];
    counts: Record<Filter, number>;
    filter: Filter;
    markAllRead: () => void;
    query: string;
    refresh: () => void;
    selectConversation: (id: string) => void;
    setFilter: (filter: Filter) => void;
    setQuery: (query: string) => void;
    setShowNew: (show: boolean) => void;
    sortMode: SortMode;
    toggleSortMode: () => void;
    unreadCount: number;
}) {
    const filters: Array<{ id: Filter; label: string }> = [
        { id: "followed", label: "Followed" },
        { id: "subscribed", label: "Subscribed" },
        { id: "all", label: "All" },
    ];

    return (
        <section className="flex min-h-0 flex-col border-r border-border bg-background">
            <div className="space-y-4 border-b border-border p-4">
                <div className="flex items-center justify-between gap-3">
                    <h1 className="text-lg font-bold">Messages</h1>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={markAllRead}
                            className="rounded-md border border-primary/50 px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-card"
                        >
                            Mark as read ({unreadCount})
                        </button>
                        <IconButton
                            label="New message"
                            onClick={() => setShowNew(true)}
                        >
                            <MailPlus className="h-4 w-4" />
                        </IconButton>
                        <IconButton
                            label={`Sort messages by ${sortMode}`}
                            onClick={toggleSortMode}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </IconButton>
                    </div>
                </div>
                <label className="relative block h-10">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search conversations"
                        className="h-full w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none focus:border-primary"
                    />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                    {filters.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setFilter(item.id)}
                            className={`inline-flex h-9 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                                filter === item.id
                                    ? "bg-primary/20 text-foreground"
                                    : "bg-card text-muted-foreground hover:text-foreground"
                            }`}
                        >
                            {item.label}
                            <span className="rounded-full bg-primary px-1.5 text-[11px] text-primary-foreground">
                                {counts[item.id]}
                            </span>
                        </button>
                    ))}
                    <IconButton label="Refresh" onClick={refresh}>
                        <RefreshCw className="h-4 w-4" />
                    </IconButton>
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-3">
                {conversations.map((conversation) => (
                    <ConversationRow
                        key={conversation.id}
                        active={activeId === conversation.id}
                        conversation={conversation}
                        onClick={() => selectConversation(conversation.id)}
                    />
                ))}
                {!conversations.length && (
                    <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
                        <MessageCircle className="mb-3 h-8 w-8" />
                        No conversations found.
                    </div>
                )}
            </div>
        </section>
    );
}

function ConversationRow({
    active,
    conversation,
    onClick,
}: {
    active: boolean;
    conversation: Conversation;
    onClick: () => void;
}) {
    const lastMessage = conversation.messages.at(-1);

    return (
        <button
            onClick={onClick}
            className={`flex w-full gap-3 border-b border-border px-2 py-4 text-left transition last:border-b-0 ${
                active ? "bg-card" : "hover:bg-card/70"
            }`}
        >
            <div className="relative h-11 w-11 shrink-0">
                <img
                    src={conversation.avatar}
                    alt=""
                    className="h-11 w-11 rounded-full object-cover"
                />
                {conversation.online && (
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
                )}
            </div>
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                    <span className="truncate text-sm font-bold">
                        {conversation.name}
                    </span>
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                        <CheckCheck className="h-3 w-3" />
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                        @{conversation.handle}
                    </span>
                </div>
                <div className="mt-1 truncate text-xs text-muted-foreground">
                    {lastMessage?.body ?? "No messages yet."}
                </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="text-xs text-muted-foreground">
                    {formatShortDate(conversation.lastMessageAt)}
                </span>
                {conversation.unread > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
                        {conversation.unread}
                    </span>
                )}
            </div>
        </button>
    );
}

function ChatPanel({
    activeConversation,
    attachment,
    archiveActiveChat,
    clearActiveChat,
    draft,
    endRef,
    markActiveUnread,
    sendMessage,
    setAttachment,
    setDraft,
    setShowNew,
    toggleFavorite,
    toggleMuted,
}: {
    activeConversation: Conversation | undefined;
    attachment: ChatAttachment | null;
    archiveActiveChat: () => void;
    clearActiveChat: () => void;
    draft: string;
    endRef: React.RefObject<HTMLDivElement | null>;
    markActiveUnread: () => void;
    sendMessage: () => void;
    setAttachment: (attachment: ChatAttachment | null) => void;
    setDraft: (draft: string) => void;
    setShowNew: (show: boolean) => void;
    toggleFavorite: () => void;
    toggleMuted: () => void;
}) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [showMore, setShowMore] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);

    if (!activeConversation) {
        return (
            <section className="hidden min-h-0 items-center justify-center bg-background lg:flex">
                <div className="max-w-md text-center">
                    <MessageCircle className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
                    <h2 className="text-base font-bold">
                        You don't have a conversation selected
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Select a conversation on the left or start a new one.
                    </p>
                    <button
                        onClick={() => setShowNew(true)}
                        className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
                    >
                        New Message
                    </button>
                </div>
            </section>
        );
    }

    function handleFile(file: File | undefined) {
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setAttachment({ name: file.name, type: "file" });
            return;
        }

        const reader = new FileReader();
        reader.onload = () => {
            setAttachment({
                name: file.name,
                type: "image",
                url: String(reader.result),
            });
        };
        reader.readAsDataURL(file);
    }

    return (
        <section className="flex min-h-0 flex-col bg-background">
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-10 w-10 shrink-0">
                        <img
                            src={activeConversation.avatar}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                        />
                        {activeConversation.online && (
                            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background bg-success" />
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-bold">
                            {activeConversation.name}
                        </div>
                        <div className="truncate text-xs text-muted-foreground">
                            @{activeConversation.handle}
                            {activeConversation.subscribed
                                ? " - Subscribed"
                                : activeConversation.followed
                                  ? " - Followed"
                                  : ""}
                            {activeConversation.muted ? " - Muted" : ""}
                        </div>
                    </div>
                </div>
                <div className="relative flex items-center gap-1">
                    <IconButton label="Favorite" onClick={toggleFavorite}>
                        <Star
                            className={`h-4 w-4 ${
                                activeConversation.favorite
                                    ? "fill-primary text-primary"
                                    : ""
                            }`}
                        />
                    </IconButton>
                    <IconButton
                        label="More"
                        onClick={() => setShowMore((current) => !current)}
                    >
                        <MoreHorizontal className="h-5 w-5" />
                    </IconButton>
                    {showMore && (
                        <div className="absolute right-0 top-10 z-20 w-44 overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                            <MenuAction
                                label={
                                    activeConversation.muted
                                        ? "Unmute chat"
                                        : "Mute chat"
                                }
                                onClick={() => {
                                    toggleMuted();
                                    setShowMore(false);
                                }}
                            />
                            <MenuAction
                                label="Mark unread"
                                onClick={() => {
                                    markActiveUnread();
                                    setShowMore(false);
                                }}
                            />
                            <MenuAction
                                label="Clear chat"
                                onClick={() => {
                                    clearActiveChat();
                                    setShowMore(false);
                                }}
                            />
                            <MenuAction
                                label="Archive"
                                onClick={() => {
                                    archiveActiveChat();
                                    setShowMore(false);
                                }}
                            />
                        </div>
                    )}
                </div>
            </header>
            <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
                <div className="mx-auto max-w-3xl space-y-4">
                    {activeConversation.messages.map((message) => (
                        <ChatBubble key={message.id} message={message} />
                    ))}
                    <div ref={endRef} />
                </div>
            </div>
            <footer className="border-t border-border p-4">
                <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={(event) => {
                        handleFile(event.target.files?.[0]);
                        event.currentTarget.value = "";
                    }}
                />
                {attachment && (
                    <div className="mx-auto mb-2 flex max-w-3xl items-center justify-between rounded-lg border border-border bg-card px-3 py-2 text-xs text-muted-foreground">
                        <span className="truncate">
                            {attachment.type === "image"
                                ? "Image attached"
                                : "File attached"}
                            : {attachment.name}
                        </span>
                        <button
                            onClick={() => setAttachment(null)}
                            className="rounded-full p-1 hover:bg-background hover:text-foreground"
                            aria-label="Remove attachment"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </div>
                )}
                <div className="mx-auto flex max-w-3xl items-end gap-2">
                    <IconButton
                        label="Attach file"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.accept = "";
                                fileInputRef.current.click();
                            }
                        }}
                    >
                        <Paperclip className="h-4 w-4" />
                    </IconButton>
                    <IconButton
                        label="Add image"
                        onClick={() => {
                            if (fileInputRef.current) {
                                fileInputRef.current.accept = "image/*";
                                fileInputRef.current.click();
                            }
                        }}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </IconButton>
                    <div className="min-w-0 flex-1 rounded-2xl border border-border bg-card px-3 py-2">
                        <textarea
                            value={draft}
                            onChange={(event) => setDraft(event.target.value)}
                            onKeyDown={(event) => {
                                if (event.key === "Enter" && !event.shiftKey) {
                                    event.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Write a message"
                            rows={1}
                            className="max-h-28 min-h-7 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                        />
                    </div>
                    <div className="relative">
                        <IconButton
                            label="Emoji"
                            onClick={() => setShowEmoji((current) => !current)}
                        >
                            <Smile className="h-4 w-4" />
                        </IconButton>
                        {showEmoji && (
                            <div className="absolute bottom-11 right-0 z-20 flex gap-1 rounded-lg border border-border bg-card p-2 shadow-xl">
                                {[":)", ":D", "<3", "!", "?", "OK"].map(
                                    (emoji) => (
                                        <button
                                            key={emoji}
                                            onClick={() => {
                                                setDraft(`${draft}${emoji}`);
                                                setShowEmoji(false);
                                            }}
                                            className="rounded-md px-2 py-1 text-xs font-semibold hover:bg-background"
                                        >
                                            {emoji}
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                    <button
                        onClick={sendMessage}
                        disabled={!draft.trim() && !attachment}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                        aria-label="Send message"
                    >
                        <Send className="h-4 w-4" />
                    </button>
                </div>
            </footer>
        </section>
    );
}

function ChatBubble({ message }: { message: ChatMessage }) {
    const mine = message.author === "me";

    return (
        <div className={`flex ${mine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                    mine
                        ? "rounded-br-md bg-primary text-primary-foreground"
                        : "rounded-bl-md bg-card text-foreground"
                }`}
            >
                {message.attachment?.type === "image" &&
                    message.attachment.url && (
                        <img
                            src={message.attachment.url}
                            alt={message.attachment.name}
                            className="mb-2 max-h-64 rounded-xl object-cover"
                        />
                    )}
                {message.attachment?.type === "file" && (
                    <div className="mb-2 rounded-lg border border-current/20 px-3 py-2 text-xs">
                        {message.attachment.name}
                    </div>
                )}
                {message.body && (
                    <p className="whitespace-pre-wrap">{message.body}</p>
                )}
                <div
                    className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                        mine
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                    }`}
                >
                    {formatMessageTime(message.createdAt)}
                    {mine &&
                        (message.status === "read" ? (
                            <CheckCheck className="h-3 w-3" />
                        ) : (
                            <Clock3 className="h-3 w-3" />
                        ))}
                </div>
            </div>
        </div>
    );
}

function NewMessageDialog({
    onClose,
    onStart,
}: {
    onClose: () => void;
    onStart: (creatorId: string) => void;
}) {
    const [query, setQuery] = useState("");
    const normalized = query.trim().toLowerCase();
    const filtered = creators.filter(
        (creator) =>
            !normalized ||
            creator.name.toLowerCase().includes(normalized) ||
            creator.handle.toLowerCase().includes(normalized),
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm">
            <section className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
                <header className="flex items-center justify-between border-b border-border px-4 py-3">
                    <div className="font-semibold">New Message</div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-muted-foreground hover:bg-background hover:text-foreground"
                        aria-label="Close"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </header>
                <div className="space-y-3 p-4">
                    <label className="relative block h-10">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search creators"
                            className="h-full w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary"
                        />
                    </label>
                    <div className="max-h-80 space-y-2 overflow-y-auto">
                        {filtered.map((creator) => (
                            <button
                                key={creator.id}
                                onClick={() => onStart(creator.id)}
                                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-background"
                            >
                                <img
                                    src={creator.avatar}
                                    alt=""
                                    className="h-10 w-10 rounded-full object-cover"
                                />
                                <div className="min-w-0 flex-1">
                                    <div className="truncate text-sm font-semibold">
                                        {creator.name}
                                    </div>
                                    <div className="truncate text-xs text-muted-foreground">
                                        @{creator.handle}
                                    </div>
                                </div>
                                <UserPlus className="h-4 w-4 text-primary" />
                            </button>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}

function IconButton({
    children,
    label,
    onClick,
}: {
    children: React.ReactNode;
    label: string;
    onClick?: () => void;
}) {
    return (
        <button
            aria-label={label}
            onClick={onClick}
            className="relative rounded-full p-2 text-foreground/80 transition hover:bg-card hover:text-foreground"
        >
            {children}
        </button>
    );
}

function MenuAction({
    label,
    onClick,
}: {
    label: string;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className="block w-full px-3 py-2 text-left text-sm text-foreground transition hover:bg-background"
        >
            {label}
        </button>
    );
}

async function readConversations(): Promise<Conversation[]> {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) return [];

    const { data: initialRows, error } = await supabase
        .from("fanly_conversations")
        .select(
            "id, creator_id, favorite, muted, archived, unread_count, last_message_at",
        )
        .eq("user_id", user.id)
        .order("last_message_at", { ascending: false });
    if (error) return [];

    let rows = initialRows;

    if (!rows?.length) {
        await createSeedConversations(user.id);
        const result = await supabase
            .from("fanly_conversations")
            .select(
                "id, creator_id, favorite, muted, archived, unread_count, last_message_at",
            )
            .eq("user_id", user.id)
            .order("last_message_at", { ascending: false });
        rows = result.data ?? [];
    }

    const conversationIds = rows?.map((row) => row.id) ?? [];
    const { data: messageRows } = conversationIds.length
        ? await supabase
              .from("fanly_messages")
              .select(
                  "id, conversation_id, author, body, attachment_name, attachment_type, attachment_url, created_at, read_at",
              )
              .in("conversation_id", conversationIds)
              .order("created_at", { ascending: true })
        : { data: [] };

    const state = await readFanlyState();
    return ((rows ?? []) as ConversationRow[])
        .map((row) => mapConversationRow(row, messageRows ?? [], state))
        .sort((a, b) => sortConversations(a, b, "recent"));
}

async function createSeedConversations(userId: string) {
    const conversations = await seedConversations();
    for (const conversation of conversations) {
        const { error } = await supabase.from("fanly_conversations").insert({
            id: conversation.id,
            user_id: userId,
            creator_id: conversation.creatorId,
            favorite: conversation.favorite,
            muted: conversation.muted,
            archived: conversation.archived,
            unread_count: conversation.unread,
            last_message_at: conversation.lastMessageAt,
        });
        if (error) continue;
        for (const message of conversation.messages) {
            await insertMessage(conversation.id, message);
        }
    }
}

async function seedConversations(): Promise<Conversation[]> {
    const state = await readFanlyState();
    const now = Date.now();
    const source = [
        {
            creatorId: "aria",
            preview: "Welcome in. I just posted a new update.",
            unread: 0,
            online: true,
            minutesAgo: 12,
        },
        {
            creatorId: "luna",
            preview: "Do you like this kind of morning set?",
            unread: 5,
            online: false,
            minutesAgo: 180,
        },
        {
            creatorId: "theo",
            preview: "Tonight's preview is live.",
            unread: 0,
            online: false,
            minutesAgo: 420,
        },
        {
            creatorId: "marcus",
            preview: "New plan is up for subscribers.",
            unread: 2,
            online: true,
            minutesAgo: 860,
        },
    ];

    return source
        .map((item) => {
            const creator = creators.find(
                (candidate) => candidate.id === item.creatorId,
            );
            if (!creator) return null;

            const createdAt = new Date(
                now - item.minutesAgo * 60000,
            ).toISOString();
            const messages: ChatMessage[] = [
                {
                    id: `${creator.id}-hello`,
                    author: "creator",
                    body: item.preview,
                    createdAt,
                    status: "read",
                },
            ];

            if (creator.id === "aria") {
                messages.push({
                    id: `${creator.id}-reply`,
                    author: "me",
                    body: "I saw it. Saved for later.",
                    createdAt: new Date(now - 8 * 60000).toISOString(),
                    status: "read",
                });
            }

            const conversation: Conversation = {
                id: crypto.randomUUID(),
                creatorId: creator.id,
                name: creator.name,
                handle: creator.handle,
                avatar: creator.avatar,
                followed: state.followedCreatorIds.includes(creator.id),
                subscribed: state.subscribedCreatorIds.includes(creator.id),
                online: item.online,
                unread: item.unread,
                favorite: false,
                muted: false,
                archived: false,
                lastMessageAt: createdAt,
                messages,
            };

            return conversation;
        })
        .filter((conversation): conversation is Conversation =>
            Boolean(conversation),
        )
        .sort((a, b) => sortConversations(a, b, "recent"));
}

async function createConversation(conversation: Conversation) {
    const userId = await requireUserId();
    await supabase.from("fanly_conversations").insert({
        id: conversation.id,
        user_id: userId,
        creator_id: conversation.creatorId,
        favorite: conversation.favorite,
        muted: conversation.muted,
        archived: conversation.archived,
        unread_count: conversation.unread,
        last_message_at: conversation.lastMessageAt,
    });
}

async function updateConversation(
    id: string,
    values: Record<string, string | number | boolean | null>,
) {
    await supabase.from("fanly_conversations").update(values).eq("id", id);
}

async function markEveryConversationRead() {
    const userId = await requireUserId();
    await supabase
        .from("fanly_conversations")
        .update({ unread_count: 0 })
        .eq("user_id", userId);
}

async function insertMessage(conversationId: string, message: ChatMessage) {
    const userId = await requireUserId();
    await supabase.from("fanly_messages").insert({
        id: message.id,
        conversation_id: conversationId,
        user_id: userId,
        author: message.author,
        body: message.body,
        attachment_name: message.attachment?.name ?? null,
        attachment_type: message.attachment?.type ?? null,
        attachment_url: message.attachment?.url ?? null,
        read_at: message.status === "read" ? message.createdAt : null,
        created_at: message.createdAt,
    });
}

async function requireUserId() {
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in.");
    return user.id;
}

type ConversationRow = {
    id: string;
    creator_id: string;
    favorite: boolean | null;
    muted: boolean | null;
    archived: boolean | null;
    unread_count: number | null;
    last_message_at: string | null;
};

type MessageRow = {
    id: string;
    conversation_id: string;
    author: "me" | "creator";
    body: string | null;
    attachment_name: string | null;
    attachment_type: "image" | "file" | null;
    attachment_url: string | null;
    created_at: string;
    read_at: string | null;
};

function mapConversationRow(
    row: ConversationRow,
    messages: MessageRow[],
    state: Awaited<ReturnType<typeof readFanlyState>>,
): Conversation {
    const creator = creators.find((item) => item.id === row.creator_id);
    const fallback = creator ?? creators[0];

    return {
        id: row.id,
        creatorId: row.creator_id,
        name: fallback.name,
        handle: fallback.handle,
        avatar: fallback.avatar,
        followed: state.followedCreatorIds.includes(row.creator_id),
        subscribed: state.subscribedCreatorIds.includes(row.creator_id),
        online: row.creator_id === "aria" || row.creator_id === "marcus",
        unread: row.unread_count ?? 0,
        favorite: Boolean(row.favorite),
        muted: Boolean(row.muted),
        archived: Boolean(row.archived),
        lastMessageAt: row.last_message_at ?? new Date().toISOString(),
        messages: messages
            .filter((message) => message.conversation_id === row.id)
            .map((message) => ({
                id: message.id,
                author: message.author,
                body: message.body ?? "",
                createdAt: message.created_at,
                status: message.read_at ? "read" : "sent",
                attachment: message.attachment_name
                    ? {
                          name: message.attachment_name,
                          type: message.attachment_type ?? "file",
                          url: message.attachment_url ?? undefined,
                      }
                    : undefined,
            })),
    };
}

function sortConversations(
    a: Conversation,
    b: Conversation,
    mode: SortMode = "recent",
): number {
    if (mode === "unread") {
        return b.unread - a.unread || sortConversations(a, b, "recent");
    }

    if (mode === "name") {
        return a.name.localeCompare(b.name);
    }

    if (a.favorite !== b.favorite) return a.favorite ? -1 : 1;

    return (
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
}

function formatShortDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}

function formatMessageTime(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        hour: "numeric",
        minute: "2-digit",
    }).format(new Date(date));
}
