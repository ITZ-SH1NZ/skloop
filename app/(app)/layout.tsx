import { AppShell } from "@/components/shell/AppShell";
import { UserProvider } from "@/context/UserContext";
import { SWRProvider } from "@/components/providers/SWRProvider";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/");
    }

    // Fetch profile on server to prevent flash
    let profile = null;
    if (user) {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
        profile = data;
    }

    return (
        <UserProvider initialUser={user} initialProfile={profile}>
            <SWRProvider>
                <AppShell>
                    {children}
                </AppShell>
            </SWRProvider>
        </UserProvider>
    );
}
