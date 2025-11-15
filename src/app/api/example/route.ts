import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const cookieStore:any = await cookies(); 
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase
    .from("bookcopy")
    .select(`copyid, acquisitiondate, book(isbn, title, publisher, pubyear)`)
    .order("acquisitiondate", { ascending: false })
    .limit(5);

  if (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}