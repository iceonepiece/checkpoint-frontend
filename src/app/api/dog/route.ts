import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore = await cookies(); 
  const supabase = createClient(cookieStore);
  
  const { data: notes } = await supabase.from("notes").select();

  return NextResponse.json({ notes }, { status: 200 });

}