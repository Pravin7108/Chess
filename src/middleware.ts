import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


const protectedRoutes = ['/login'];

export function middleware(request: NextRequest) {
    const token = request.cookies.get('gameToken')?.value;
    const { pathname } = request.nextUrl;


    if (token && protectedRoutes.includes(pathname)) {
        return NextResponse.redirect(new URL('/', request.url))
    }

    return NextResponse.next();
}


export const config = {
    matcher: ['/login']
}