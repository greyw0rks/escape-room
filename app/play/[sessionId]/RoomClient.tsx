"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClientRoom } from "@/server/room";
import type { Action } from "@/server/types";
import { Mark } from "@/components/Brand";
import { StudyScene, ObjectIcon, HOTSPOTS } from "@/components/RoomArt";
import { Artifact, hasArtifact } from "@/components/Artifacts";

interface LogLine {
  id: number;
  kind: "narration" | "player" | "system" | "win";
  text: string;
  /** Set when this line came from examining something that has prop art, so
   *  the player can tap back into the close-up later. */
  artifactId?: string;
}

interface Score {
  total: number;
  elapsedSec: number;
  hintsUsed: number;
  wrongAttempts: number;
}

export default function RoomClient({ mode }: { mode: "practice" | "ranked" }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [room, setRoom] = useState<ClientRoom | null>(null);
  const [log, setLog] = useState<LogLine[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [codeFor, setCodeFor] = useState<string | null>(null);
  const [codeValue, setCodeValue] = useState("");
  const [talkTo, setTalkTo] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [score, setScore] = useState<Score | null>(null);
  const [busy, setBusy] = useState(false);
  /** Object whose prop is open full-screen. */
  const [viewing, setViewing] = useState<string | null>(null);
  /** Objects the player has examined at least once — drives the scene marks. */
  const [seen, setSeen] = useState<Set<string>>(new Set());

  const capEndRef = useRef<HTMLDivElement>(null);
  const nextLogId = useRef(0);
  const pendingArtifact = useRef<string | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const verbsRef = useRef<HTMLDivElement>(null);
  /** Resolved px offset of the verb popover inside the stage. Null until measured. */
  const [verbsAt, setVerbsAt] = useState<{ left: number; top: number } | null>(null);

  /* The popover has to be measured before it can be placed: a percentage anchor
     can't know how wide six verbs render, so edge objects clipped outside the
     stage. Measure, then clamp fully inside. */
  useLayoutEffect(() => {
    const stage = stageRef.current;
    const pop = verbsRef.current;
    if (!selected || !stage || !pop) {
      setVerbsAt(null);
      return;
    }
    const at = HOTSPOTS[selected];
    if (!at) return;

    const sw = stage.clientWidth;
    const sh = stage.clientHeight;
    const pw = pop.offsetWidth;
    const ph = pop.offsetHeight;
    const gap = 14;
    const pad = 8;
    const hx = (at.x / 100) * sw;
    const hy = (at.y / 100) * sh;

    // Prefer below the hotspot; flip above when that would overflow the stage.
    let top = hy + gap;
    if (top + ph > sh - pad) top = hy - gap - ph;
    setVerbsAt({
      left: clamp(hx - pw / 2, pad, Math.max(pad, sw - pw - pad)),
      top: clamp(top, pad, Math.max(pad, sh - ph - pad)),
    });
  }, [selected]);

  const addLog = useCallback(
    (kind: LogLine["kind"], text: string, artifactId?: string) => {
      setLog((prev) => [...prev, { id: nextLogId.current++, kind, text, artifactId }]);
    },
    []
  );

  // Open the run on mount.
  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ mode }),
      });
      const data = await res.json();
      if (data.sessionId) {
        setSessionId(data.sessionId);
        setRoom(data.room);
        setRemaining(data.room.timeRemainingSec);
        addLog("narration", data.room.intro);
      }
    })();
  }, [mode, addLog]);

  // Display clock. The server owns the authoritative timer — this only counts down
  // what the server last reported, and every response re-syncs it.
  useEffect(() => {
    if (score || remaining <= 0) return;
    const t = setInterval(() => setRemaining((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(t);
  }, [score, remaining]);

  // Follow the caption as it grows, but not on the very first line — scrolling
  // the intro away before it is read loses the only text that sets the scene.
  useEffect(() => {
    if (log.length <= 1) return;
    capEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [log]);

  // Close the prop viewer with Escape, which is what every player will try.
  useEffect(() => {
    if (!viewing) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setViewing(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [viewing]);

  const send = useCallback(
    async (payload: Record<string, unknown>) => {
      if (!sessionId || busy) return;
      setBusy(true);
      try {
        const res = await fetch("/api/session/act", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ sessionId, ...payload }),
        });
        const data = await res.json();

        if (data.room) {
          setRoom(data.room);
          setRemaining(data.room.timeRemainingSec);
        }
        if (data.outcome) {
          const art = pendingArtifact.current;
          addLog(
            data.outcome.escaped ? "win" : "narration",
            data.outcome.text,
            art ?? undefined
          );
          // Showing the prop is the payoff for searching, so it opens itself.
          if (art) setViewing(art);
          for (const item of data.outcome.itemsGained ?? []) {
            const name = data.room?.inventory.find(
              (i: { id: string; name: string }) => i.id === item
            )?.name;
            if (name) addLog("system", `Taken: ${name}`);
          }
        }
        if (data.hint?.ok) addLog("system", data.hint.text);
        if (data.hint && !data.hint.ok) addLog("system", "No hint available right now.");
        if (data.score) setScore(data.score);
      } finally {
        pendingArtifact.current = null;
        setBusy(false);
      }
    },
    [sessionId, busy, addLog]
  );

  const doAction = (objectId: string, action: Action, label: string) => {
    addLog("player", label);
    setSelected(null);
    setSeen((prev) => new Set(prev).add(objectId));
    // Only close-up actions produce a prop — taking or pushing something does not.
    pendingArtifact.current =
      hasArtifact(objectId) && (action === "inspect" || action === "read" || action === "rotate")
        ? objectId
        : null;
    void send({ kind: "action", objectId, action });
  };

  const submitCode = () => {
    if (!codeFor || !codeValue.trim()) return;
    addLog("player", `Enter ${codeValue}`);
    void send({ kind: "code", objectId: codeFor, code: codeValue });
    setCodeValue("");
    setCodeFor(null);
  };

  const sendMessage = () => {
    if (!talkTo || !message.trim()) return;
    addLog("player", `"${message}"`);
    void send({ kind: "talk", npcId: talkTo, message });
    setMessage("");
  };

  if (!room) {
    return (
      <div className="loading" role="status" aria-live="polite">
        <Mark size={56} />
        <p className="label">Unlocking the room</p>
        <div className="loading-bar">
          <span />
        </div>
      </div>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const low = remaining <= 60;
  const selectedObject = room.objects.find((o) => o.id === selected);
  const viewingObject = room.objects.find((o) => o.id === viewing);

  return (
    <main className="room">
      <header className="room-bar">
        <Link href="/play" className="nav-link" aria-label="Leave room">
          ←
        </Link>
        <span className="room-title">{room.title}</span>
        <span
          className={`mono room-clock${low ? " room-clock-low" : ""}`}
          aria-label="Time remaining"
        >
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </header>

      <div
        className="room-progress"
        role="progressbar"
        aria-valuenow={Math.round(room.progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Puzzles solved"
      >
        <div style={{ width: `${Math.round(room.progress * 100)}%` }} />
      </div>

      {/* The room itself. You tap the thing, not a list of its name. */}
      <div className="room-stage" ref={stageRef}>
        <StudyScene />
        {room.objects.map((o) => {
          const at = HOTSPOTS[o.id];
          if (!at) return null;
          const done = seen.has(o.id);
          return (
            <button
              key={o.id}
              className={`hotspot${done ? " hotspot-done" : " hotspot-live"}`}
              style={{ left: `${at.x}%`, top: `${at.y}%`, transform: "translate(-50%, -50%)" }}
              onClick={() => setSelected(o.id)}
              aria-label={done ? o.name : `Something here — ${o.name}`}
            >
              <span className="hotspot-ring" aria-hidden>
                {done ? "" : "+"}
              </span>
              {done && <span className="hotspot-tag">{o.name}</span>}
            </button>
          );
        })}

        {/* Verbs open right where you tapped. Anchoring them to the bottom bar
            meant up to 462px of travel on a 640px screen — you tapped the wall
            map at the top and its buttons appeared at the very bottom. */}
        {selectedObject && HOTSPOTS[selectedObject.id] && (
          <div
            ref={verbsRef}
            className="verbs"
            style={
              verbsAt
                ? { left: verbsAt.left, top: verbsAt.top }
                : /* First paint is off-screen so the measurement never flashes
                     in the wrong place. */
                  { left: 0, top: 0, visibility: "hidden" }
            }
          >
            <div className="verbs-head">
              <span className="verbs-name">{selectedObject.name}</span>
              <button
                className="verbs-close"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="verbs-row">
              {selectedObject.actions.map((action) => (
                <button
                  key={action}
                  className="verb"
                  disabled={busy}
                  onClick={() => {
                    if (action === "talk") {
                      setTalkTo(selectedObject.id);
                      setSelected(null);
                    } else if (action === "insert") {
                      setCodeFor(selectedObject.id);
                      setSelected(null);
                    } else {
                      doAction(
                        selectedObject.id,
                        action,
                        `${label(action)} the ${selectedObject.name.toLowerCase()}`
                      );
                    }
                  }}
                >
                  {label(action)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* What you just found. Short, and never a scrolling transcript. */}
      <section className="room-caption" aria-live="polite">
        {log.slice(-3).map((line) => (
          <div key={line.id}>
            <p
              className={`caption-line${
                line.kind === "player"
                  ? " caption-said"
                  : line.kind === "system"
                    ? " caption-note"
                    : line.kind === "win"
                      ? " caption-win"
                      : ""
              }`}
            >
              {line.text}
            </p>
            {line.artifactId && (
              <button className="thumb" onClick={() => setViewing(line.artifactId!)}>
                <span className="thumb-art" aria-hidden>
                  <Artifact id={line.artifactId} />
                </span>
                <span>Look closer</span>
              </button>
            )}
          </div>
        ))}
        <div ref={capEndRef} />
      </section>

      {score ? (
        <section className="room-actions stack">
          <div className="card-lit stack-sm">
            <h3>{score.total > 0 ? "You made it out." : "Out of time."}</h3>
            <div className="row-between">
              <span className="muted">Score</span>
              <strong className="mono score-total">{score.total}</strong>
            </div>
            <hr className="rule" />
            <div className="row-between faint">
              <span>Time</span>
              <span className="mono">
                {Math.floor(score.elapsedSec / 60)}:
                {(score.elapsedSec % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="row-between faint">
              <span>Hints used</span>
              <span className="mono">{score.hintsUsed}</span>
            </div>
            <div className="row-between faint">
              <span>Wrong attempts</span>
              <span className="mono">{score.wrongAttempts}</span>
            </div>
          </div>
          <Link href="/play" className="btn btn-primary btn-block">
            Back to lobby
          </Link>
        </section>
      ) : (
        <section className="room-actions">
          {codeFor ? (
            <div className="stack-sm">
              <label className="label" htmlFor="code">
                Enter the code
              </label>
              <div className="row">
                <input
                  id="code"
                  className="input grow mono"
                  inputMode="numeric"
                  value={codeValue}
                  onChange={(e) => setCodeValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitCode()}
                  autoFocus
                />
                <button className="btn btn-primary" onClick={submitCode} disabled={busy}>
                  Try
                </button>
              </div>
              <button className="btn btn-ghost btn-block" onClick={() => setCodeFor(null)}>
                Cancel
              </button>
            </div>
          ) : talkTo ? (
            <div className="stack-sm">
              <label className="label" htmlFor="say">
                Say something
              </label>
              <div className="row">
                <input
                  id="say"
                  className="input grow"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                  autoFocus
                />
                <button className="btn btn-primary" onClick={sendMessage} disabled={busy}>
                  Say
                </button>
              </div>
              <button className="btn btn-ghost btn-block" onClick={() => setTalkTo(null)}>
                Stop talking
              </button>
            </div>
          ) : (
            <div className="row-between">
              <div className="chip-row grow">
                {room.inventory.length === 0 ? (
                  <span className="faint">Tap anything in the room</span>
                ) : (
                  room.inventory.map((i) => (
                    <span key={i.id} className="chip-item" title={i.description}>
                      {i.name}
                    </span>
                  ))
                )}
              </div>
              <button
                className="btn btn-ghost"
                disabled={busy}
                onClick={() => void send({ kind: "hint" })}
              >
                Hint
              </button>
            </div>
          )}
        </section>
      )}

      {/* The close-up. This is the payoff for searching: you get to actually
          look at the thing, not read a sentence about it. */}
      {viewing && (
        <div
          className="artifact"
          role="dialog"
          aria-modal="true"
          aria-label={viewingObject?.name ?? "Item"}
          onClick={() => setViewing(null)}
        >
          <div className="artifact-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="artifact-bar">
              <span className="artifact-title">{viewingObject?.name ?? "Item"}</span>
              <button className="artifact-close" onClick={() => setViewing(null)} aria-label="Close">
                ✕
              </button>
            </div>
            <div className="artifact-paper">
              <Artifact id={viewing} />
            </div>
            <div className="artifact-actions">
              <button className="btn btn-block" onClick={() => setViewing(null)}>
                Put it back
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(hi, Math.max(lo, v));
}

function label(action: Action): string {
  const map: Partial<Record<Action, string>> = {
    inspect: "Look at",
    turn_on: "Turn on",
    turn_off: "Turn off",
    insert: "Enter code",
  };
  return map[action] ?? action.charAt(0).toUpperCase() + action.slice(1);
}
