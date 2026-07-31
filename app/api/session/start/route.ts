import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { newSession, redactRoom } from "@/server/room";
import { putSession, claimRun, existingRun } from "@/server/sessions";
import { sessionKey } from "@/server/gamemaster";
import { cartographersStudy } from "@/server/rooms/cartographers-study";
import { currentDayId } from "@/lib/contract";

/**
 * Open a run.
 *
 * Practice needs no wallet and is unlimited. Ranked is one attempt per wallet
 * per day, enforced here rather than in the client.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    player?: string;
  };

  const mode = body.mode === "ranked" ? "ranked" : "practice";
  const room = cartographersStudy;

  if (mode === "ranked") {
    if (!body.player) {
      return NextResponse.json({ error: "wallet required for ranked" }, { status: 400 });
    }

    const key = sessionKey(currentDayId(), body.player, "ranked");
    const already = existingRun(key);
    if (already) {
      return NextResponse.json(
        { error: "already_played", sessionId: already },
        { status: 409 }
      );
    }

    const session = newSession(room, "ranked", body.player, randomUUID());
    claimRun(key, session.id);
    putSession(session);

    return NextResponse.json({
      sessionId: session.id,
      room: redactRoom(room, session),
    });
  }

  const session = newSession(room, "practice", null, randomUUID());
  putSession(session);

  return NextResponse.json({
    sessionId: session.id,
    room: redactRoom(room, session),
  });
}
