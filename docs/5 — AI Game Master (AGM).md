# AI Escape Room

## Document 5 — AI Game Master (AGM)

Version 1.0

---

# Executive Summary

The AI Game Master (AGM) is the invisible intelligence that runs every escape room.

Unlike the AI NPCs, the AGM is **never a character** inside the game.

It acts as the director behind the scenes, ensuring every room is fair, engaging, immersive, and consistent.

The AGM controls pacing, validates player actions, coordinates NPCs, delivers hints, prevents dead ends, and maintains the illusion that the room is alive.

Players should never know the AGM exists.

They should simply feel that the game "understands" them.

---

# Core Philosophy

The AGM is not trying to beat the player.

It is trying to create the most satisfying escape possible.

The objective is not maximum difficulty.

The objective is maximum enjoyment.

---

# Responsibilities

The AGM is responsible for:

* Managing room progression.
* Understanding player intent.
* Coordinating AI NPCs.
* Validating interactions.
* Delivering hints.
* Tracking puzzle state.
* Preventing soft locks.
* Detecting exploits.
* Maintaining immersion.

It does **not** directly talk to the player.

---

# High-Level Architecture

```text id="agm5_001"
Player Input
      │
      ▼
Intent Analyzer
      │
      ▼
Action Validator
      │
      ▼
Puzzle Engine
      │
      ▼
Room State Manager
      │
      ▼
NPC Coordinator
      │
      ▼
Hint Manager
      │
      ▼
Response Generator
```

The AGM orchestrates every subsystem.

---

# Room State

The AGM maintains a complete understanding of the room.

Examples:

Doors unlocked.

Objects moved.

Items collected.

NPC trust.

Puzzle completion.

Secrets discovered.

Hints used.

Remaining time.

Every player action updates the room state.

---

# Intent Recognition

Players may express actions naturally.

Examples:

"I pull the lever."

"I search the bookshelf."

"I ask the robot about the vault."

"I smash the window."

"I inspect the painting."

The AGM converts natural language into structured game actions.

---

# Action Validation

Every action must be checked.

Possible outcomes:

Allowed.

Blocked.

Impossible.

Already completed.

Requires item.

Requires puzzle completion.

Requires trust.

The AGM always explains why an action fails without breaking immersion.

---

# Rule Enforcement

Examples:

Locked doors cannot open.

Objects cannot exist in two places.

Destroyed items remain destroyed if intended.

Inventory limits are respected.

Puzzle order is maintained.

Game rules should always remain consistent.

---

# Room Progression

The AGM determines when:

New puzzles appear.

Objects become interactive.

NPC behavior changes.

Music changes.

The final door unlocks.

Progression should feel natural rather than scripted.

---

# Dynamic Pacing

The AGM observes player progress.

If players advance too quickly:

Introduce optional exploration.

If players struggle:

Increase environmental guidance.

Never change the solution.

Only adjust the experience.

---

# AI Coordination

NPCs never operate independently.

The AGM synchronizes:

Knowledge.

Puzzle state.

Trust.

World events.

Dialogue consistency.

All AI entities should share the same understanding of the current room.

---

# Hint Manager

Hints should only appear when appropriate.

Possible triggers:

Player inactivity.

Repeated mistakes.

Multiple failed attempts.

Manual request.

Hints should never interrupt successful players.

---

# Hint Levels

Level 1

Encourage observation.

Level 2

Suggest an area.

Level 3

Reference an object.

Level 4

Explain reasoning.

Level 5

Reveal solution (practice mode only).

Ranked mode should stop before the final solution.

---

# Adaptive Difficulty

The AGM monitors:

Puzzle completion time.

Hint usage.

Repeated failures.

Exploration behavior.

It may adjust:

Dialogue.

Hint timing.

Visual emphasis.

Ambient feedback.

It must never change puzzle logic mid-game.

---

# Immersion Protection

The AGM protects immersion.

It should never:

Mention prompts.

Mention AI models.

Mention internal rules.

Reveal hidden mechanics.

Break the fourth wall.

The world must always remain believable.

---

# Exploit Detection

The AGM detects attempts such as:

Prompt injection.

Prompt extraction.

Asking for hidden instructions.

Requesting the room solution directly.

Manipulating NPC behavior.

Skipping puzzle progression.

When detected, responses should remain in character and preserve the integrity of the game.

---

# Recovery System

Players should never become permanently stuck.

The AGM detects:

Missing items.

Impossible states.

Unexpected sequences.

Interaction failures.

Recovery mechanisms should restore play without exposing internal systems.

---

# Time Management

Each room has a target duration.

The AGM monitors:

Elapsed time.

Puzzle completion speed.

Remaining objectives.

If necessary, it increases subtle guidance to help players finish within the intended session length.

---

# Memory

The AGM remembers everything during the current room.

Examples:

Objects inspected.

Conversations.

Failed attempts.

Incorrect theories.

Hint history.

Inventory usage.

This allows future responses to remain coherent.

---

# Response Quality

Responses should be:

Fast.

Consistent.

Context-aware.

Immersive.

Helpful.

Never repetitive.

---

# Edge Cases

Examples:

Player attempts impossible action.

Player repeats same action 20 times.

Player ignores all puzzles.

Player asks unrelated questions.

Player insults NPCs.

The AGM should respond gracefully without breaking gameplay.

---

# Performance Targets

Target response latency:

Player action acknowledgment:

Less than 300 ms.

AI response begins streaming:

Less than 2 seconds.

Long delays reduce immersion.

---

# Analytics

Track:

Average room duration.

Most common failures.

Hint usage.

Puzzle bottlenecks.

Room completion rate.

Player abandonment.

Unexpected player behavior.

These metrics improve future rooms.

---

# Future Expansion

The AGM architecture should support:

Multiplayer rooms.

Competitive races.

Community-created rooms.

Voice interactions.

Live events.

Seasonal rule changes.

These are future capabilities and should not complicate the MVP.

---

# Acceptance Criteria

The AI Game Master is complete when:

* Every player action is interpreted consistently.
* Room state remains synchronized across all systems.
* NPCs respond using the same understanding of the world.
* Players cannot become permanently stuck.
* Hints preserve challenge while preventing frustration.
* Attempts to exploit the AI are safely handled.
* The game maintains immersion from beginning to end.

---

# Competitive Advantage

Most escape room games rely on scripted event managers.

AI Escape Room uses an intelligent Game Master that understands player intent.

Whether a player says:

> "Open the cabinet."

Or:

> "I gently pull the old wooden cupboard door."

Or:

> "Is there anything inside that cabinet?"

The AGM recognizes the intent and produces a consistent outcome.

Players interact with the world naturally instead of learning predefined commands.

This makes every room feel less like a game interface and more like a real place.

---

# Final Principle

The best Game Master is invisible.

Players should never think:

> "The AI understood my command."

They should think:

> "Of course that worked."

When the AGM disappears into the experience, the room itself becomes the star.
