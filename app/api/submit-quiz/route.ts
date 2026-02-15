import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { computeIndividualResults } from "@/lib/scoring";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { personAName, personBName, answers } = await req.json();

    if (!personAName || !personBName || !answers || answers.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const individualResults = computeIndividualResults(answers);
    const partnerToken = crypto.randomUUID();

    const { data, error } = await supabase
      .from("sessions")
      .insert({
        person_a_name: personAName,
        person_b_name: personBName,
        person_a_answers: answers,
        person_a_results: individualResults,
        partner_token: partnerToken,
        paid: false,
      })
      .select("id")
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: data.id });
  } catch (err) {
    console.error("Submit quiz error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
