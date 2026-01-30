import { NextResponse } from "next/server";
import { supabase } from "@/lib/db";

export async function POST(req: Request) {
  const { test_access_token, email, result_type } = await req.json();
  if (!test_access_token || !email || !result_type) {
    return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
  }
  const { error } = await supabase.from("result_emails").insert([
    { test_access_token, email, result_type }
  ]);
  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}
