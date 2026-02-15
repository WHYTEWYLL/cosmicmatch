import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { computeIndividualResults, computeCombinedResults } from "@/lib/scoring";

export async function POST(req: NextRequest) {
  try {
    const { token, answers } = await req.json();

    if (!token || !answers || answers.length === 0) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get the session by partner token
    const { data: session, error: fetchError } = await supabase
      .from("sessions")
      .select("*")
      .eq("partner_token", token)
      .single();

    if (fetchError || !session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    if (!session.paid) {
      return NextResponse.json({ error: "This session has not been paid for yet" }, { status: 403 });
    }

    if (session.person_b_answers) {
      // Partner already completed — just redirect to results
      return NextResponse.json({ sessionId: session.id });
    }

    // Compute combined results
    const personAResults = session.person_a_results;
    const combinedResults = computeCombinedResults(
      session.person_a_answers,
      answers,
      personAResults
    );

    const personBResults = computeIndividualResults(answers);

    const { error: updateError } = await supabase
      .from("sessions")
      .update({
        person_b_answers: answers,
        combined_results: {
          ...combinedResults,
          person_b_results: personBResults,
        },
      })
      .eq("id", session.id);

    if (updateError) {
      console.error("Failed to update partner answers:", updateError);
      return NextResponse.json({ error: "Failed to save quiz" }, { status: 500 });
    }

    return NextResponse.json({ sessionId: session.id });
  } catch (err) {
    console.error("Partner submit error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
