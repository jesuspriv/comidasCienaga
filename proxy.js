import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

const DASHBOARD_PATH = '/dashboard'

export async function proxy(request) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    },
  )

  // Con una sesión vencida o inválida `data` llega en null: se trata como no autenticado.
  const { data } = await supabase.auth.getClaims()
  const claims = data?.claims

  if (request.nextUrl.pathname.startsWith(DASHBOARD_PATH) && !claims?.sub) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    loginUrl.searchParams.set('next', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*'],
}
