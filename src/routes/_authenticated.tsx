import { Outlet, createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "../integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
    beforeLoad: async () => {
        if (typeof window === "undefined") return;

        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
            throw redirect({ to: "/login" });
        }
    },
    component: AuthenticatedLayout,
});

function AuthenticatedLayout() {
    return <Outlet />;
}
