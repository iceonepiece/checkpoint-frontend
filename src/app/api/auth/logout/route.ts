import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const sessionToken = cookieStore.get("session")?.value;

  if (sessionToken) {
    // Remove session from DB
    await supabase.from("sessions").delete().eq("session_token", sessionToken);
  }

  const response = NextResponse.json({ success: true });

  // FORCE delete the cookie by setting it to expire instantly
  response.cookies.set("session", "", {
    path: "/",
    expires: new Date(0), // 1970-01-01
  });

  return response;
}