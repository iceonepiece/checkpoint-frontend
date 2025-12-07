import { NextResponse } from "next/server";
import { authenticate } from "@/lib/auth";

export async function GET() {
  const auth = await authenticate();

  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const { octokit } = auth;

  try
  {
    const { data: user } = await octokit.rest.users.getAuthenticated();

    return NextResponse.json(user);

  } catch (err) {
    console.error("Error:", err);
    return NextResponse.json({ error: err }, { status: 500 });
  }
}
