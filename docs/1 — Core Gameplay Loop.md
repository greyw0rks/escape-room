# AI Escape Room

## Document 1 — Core Gameplay Loop

Version 1.0

---

# Executive Summary

The Core Gameplay Loop defines the heart of AI Escape Room.

Every feature, puzzle, AI interaction, crypto mechanic, and user interface should reinforce this loop.

If a feature does not make the loop more enjoyable, shorter, more replayable, or more rewarding, it should not be included in the Mini App.

This document is the single source of truth for gameplay.

---

# Product Goal

Create the fastest, most replayable AI puzzle game where players can:

* Enter a room in seconds.
* Solve unique puzzles.
* Escape before time expires.
* Earn rewards based on skill.
* Immediately want to play another room.

A complete session should rarely exceed **8 minutes**.

---

# Core Player Loop

```text
Open Mini App
        │
        ▼
Connect Wallet (optional for practice)
        │
        ▼
Choose Room
        │
        ▼
Pay Entry Fee (Ranked Mode)
        │
        ▼
Room Loads
        │
        ▼
Observe
        │
        ▼
Explore
        │
        ▼
Interact
        │
        ▼
Solve Puzzles
        │
        ▼
Escape
        │
        ▼
Score Calculated
        │
        ▼
Rewards Distributed
        │
        ▼
Leaderboard Updated
        │
        ▼
Play Again
```

The entire experience should require as few taps as possible.

---

# Session Length

Target duration:

Easy Room

3–5 minutes

Medium Room

5–7 minutes

Hard Room

7–10 minutes

The game should discourage extremely long sessions.

Players should finish, claim rewards, and immediately begin another room.

---

# First-Time Experience

A new player should experience the following within one minute:

Launch app.

↓

Choose practice room.

↓

See locked exit.

↓

Find first clue.

↓

Talk to AI.

↓

Solve first puzzle.

↓

Feel clever.

No tutorial should be required.

The game teaches through interaction.

---

# The Five Gameplay Pillars

## 1. Curiosity

Players should constantly ask:

"What happens if I try this?"

The game should reward experimentation.

---

## 2. Observation

Everything visible may matter.

Books.

Pictures.

Buttons.

Computers.

Objects.

NPC behavior.

Small details become satisfying discoveries.

---

## 3. Conversation

Players communicate naturally with AI.

Example:

> "Why are you hiding that key?"

> "What happens if I disconnect the power?"

> "Can you tell me who owns this notebook?"

Players are never limited to dialogue trees.

---

## 4. Reasoning

Players combine information.

Nothing should be solved by random tapping.

Every puzzle has understandable logic.

---

## 5. Escape

Every room ends with one clear objective:

Escape.

The objective never changes.

Only the journey changes.

---

# Room Structure

Every room contains:

Starting area.

Locked objective.

Puzzle chain.

Optional secrets.

AI interaction.

Final challenge.

Exit.

Players should always understand the ultimate goal.

---

# Puzzle Progression

Each room follows a rhythm.

```text
Observation

↓

Discovery

↓

Small Win

↓

New Information

↓

Bigger Puzzle

↓

Twist

↓

Final Puzzle

↓

Escape
```

Frequent small victories maintain momentum.

---

# AI Interaction Loop

Player asks.

↓

AI responds.

↓

Player learns.

↓

Player tests theory.

↓

Puzzle advances.

The AI should encourage thinking rather than provide answers.

---

# Reward Loop

Complete room.

↓

Receive score.

↓

Receive rewards.

↓

Unlock achievements.

↓

Improve ranking.

↓

Challenge friends.

↓

Start another room.

This loop should take less than one minute after escaping.

---

# Failure Loop

If the player fails:

Reveal limited feedback.

↓

Show missed opportunities.

↓

Offer retry.

↓

Return to lobby.

Failure should create motivation rather than frustration.

---

# Hint Philosophy

Hints should never reveal solutions immediately.

Instead they should progress through stages.

Stage 1

Observation hint.

Stage 2

Direction hint.

Stage 3

Reasoning hint.

Stage 4

Strong guidance.

Stage 5

Solution (practice mode only).

Ranked rooms should heavily penalize excessive hint usage.

---

# Difficulty Levels

Easy

For first-time players.

Medium

Standard experience.

Hard

Experienced players.

Expert

Competitive players.

Nightmare

Seasonal challenge.

Difficulty changes puzzle complexity, not randomness.

---

# Practice Mode

No entry fee.

No crypto rewards.

Unlimited retries.

Hints enabled.

Perfect for learning.

---

# Ranked Mode

Entry fee required.

Limited hints.

Timed.

Leaderboards enabled.

Crypto rewards available.

Anti-cheat verification active.

---

# Tournament Mode

Scheduled events.

Shared room seed.

Large prize pools.

Global rankings.

One attempt only.

Tournament rooms should feel prestigious.

---

# Daily Challenge

One room.

Same puzzle for everyone.

Fresh every 24 hours.

Compete globally.

This becomes the game's primary retention mechanic.

---

# Scoring

Score components include:

Escape time.

Hints used.

Puzzle accuracy.

Objects discovered.

Secrets found.

AI interaction efficiency.

Bonus objectives.

The scoring algorithm should reward intelligent play over speed alone.

---

# Replayability

Replayability comes from variation, not repetition.

Different:

Room themes.

Puzzle layouts.

AI personalities.

Object placement.

Clue presentation.

Hidden secrets.

Players should rarely encounter identical experiences.

---

# Social Loop

Player escapes.

↓

Shares result.

↓

Friend joins.

↓

Friend attempts room.

↓

Competition begins.

Sharing should happen naturally after exciting victories.

---

# Player Psychology

The player should repeatedly experience:

"I noticed something."

↓

"I think I understand."

↓

"It worked."

↓

"I'm smarter than I thought."

That emotional progression is more important than puzzle difficulty.

---

# Crypto Psychology

Players should feel:

"I earned this."

Never:

"I got lucky."

Rewards must reinforce mastery, not gambling.

---

# Design Constraints

Avoid:

Long tutorials.

Complex inventories.

Pixel hunting.

Guessing.

Random solutions.

Hidden mechanics.

Artificial difficulty.

Every puzzle should be explainable after completion.

---

# Acceptance Criteria

The gameplay loop is successful when:

* A new player can begin playing within 30 seconds.
* A complete session averages between 3 and 8 minutes.
* Every room ends with a clear sense of accomplishment.
* Players naturally choose to begin another room.
* Skill consistently outperforms luck.
* Crypto rewards enhance motivation without overshadowing gameplay.
* The game remains enjoyable even in Practice Mode without monetary rewards.

---

# Final Principle

Every decision should answer one question:

> **"Does this make escaping more satisfying?"**

If the answer is yes, keep it.

If the answer is no, remove it.

The goal of AI Escape Room is not to build the biggest puzzle game.

It is to build the game that players cannot stop replaying because every escape feels earned, every room feels fresh, and every victory feels worth sharing.
