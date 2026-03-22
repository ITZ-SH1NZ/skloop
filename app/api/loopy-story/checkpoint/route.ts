import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { data, error } = await supabase
            .from("story_checkpoints")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (error || !data) {
            return NextResponse.json({ checkpoint: null });
        }

        return NextResponse.json({ checkpoint: data });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to fetch checkpoint" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        await supabase
            .from("story_checkpoints")
            .delete()
            .eq("user_id", user.id);

        return NextResponse.json({ success: true });
    } catch (e: any) {
        return NextResponse.json({ error: "Failed to delete checkpoint" }, { status: 500 });
    }
}
