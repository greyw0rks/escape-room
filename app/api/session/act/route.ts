import { NextResponse } from "next/server";
import { performAction, submitCode, talkTo } from "@/server/gamemaster";
import { redactRoom } from "@/server/room";
import { getSession } from "@/server/sessions";
import { nextHint } from "@/server/hints";
import { scoreSession } from "@/server/scoring";
import { disclosableKnowledge } from "@/server/npc";
import { cartographersStudy } from "@/server/rooms/cartographers-study";
import type { Action } from "@/server/types";

/**
 * Every player interaction routes through here. The engine resolves the outcome
 * server-side; the response carries only what the player is allowed to see.
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    sessionId?: string;
    kind?: "action" | "code" | "talk" | "hint";
    objectId?: string;
    action?: Action;
    code?: string;
    npcId?: string;
    message?: string;
  };

  if (!body.sessionId) {
    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
  }

  const session = getSession(body.sessionId);
  if (!session) {
    return NextResponse.json({ error: "unknown session" }, { status: 404 });
  }

  const room = cartographersStudy;

  switch (body.kind) {
    case "action": {
      if (!body.objectId || !body.action) {
        return NextResponse.json({ error: "objectId and action required" }, { status: 400 });
      }
      const outcome = performAction(room, session, body.objectId, body.action);
      return NextResponse.json({
        outcome,
        room: redactRoom(room, session),
        ...(session.endedAt !== null ? { score: scoreSession(room, session) } : {}),
      });
    }

    case "code": {
      if (!body.objectId || body.code === undefined) {
        return NextResponse.json({ error: "objectId and code required" }, { status: 400 });
      }
      const outcome = submitCode(room, session, body.objectId, body.code);
      return NextResponse.json({
        outcome,
        room: redactRoom(room, session),
        ...(session.endedAt !== null ? { score: scoreSession(room, session) } : {}),
      });
    }

    case "talk": {
      if (!body.npcId || !body.message) {
        return NextResponse.json({ error: "npcId and message required" }, { status: 400 });
      }
      const { trust } = talkTo(room, session, body.npcId, body.message);
      // Until the AI layer lands, the NPC speaks only from its allow-list.
      const known = disclosableKnowledge(room, session, body.npcId);
      const npc = room.npcs.find((n) => n.id === body.npcId);
      const line =
        known.length > 0
          ? known[Math.min(known.length - 1, session.events.length % known.length)].text
          : npc?.fallbackLines[0] ?? "No reply.";

      return NextResponse.json({
        outcome: { ok: true, effect: "talked", text: line, trust },
        room: redactRoom(room, session),
      });
    }

    case "hint": {
      const hint = nextHint(room, session, session.mode);
      return NextResponse.json({ hint, room: redactRoom(room, session) });
    }

    default:
      return NextResponse.json({ error: "unknown kind" }, { status: 400 });
  }
}
