import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')

    if (code) {
        const supabase = await createClient()

        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            return NextResponse.redirect(new URL('/dashboard', request.url))
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(new URL('/login?error=Invalid+verification+link', request.url))
}
