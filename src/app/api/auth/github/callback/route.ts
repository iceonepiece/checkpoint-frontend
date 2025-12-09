import { oauthApp } from "@/lib/github";
import { Octokit } from "octokit";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authenticate } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const auth = await authenticate();
  
  if (auth.ok) {
    return NextResponse.redirect(new URL('/', req.url));
  }

  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code') ?? "";

    if (!code) {
        throw new Error("No code received from GitHub");
    }

    // 2. Exchange Code for Token
    const { authentication } = await oauthApp.createToken({ code });
    const accessToken = authentication.token;

    // 3. Fetch User Info from GitHub
    const octokit = new Octokit({ auth: accessToken });
    const { data: user } = await octokit.rest.users.getAuthenticated();
    
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // 4. Upsert User into DB
    const { error: userError } = await supabase
      .from('users')
      .upsert({ 
        github_id: user.id, 
        username: user.login, 
        avatar_url: user.avatar_url 
      })
      .select()
      .single();
      
    if (userError) {
      console.error("DB Error (User):", userError);
      // Redirect to login with error flag
      return NextResponse.redirect(new URL('/login?error=db_user_error', req.url));
    }

    // 5. Create Session
    const sessionToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    const { error: sessionError } = await supabase.from("sessions").insert({
      session_token: sessionToken,
      github_id: user.id,
      github_access_token: accessToken,
    });

    if (sessionError) {
      console.error("DB Error (Session):", sessionError);
      return NextResponse.redirect(new URL('/login?error=db_session_error', req.url));
    }

    // 6. Success! Redirect to Home
    const response = NextResponse.redirect(new URL('/', req.url));

    response.cookies.set({
      name: "session",
      value: sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return response;

  } catch (err) {
    console.error("Callback Error:", err);
    // General error -> Send back to login
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', req.url));
  }
}