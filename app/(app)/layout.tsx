import { AppShell } from "@/components/shell/AppShell";
import { UserProvider } from "@/context/UserContext";
import { createClient } from "@/utils/supabase/server";

export default async function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

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
            <AppShell>
                {children}
            </AppShell>
        </UserProvider>
    );
}
