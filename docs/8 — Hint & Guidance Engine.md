# AI Escape Room

## Document 8 — Hint & Guidance Engine

Version 1.0

---

# Executive Summary

The Hint & Guidance Engine exists for one purpose:

**Keep players thinking without letting them become frustrated.**

The goal is not to help players solve puzzles.

The goal is to help players continue making progress.

A great hint doesn't reveal an answer.

It changes what the player notices.

Players should finish a room believing:

> "I figured it out."

Not:

> "The game told me."

---

# Core Philosophy

Hints should guide curiosity.

Never replace reasoning.

The engine should preserve the satisfaction of discovery while preventing players from abandoning the room.

---

# Design Principles

The Hint Engine should:

* Be optional.
* Never interrupt.
* Scale gradually.
* Respect player skill.
* Penalize excessive use in ranked mode.
* Never reveal the entire solution unless allowed.

---

# Hint Lifecycle

```text id="hint8_001"
Player Gets Stuck
        │
        ▼
Detect Lack of Progress
        │
        ▼
Offer Hint
        │
        ▼
Player Accepts
        │
        ▼
Deliver Appropriate Hint
        │
        ▼
Continue Investigation
```

Hints should feel like a conversation, not a walkthrough.

---

# Detecting a Stuck Player

The engine may infer that a player is stuck when:

* No meaningful progress for several minutes.
* Repeating the same interaction.
* Opening the same object repeatedly.
* Walking between the same locations.
* Repeated failed puzzle attempts.
* Manual hint request.

The game should never assume failure too quickly.

Some players intentionally explore.

---

# Hint Levels

Every puzzle contains five predefined hint stages.

---

## Level 1 — Observation

Purpose:

Help the player notice something important.

Example:

> "You haven't examined everything near the fireplace."

No solution is implied.

---

## Level 2 — Focus

Purpose:

Direct attention toward the correct object.

Example:

> "The old clock seems more unusual than the other decorations."

Still no reasoning is revealed.

---

## Level 3 — Connection

Purpose:

Suggest a relationship.

Example:

> "The symbols on the clock resemble the markings on the safe."

Players must still determine how they connect.

---

## Level 4 — Reasoning

Purpose:

Explain the type of thinking required.

Example:

> "Perhaps the order of the symbols matters more than the symbols themselves."

The player performs the final deduction.

---

## Level 5 — Solution

Purpose:

Reveal the answer.

Available only in:

Practice Mode.

Never automatically available in ranked competition.

---

# Hint Sources

Hints may come from:

AI companion.

NPC dialogue.

Environmental observations.

Notebook suggestions.

Object inspection.

Internal guidance system.

The delivery method should match the room theme.

---

# AI Companion

Some rooms may include an AI companion.

Examples:

Robot assistant.

Ghost.

Drone.

Talking book.

Ancient spirit.

The companion never solves puzzles.

It simply nudges the player toward progress.

---

# Dynamic Hint Timing

Hints should not appear after fixed time intervals.

Instead, consider:

Exploration activity.

Puzzle attempts.

Interaction variety.

Player history.

Difficulty level.

Experienced players should receive fewer automatic suggestions.

---

# Ranked Mode Rules

Hints remain available.

However:

Every hint reduces the final score.

Repeated hints reduce leaderboard ranking.

Some tournaments may disable hints entirely.

Skill should remain the primary factor in competition.

---

# Practice Mode Rules

Unlimited hints.

Solution reveal available.

No leaderboard rewards.

Ideal for learning mechanics without pressure.

---

# Personalized Guidance

The engine remembers what the player has already discovered.

Example:

Poor hint:

> "Inspect the bookshelf."

Better hint:

> "You've already searched the bookshelf. Perhaps something you found there connects to another object."

Hints should build on the player's journey.

---

# Anti-Spoiler Rules

Hints must never:

Reveal passwords.

Reveal combinations.

Reveal final codes.

Reveal hidden dialogue.

Reveal object locations directly.

Unless the player explicitly requests the final solution in Practice Mode.

---

# Visual Guidance

Subtle environmental changes may assist players.

Examples:

Light reflecting from an important object.

Camera gently centering after interaction.

Slight animation.

Audio cue.

These should never become obvious "objective markers."

---

# Conversation-Based Guidance

Players may naturally ask:

"I don't know what to do."

"I'm stuck."

"Can someone help me?"

The AI responds according to the current hint level rather than exposing puzzle solutions.

---

# Accessibility

Some players may require stronger guidance.

Accessibility options may include:

Higher object contrast.

Additional contextual hints.

Longer interaction descriptions.

Reduced penalty hints.

These settings should remain optional.

---

# Anti-Frustration Rules

The engine should never allow players to remain completely blocked.

If repeated failures continue:

Increase guidance.

Suggest unexplored areas.

Recommend reviewing collected notes.

Do not reveal answers prematurely.

---

# Analytics

Track:

Most requested hints.

Puzzle abandonment after hints.

Hint effectiveness.

Average hint level.

Rooms requiring excessive guidance.

Use analytics to improve puzzle quality rather than increasing hint frequency.

---

# Future Expansion

Possible additions:

Adaptive AI tutors.

Voice-based hints.

Friend-assisted hints.

Community replay hints.

Creator-authored hint paths.

These should remain outside the MVP.

---

# Acceptance Criteria

The Hint & Guidance Engine is complete when:

* Players rarely abandon rooms because of frustration.
* Hints preserve the satisfaction of solving puzzles.
* Guidance adapts to player progress.
* Ranked mode maintains competitive fairness.
* Practice mode remains welcoming to new players.
* Every puzzle includes structured hint progression.
* Players consistently feel helped rather than carried.

---

# Competitive Advantage

Many escape games either provide no hints or instantly reveal solutions.

AI Escape Room treats hints as part of the puzzle design.

The game understands:

What the player has seen.

What they have tried.

What they have misunderstood.

It responds with guidance tailored to their investigation rather than generic walkthrough text.

Two players stuck on the same puzzle may receive different hints based on their actions.

This makes assistance feel intelligent instead of scripted.

---

# Final Principle

A perfect hint changes the player's perspective, not the puzzle.

Players should experience the moment:

> "Wait... I was looking at the wrong thing."

That realization creates a sense of ownership over the solution.

The player still escapes through their own reasoning, and that is what makes the victory memorable.
