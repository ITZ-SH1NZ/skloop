import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    return createBrowserClient(
        'https://skloop.jiobase.com',
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}
