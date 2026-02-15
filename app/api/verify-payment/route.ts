import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { supabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Missing session ID" }, { status: 400 });
    }

    // Check if already paid
    const { data: existing } = await supabase
      .from("sessions")
      .select("paid")
      .eq("id", sessionId)
      .single();

    if (existing?.paid) {
      return NextResponse.json({ paid: true });
    }

    // Check Stripe for completed checkout sessions with this session ID
    const stripe = getStripe();
    const checkoutSessions = await stripe.checkout.sessions.list({
      limit: 10,
    });

    const matched = checkoutSessions.data.find(
      (cs) => cs.metadata?.sessionId === sessionId && cs.payment_status === "paid"
    );

    if (matched) {
      await supabase
        .from("sessions")
        .update({ paid: true, stripe_session_id: matched.id })
        .eq("id", sessionId);

      return NextResponse.json({ paid: true });
    }

    return NextResponse.json({ paid: false });
  } catch (err) {
    console.error("Verify payment error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
