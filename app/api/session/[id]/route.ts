import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const byToken = req.nextUrl.searchParams.get("by") === "token";

    let query;
    if (byToken) {
      query = supabase.from("sessions").select("*").eq("partner_token", id).single();
    } else {
      query = supabase.from("sessions").select("*").eq("id", id).single();
    }

    const { data: session, error } = await query;

    if (error || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    return NextResponse.json({
      sessionId: session.id,
      personAName: session.person_a_name,
      personBName: session.person_b_name,
      personAResults: session.person_a_results,
      combinedResults: session.combined_results,
      partnerToken: session.partner_token,
      partnerCompleted: !!session.person_b_answers,
      paid: session.paid,
    });
  } catch (err) {
    console.error("Session fetch error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
