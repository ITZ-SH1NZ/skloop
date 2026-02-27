import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams, origin } = new URL(request.url);
    const code = searchParams.get("code");
    // 'next' is the URL to redirect to after sign in - defaults to origin
    const next = searchParams.get("next") ?? "/dashboard";

    if (code) {
        const supabase = await createClient();
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);

        if (!error && data.user) {
            const user = data.user;

            // Check if this user already has a profile with a username set (returning user)
            const { data: profile } = await supabase
                .from("profiles")
                .select("username")
                .eq("id", user.id)
                .maybeSingle();

            const hasCompletedProfile = profile?.username && profile.username.trim() !== "";

            if (hasCompletedProfile) {
                // Returning user with complete profile → go straight to dashboard
                return NextResponse.redirect(`${origin}/dashboard`);
            } else {
                // New Google user — profile exists (Supabase may auto-create one via trigger)
                // but they haven't filled in their handle yet → send to profile setup
                return NextResponse.redirect(`${origin}/auth/confirmed?new=true`);
            }
        }
    }

    // Auth code exchange failed - redirect to login with error message
    return NextResponse.redirect(`${origin}/login?error=${encodeURIComponent("Authentication failed. Please try again.")}`);
}
