import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const token_hash = requestUrl.searchParams.get('token_hash')
    const type = requestUrl.searchParams.get('type') as any

    const supabase = await createClient()

    if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
            type,
            token_hash,
        })
        if (!error) {
            const next = requestUrl.searchParams.get('next') || '/dashboard'
            return NextResponse.redirect(new URL(next, request.url))
        }
    }

    if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/login?error=Invalid+verification+link', request.url))
}
