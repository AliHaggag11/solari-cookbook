import { NextResponse } from "next/server";
import { PORTAL_CREDENTIALS } from "@/lib/portal/data";
import { appBaseUrl } from "@/lib/solari/clients";

export async function POST(req: Request) {
  const form = await req.formData();
  const username = String(form.get("username") ?? "");
  const password = String(form.get("password") ?? "");
  const origin = appBaseUrl();

  if (
    username === PORTAL_CREDENTIALS.username &&
    password === PORTAL_CREDENTIALS.password
  ) {
    const res = NextResponse.redirect(new URL("/portal/dashboard", origin));
    res.cookies.set("portal_auth", "1", { httpOnly: true, path: "/" });
    return res;
  }

  return NextResponse.redirect(new URL("/portal/login?error=invalid", origin));
}
