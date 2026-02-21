import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    const url = request.nextUrl.clone()
    const hasSeenOnboarding = request.cookies.get('has_seen_onboarding')?.value === 'true'

    // Define paths
    const isProtectedPath = request.nextUrl.pathname.match(/^\/(dashboard|profile|settings|roadmap|marketplace|mentorship|workspace|messages|notifications|stats|peer|practice|course|lesson|loopy|calendar|contacts|session)/);
    const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isOnboardingPath = request.nextUrl.pathname === '/onboarding';
    const isManifestoPath = request.nextUrl.pathname === '/manifesto';
    const isRootPath = request.nextUrl.pathname === '/';

    // Logic 1: Auth Guard for Protected Paths
    if (isProtectedPath && !user) {
        if (!hasSeenOnboarding) {
            url.pathname = '/onboarding'
        } else {
            url.pathname = '/login'
        }
        return NextResponse.redirect(url)
    }

    // Logic 2: Redirect authenticated users away from Public/Auth paths (except Manifesto)
    if (user && (isAuthPath || isOnboardingPath || isRootPath)) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Logic 3: Onboarding "One-Time" Visibility for unauthenticated users
    if (!user) {
        if (isRootPath) {
            if (hasSeenOnboarding) {
                url.pathname = '/login'
            } else {
                url.pathname = '/onboarding'
            }
            return NextResponse.redirect(url)
        }

        if (isOnboardingPath && hasSeenOnboarding) {
            url.pathname = '/login'
            return NextResponse.redirect(url)
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - api (API routes, Supabase handles these)
         * - manifesto (Always public)
         * - auth (Supabase auth internal routes)
         * - public assets
         */
        '/((?!_next/static|_next/image|favicon.ico|api|auth|manifesto|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
