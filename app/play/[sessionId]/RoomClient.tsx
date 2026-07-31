"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { ClientRoom } from "@/server/room";
import type { Action } from "@/server/types";

interface LogLine {
  id: number;
  kind: "narration" | "player" | "system" | "win";
  text: string;
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

  const logEndRef = useRef<HTMLDivElement>(null);
  const nextLogId = useRef(0);

  const addLog = useCallback((kind: LogLine["kind"], text: string) => {
    setLog((prev) => [...prev, { id: nextLogId.current++, kind, text }]);
  }, []);

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

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [log]);

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
          addLog(data.outcome.escaped ? "win" : "narration", data.outcome.text);
          for (const item of data.outcome.itemsGained ?? []) {
            const name = data.room?.inventory.find(
              (i: { id: string; name: string }) => i.id === item
            )?.name;
            if (name) addLog("system", `Taken: ${name}`);
          }
        }
        if (data.hint?.ok) addLog("system", `Hint: ${data.hint.text}`);
        if (data.hint && !data.hint.ok) addLog("system", "No hint available right now.");
        if (data.score) setScore(data.score);
      } finally {
        setBusy(false);
      }
    },
    [sessionId, busy, addLog]
  );

  const doAction = (objectId: string, action: Action, label: string) => {
    addLog("player", label);
    setSelected(null);
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
      <main className="pad center stack" style={{ paddingTop: "var(--space-7)" }}>
        <p className="muted">Opening the room…</p>
      </main>
    );
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const low = remaining <= 60;

  const selectedObject = room.objects.find((o) => o.id === selected);

  return (
    <main className="room">
      <header className="room-bar">
        <Link href="/" className="nav-link" aria-label="Leave room">
          ←
        </Link>
        <span className="pill">{mode === "ranked" ? "Ranked" : "Practice"}</span>
        <span
          className="tabular room-clock"
          style={{ color: low ? "var(--rose)" : "var(--text)" }}
          aria-label="Time remaining"
        >
          {mins}:{secs.toString().padStart(2, "0")}
        </span>
      </header>

      <div className="room-progress" aria-hidden="true">
        <div style={{ width: `${Math.round(room.progress * 100)}%` }} />
      </div>

      <section className="room-log" aria-live="polite">
        {log.map((line) => (
          <p key={line.id} className={`log log-${line.kind}`}>
            {line.text}
          </p>
        ))}
        <div ref={logEndRef} />
      </section>

      {score ? (
        <section className="room-actions stack">
          <div className="card-lit stack-sm">
            <h3>{score.total > 0 ? "You made it out." : "Out of time."}</h3>
            <div className="row-between">
              <span className="muted">Score</span>
              <strong className="tabular">{score.total}</strong>
            </div>
            <div className="row-between faint">
              <span>Time</span>
              <span className="tabular">
                {Math.floor(score.elapsedSec / 60)}:
                {(score.elapsedSec % 60).toString().padStart(2, "0")}
              </span>
            </div>
            <div className="row-between faint">
              <span>Hints used</span>
              <span className="tabular">{score.hintsUsed}</span>
            </div>
          </div>
          <Link href="/" className="btn btn-primary btn-block">
            Back to lobby
          </Link>
        </section>
      ) : (
        <section className="room-actions">
          {codeFor ? (
            <div className="stack-sm">
              <label className="faint" htmlFor="code">
                Enter the code
              </label>
              <div className="row">
                <input
                  id="code"
                  className="input grow"
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
              <label className="faint" htmlFor="say">
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
          ) : selectedObject ? (
            <div className="stack-sm">
              <div className="row-between">
                <strong>{selectedObject.name}</strong>
                <button className="btn btn-ghost" onClick={() => setSelected(null)}>
                  Back
                </button>
              </div>
              <div className="chip-row">
                {selectedObject.actions.map((action) => (
                  <button
                    key={action}
                    className="chip"
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
          ) : (
            <div className="stack-sm">
              <div className="chip-row">
                {room.objects.map((o) => (
                  <button key={o.id} className="chip" onClick={() => setSelected(o.id)}>
                    {o.name}
                  </button>
                ))}
              </div>
              <div className="row-between">
                <div className="chip-row grow">
                  {room.inventory.length === 0 ? (
                    <span className="faint">Nothing in hand</span>
                  ) : (
                    room.inventory.map((i) => (
                      <span key={i.id} className="chip chip-item" title={i.description}>
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
            </div>
          )}
        </section>
      )}
    </main>
  );
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
