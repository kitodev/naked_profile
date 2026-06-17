import { createFileRoute, Link } from "@tanstack/react-router";
import {
    ArrowLeft,
    BookmarkX,
    ImagePlus,
    MoreHorizontal,
    Plus,
} from "lucide-react";
import { AppTopBar } from "../../components/app-top-bar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";

export const Route = createFileRoute("/_authenticated/media-collection")({
    head: () => ({ meta: [{ title: "Media Collection - Naked Profile" }] }),
    component: MediaCollectionPage,
});

function MediaCollectionPage() {
    return (
        <main className="min-h-screen bg-background text-foreground">
            <AppTopBar />

            <section className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <div className="rounded-xl border border-border bg-card/80 p-5 shadow-[var(--shadow-card)] sm:p-6">
                    <h1 className="text-xl font-bold leading-none tracking-tight">
                        Bookmarks / Collection
                    </h1>

                    <div className="mt-5 border-t border-border/80" />

                    <section className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                    <Link
                                        to="/bookmarks"
                                        aria-label="Back to bookmarks"
                                        className="inline-flex h-9 w-12 shrink-0 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition hover:bg-accent"
                                    >
                                        <ArrowLeft className="h-5 w-5" />
                                    </Link>
                                    <h2 className="truncate text-xl font-bold leading-9">
                                        Purchases
                                    </h2>
                                </div>

                                <div className="mt-4 flex items-center gap-2">
                                    <button className="h-8 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-accent">
                                        Overview
                                    </button>
                                    <button className="h-8 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-[0_0_24px_-12px_var(--primary)] transition hover:brightness-110">
                                        Purchases
                                    </button>
                                </div>
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full bg-secondary px-4 text-sm font-semibold text-secondary-foreground transition hover:bg-accent">
                                        <span className="hidden sm:inline">
                                            Actions
                                        </span>
                                        <MoreHorizontal className="h-4 w-4 sm:hidden" />
                                    </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-52 border-border bg-card text-card-foreground shadow-2xl"
                                >
                                    <DropdownMenuItem className="cursor-pointer">
                                        <ImagePlus className="mr-2 h-4 w-4 text-primary" />
                                        Upload media
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="cursor-pointer">
                                        <Plus className="mr-2 h-4 w-4 text-primary" />
                                        Add from posts
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex min-h-[360px] flex-col items-center justify-start pt-16 text-center sm:min-h-[420px]">
                            <BookmarkX
                                className="h-10 w-10 text-primary/80"
                                strokeWidth={1.75}
                            />
                            <p className="mt-6 max-w-[980px] text-sm leading-6 text-muted-foreground sm:text-base">
                                This Album does not have any Media yet, upload
                                new content by clicking on actions or go to your
                                existing posts and add content via the Bookmark
                                function.
                            </p>
                        </div>
                    </section>
                </div>
            </section>
        </main>
    );
}
