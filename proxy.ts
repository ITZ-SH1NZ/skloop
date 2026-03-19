import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function proxy(request: NextRequest) {
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

    // Protect /api/loopy, /api/loopy-chat, and /api/generate-roadmap
    const protectedApiRoutes = ['/api/loopy', '/api/loopy-chat', '/api/generate-roadmap']
    if (protectedApiRoutes.some(route => request.nextUrl.pathname.startsWith(route))) {
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
    }

    const url = request.nextUrl.clone()
    const hasSeenOnboarding = request.cookies.get('has_seen_onboarding')?.value === 'true'

    // Define paths
    const isProtectedPath = request.nextUrl.pathname.match(/^\/(dashboard|profile|settings|roadmap|marketplace|mentorship|workspace|messages|notifications|stats|peer|practice|course|lesson|loopy|calendar|contacts|session)/);
    const isAuthPath = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup');
    const isManifestoPath = request.nextUrl.pathname === '/manifesto';
    const isRootPath = request.nextUrl.pathname === '/';

    // Logic 1: Auth Guard for Protected Paths
    if (isProtectedPath && !user) {
        if (!hasSeenOnboarding) {
            url.pathname = '/'
        } else {
            url.pathname = '/login'
        }
        return NextResponse.redirect(url)
    }

    // Logic 2: Redirect authenticated users away from Public/Auth paths (except Manifesto)
    if (user && (isAuthPath || isRootPath)) {
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    // Logic 3: Onboarding "One-Time" Visibility for unauthenticated users
    if (!user && isRootPath && hasSeenOnboarding) {
        url.pathname = '/login'
        return NextResponse.redirect(url)
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
         * - api/auth (Supabase handles these)
         * - manifesto (Always public)
         * - auth (Supabase auth internal routes)
         * - public assets
         * 
         * Note: We EXPLICITLY allow /api/loopy etc. to hit the proxy 
         * by not excluding all of 'api'.
         */
        '/((?!_next/static|_next/image|favicon.ico|api/auth|manifesto|auth|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
