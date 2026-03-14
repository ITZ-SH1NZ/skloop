import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const url = searchParams.get("url");

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        // Validate the URL
        const parsedUrl = new URL(url);
        const domain = parsedUrl.hostname;

        // Fetch the page HTML with a timeout
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);

        const res = await fetch(url, {
            signal: controller.signal,
            headers: {
                "User-Agent": "SkloopBot/1.0 (link preview; +https://skloop.com)",
            },
        });
        clearTimeout(timeout);

        if (!res.ok) {
            return NextResponse.json({ domain, title: url, description: null, image: null });
        }

        const html = await res.text();

        // Extract OG tags via regex (no DOM parser in edge runtime)
        const og = (property: string): string | null => {
            const match =
                html.match(new RegExp(`<meta[^>]*property=["']og:${property}["'][^>]*content=["']([^"']+)["']`, "i")) ||
                html.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:${property}["']`, "i"));
            return match?.[1] ?? null;
        };

        const title = og("title") || html.match(/<title>(.*?)<\/title>/i)?.[1] || url;
        const description = og("description") || html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)?.[1] || null;
        const image = og("image") || null;
        const siteName = og("site_name") || domain;

        return NextResponse.json({ domain, title, description, image, siteName });
    } catch (err) {
        // Network error or invalid URL — return a minimal fallback
        try {
            const domain = new URL(url).hostname;
            return NextResponse.json({ domain, title: url, description: null, image: null, siteName: domain });
        } catch {
            return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
        }
    }
}
