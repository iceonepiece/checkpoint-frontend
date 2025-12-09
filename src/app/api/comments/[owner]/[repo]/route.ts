import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(req : Request) {
    const auth = await authenticate();

    if (!auth.ok) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json();
    const { file_id, message } = body;
  
    if (!file_id || !message) {
        return NextResponse.json(
            { error: "file_id and message are required" },
            { status: 400 }
        );
    }

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    try {
        const { data, error } = await supabase
            .from("comments")
            .insert({
                file_id,
                github_id: auth.user?.github_id,
                message,
            })
            .select()
            .single();

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ comment: data });

    } catch (err: unknown) {
        return NextResponse.json({ error: (err as Error).message }, { status: 500 });
    }
}