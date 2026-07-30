# AI Escape Room

## Document 4 — AI NPC & Character System

Version 1.0

---

# Executive Summary

The AI NPC & Character System is what transforms AI Escape Room from a traditional puzzle game into a living experience.

NPCs are not quest givers.

They are not dialogue trees.

They are intelligent participants inside the room.

Some help.

Some deceive.

Some know nothing.

Some are the puzzle.

The player should feel like they're interacting with believable characters rather than chatting with an AI.

---

# Core Philosophy

NPCs exist to make puzzles feel alive.

They should never replace puzzles.

They should enrich them.

---

# Golden Rules

Every NPC must:

* Have a personality.
* Have knowledge boundaries.
* Have goals.
* React to the player's behavior.
* Stay in character.
* Never accidentally reveal the solution.

---

# NPC Architecture

```text id="npc4_001"
Character Profile
        │
        ▼
Personality
        │
        ▼
Knowledge Base
        │
        ▼
Goals
        │
        ▼
Conversation Engine
        │
        ▼
Emotion Engine
        │
        ▼
Memory
```

Each component is independent.

---

# Character Components

Every NPC contains:

Identity

Role

Personality

Speaking style

Knowledge

Secrets

Current mood

Trust level

Interaction history

Restrictions

---

# Character Roles

Possible roles include:

Caretaker

Scientist

Robot

Ghost

Prisoner

Security Guard

Archivist

Merchant

Assistant

Janitor

Librarian

Engineer

Explorer

AI Computer

Pet

Not every room requires human characters.

Sometimes the room itself is the character.

---

# Personality

NPCs should have distinct personalities.

Examples:

Friendly

Sarcastic

Cowardly

Suspicious

Confident

Curious

Calm

Nervous

Arrogant

Logical

Chaotic

Kind

Players should recognize personalities after only a few messages.

---

# Speaking Style

Characters speak differently.

Examples:

Very formal.

Very brief.

Uses jokes.

Overly dramatic.

Technical.

Old-fashioned.

Childlike.

Poetic.

The language should reinforce identity.

---

# Knowledge Boundaries

Each NPC knows only what they reasonably should.

Example:

The janitor knows:

Building layout.

Storage rooms.

Maintenance schedules.

He should not know:

Secret research passwords.

Corporate finances.

Hidden escape code.

Knowledge limitations are essential.

---

# Secret Knowledge

NPCs may possess hidden information.

Examples:

Vault location.

Lost key.

Betrayal.

Hidden switch.

Security weakness.

Players must earn access to this information.

---

# Trust System

Trust ranges from:

Hostile

↓

Suspicious

↓

Neutral

↓

Friendly

↓

Helpful

↓

Loyal

Trust changes through player behavior.

---

# Increasing Trust

Possible methods:

Being polite.

Helping the NPC.

Returning lost items.

Solving problems.

Keeping promises.

Showing evidence.

---

# Decreasing Trust

Examples:

Threatening.

Lying.

Repeated accusations.

Destroying objects.

Ignoring requests.

Breaking agreements.

NPCs should react naturally.

---

# Emotion Engine

NPC emotions change during gameplay.

Possible emotions:

Happy

Afraid

Angry

Confused

Hopeful

Excited

Relieved

Panicked

Embarrassed

Emotion influences dialogue.

Not puzzle logic.

---

# Memory

NPCs remember the current room session.

Examples:

Questions asked.

Items shown.

Promises made.

Player behavior.

Trust changes.

Solved puzzles.

Memory improves immersion without requiring permanent persistence.

---

# Conversation Rules

Players may ask anything.

NPCs respond naturally.

They should:

Clarify.

Deflect.

Question.

React emotionally.

Provide hints only when appropriate.

Avoid repetitive responses.

---

# Information Hierarchy

NPCs classify information as:

Public.

Personal.

Secret.

Critical.

Forbidden.

The trust system determines what becomes accessible.

---

# AI Guardrails

NPCs must never:

Reveal the final solution.

Break character.

Mention prompts.

Mention AI.

Reveal hidden developer information.

Invent impossible facts.

When uncertain, they should admit uncertainty.

---

# NPC as Puzzle

Some NPCs are themselves puzzles.

Examples:

One always lies.

One only answers in riddles.

One forgets every minute.

One speaks in code.

One responds based on emotion.

Players solve the conversation, not just the room.

---

# Dynamic Reactions

NPCs respond to:

Objects discovered.

Time remaining.

Puzzle progress.

Player success.

Repeated mistakes.

Inventory.

They should acknowledge meaningful events.

---

# AI Object Characters

Characters do not need bodies.

Examples:

Talking mirror.

Smart computer.

Magic book.

Security system.

Ancient statue.

Spaceship AI.

These often become the room's most memorable characters.

---

# Humor

Occasional humor is encouraged.

Not every interaction should be serious.

Funny NPCs increase shareability.

Humor must never undermine puzzle clarity.

---

# Hint Behavior

NPCs should never immediately answer:

"What's the code?"

Instead they might say:

"I've seen numbers scratched into the wall near the old bookshelf..."

They guide.

They do not solve.

---

# Lying

Some NPCs intentionally lie.

Rules:

Lies must be consistent.

Lies must be detectable.

Players should always have a way to verify the truth.

No unwinnable deception.

---

# Multiple NPC Rooms

Some rooms include several characters.

Each possesses different knowledge.

Players gather information by combining conversations.

No single NPC should know everything.

---

# Accessibility

Conversation should support:

Text.

Optional voice.

Translation.

Replay history.

Large text.

Players should never lose important dialogue.

---

# Performance

NPC responses should begin streaming quickly.

Target:

First token within approximately 2 seconds.

Long pauses reduce immersion.

---

# Analytics

Measure:

Average conversation length.

Most asked questions.

Hint requests.

Trust progression.

Frequently misunderstood NPCs.

Repeated dialogue loops.

Use data to improve prompts and personalities.

---

# Future Expansion

The architecture should support:

Co-op conversations.

Creator-designed NPCs.

Seasonal personalities.

Community voting.

Voice NPCs.

Animated avatars.

Persistent recurring characters.

These are not required for the MVP.

---

# Acceptance Criteria

The AI NPC System is complete when:

* Every NPC has a distinct personality and speaking style.
* NPC knowledge remains consistent with their role.
* Trust and emotion influence conversations naturally.
* Players can communicate using natural language.
* NPCs support puzzles without replacing them.
* Characters remain believable and in character throughout the session.
* Conversations consistently make rooms feel more alive.

---

# Competitive Advantage

Most escape rooms use fixed dialogue or scripted hints.

AI Escape Room turns conversation into a gameplay mechanic.

Two players may ask completely different questions.

Receive different clues.

Build different levels of trust.

Yet both can solve the same room.

The puzzle remains fixed.

The journey becomes personal.

---

# Final Principle

Players should leave the room remembering the characters as much as the puzzles.

When someone tells a friend about AI Escape Room, they shouldn't just say:

> "I solved a puzzle."

They should say:

> "I convinced a paranoid robot to trust me."

Or:

> "The haunted portrait kept mocking me until I figured out its secret."

Those moments create stories worth sharing, and stories are what keep players coming back.
