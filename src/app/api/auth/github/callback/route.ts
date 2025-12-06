import { oauthApp } from "@/lib/github";
import { Octokit } from "octokit";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get('code') ?? "";
    
        const { authentication } = await oauthApp.createToken({ code });
    
        const accessToken = authentication.token;

        console.log("User access token:", accessToken);
    
        // 2. Use the token to fetch the authenticated user's info
        const octokit = new Octokit({ auth: accessToken });
    
        const { data: user } = await octokit.rest.users.getAuthenticated();
    
        console.log("GitHub User:", user);

        const cookieStore = await cookies(); 
        const supabase = createClient(cookieStore);
          
        //const { data: notes } = await supabase.from("notes").select();

        const { data, error } = await supabase
            .from('users')
            .insert({ github_id: user.id, username: user.login, avatar_url: user.avatar_url })
            
        if (error) {
            console.error("Error:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ text: "success", access_token: authentication.token });

    } catch (err) {
        console.error("Error:", err);
        return NextResponse.json({ error: err }, { status: 500 });
    }
}