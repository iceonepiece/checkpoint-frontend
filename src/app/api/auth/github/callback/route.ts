import { oauthApp } from "@/lib/github";
import { Octokit } from "octokit";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {

  const auth = await authenticate();
    
  if (auth.ok) {
    return NextResponse.json({ text: "Already logged in" }, { status: 200 });
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code') ?? "";

    const { authentication } = await oauthApp.createToken({ code });
    const accessToken = authentication.token;

    // 2. Use the token to fetch the authenticated user's info
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: userRecord, error } = await supabase
      .from('users')
      .upsert({ github_id: user.id, username: user.login, avatar_url: user.avatar_url })
      .select()
      .single()
      
    if (error) {
      console.error("Error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    

    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    // 6. Save session in DB
    const { error: sessionError } = await supabase.from("sessions").insert({
      session_token: sessionToken,
      github_id: user.id,
      github_access_token: accessToken,
    });

    if (sessionError) {
      console.error("Session insert error:", sessionError);
      return NextResponse.json({ error: sessionError.message }, { status: 500 });
    }

    const response = NextResponse.json({status:200});

    response.cookies.set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}