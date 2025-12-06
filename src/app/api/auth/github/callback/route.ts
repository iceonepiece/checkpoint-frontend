import { oauthApp } from "@/lib/github";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const code = searchParams.get('code') ?? "";
    
        const { authentication } = await oauthApp.createToken({ code });
    
        console.log("User access token:", authentication.token);
        return NextResponse.json({ text: "success", access_token: authentication.token });

    } catch (error) {
        console.error("Error:", error);
        return NextResponse.json({ error: error }, { status: 500 });
    }
}