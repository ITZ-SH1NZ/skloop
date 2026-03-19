import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        return NextResponse.json({ error: "Webhook secret not configured." }, { status: 503 });
    }

    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // Verify HMAC signature
    const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest("hex");

    if (signature !== expected) {
        return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = await createClient();

    const entity = event?.payload?.payment?.entity;
    const notes  = entity?.notes || {};

    switch (event.event) {
        case "payment.captured": {
            const userId = notes.user_id;
            const type   = notes.type;
            if (!userId) break;

            if (type === "subscription") {
                const plan    = notes.plan    as string;
                const billing = notes.billing as string;

                const expiresAt = new Date();
                if (billing === "yearly") {
                    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
                } else {
                    expiresAt.setMonth(expiresAt.getMonth() + 1);
                }

                await supabase
                    .from("profiles")
                    .update({ plan, plan_expires_at: expiresAt.toISOString() })
                    .eq("id", userId);
            }

            if (type === "coin_purchase") {
                const coins = parseInt(notes.coins || "0", 10);
                if (coins > 0) {
                    await supabase.rpc("increment_profile_stats", {
                        x_user_id:   userId,
                        xp_amount:   0,
                        coins_amount: coins,
                    });
                }
            }
            break;
        }
    }

    return NextResponse.json({ received: true });
}
