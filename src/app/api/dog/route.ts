import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies(); 
  const supabase = createClient(cookieStore);
  
  const { data: notes } = await supabase.from("notes").select();

  return NextResponse.json({ notes }, { status: 200 });
}