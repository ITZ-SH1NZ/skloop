import { NextRequest, NextResponse } from "next/server";
import Mux from "@mux/mux-node";

const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
});

// POST: Create a Mux Direct Upload URL
export async function POST() {
    try {
        const upload = await mux.video.uploads.create({
            cors_origin: "*",
            new_asset_settings: {
                playback_policy: ["public"],
            },
        });
        return NextResponse.json({ uploadUrl: upload.url, uploadId: upload.id });
    } catch (err) {
        console.error("[Mux] Failed to create upload:", err);
        return NextResponse.json({ error: "Failed to create Mux upload" }, { status: 500 });
    }
}

// GET: Poll for playback ID once asset is ready
export async function GET(req: NextRequest) {
    const uploadId = req.nextUrl.searchParams.get("uploadId");
    if (!uploadId) return NextResponse.json({ error: "Missing uploadId" }, { status: 400 });

    try {
        const upload = await mux.video.uploads.retrieve(uploadId);

        if (!upload.asset_id) {
            return NextResponse.json({ status: upload.status, playbackId: null });
        }

        const asset = await mux.video.assets.retrieve(upload.asset_id);
        const playbackId = asset.playback_ids?.[0]?.id ?? null;

        return NextResponse.json({ status: asset.status, playbackId });
    } catch (err) {
        console.error("[Mux] Failed to retrieve upload:", err);
        return NextResponse.json({ error: "Failed to retrieve upload status" }, { status: 500 });
    }
}
