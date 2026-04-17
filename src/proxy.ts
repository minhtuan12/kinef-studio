import { NextRequest, NextResponse } from "next/server";

export default function proxy(request: NextRequest) {
	const hostname = request.headers.get("host") || "";
	const isAdminSubdomain = hostname.startsWith("admin.");
	const isAdminPath = request.nextUrl.pathname.startsWith("/admin");

	if (!isAdminSubdomain && isAdminPath) {
		return NextResponse.rewrite(new URL("/not-found", request.url));
	}

	if (isAdminSubdomain) {
		const pathname = request.nextUrl.pathname;

		const targetPath = pathname.startsWith("/admin")
			? pathname
			: `/admin${pathname}`;

		return NextResponse.rewrite(new URL(targetPath, request.url));
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/((?!_next/static|_next/image|favicon.ico|api).*)"],
};
