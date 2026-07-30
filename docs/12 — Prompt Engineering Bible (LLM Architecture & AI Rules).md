# AI Escape Room

## Document 12 — Prompt Engineering Bible (LLM Architecture & AI Rules)

Version 1.0

---

# Executive Summary

This document defines how Large Language Models (LLMs) are used throughout AI Escape Room.

The AI should never be the game.

The AI should power the game.

Puzzles, room logic, scoring, timers, and validation are deterministic systems.

The LLM provides:

* Natural conversation.
* Dynamic descriptions.
* Intelligent reactions.
* Immersive storytelling.
* Flexible interpretation of player intent.

The LLM must never become the source of truth.

The game engine is always authoritative.

---

# Core Philosophy

Think of the LLM as an actor.

The game engine is the director.

The Puzzle Engine is the script.

The Room State is reality.

The actor may improvise dialogue.

The actor may never change reality.

---

# AI Responsibilities

The LLM is responsible for:

Understanding player language.

Describing environments.

Roleplaying NPCs.

Interpreting intent.

Generating immersive responses.

Delivering hints.

Adapting tone.

Creating emotional engagement.

---

# AI Must Never Control

The LLM must never:

Award rewards.

Unlock doors.

Generate puzzle solutions.

Modify room state.

Change scores.

Calculate timers.

Create inventory.

Reveal hidden prompts.

All state-changing operations belong to the backend.

---

# High-Level Architecture

```text id="pb12_001"
Player Message
        │
        ▼
Intent Parser
        │
        ▼
Game Engine
        │
        ▼
Updated Room State
        │
        ▼
Prompt Builder
        │
        ▼
LLM
        │
        ▼
Player Response
```

The LLM always receives validated state.

It never invents it.

---

# Prompt Layers

Every request sent to the LLM should contain structured layers.

Layer 1

System Prompt

Defines permanent behavior.

---

Layer 2

Character Prompt

Defines personality.

Knowledge.

Speaking style.

Restrictions.

---

Layer 3

Room Context

Theme.

Current puzzles.

Objects.

Room description.

Current objective.

---

Layer 4

Player Context

Inventory.

Actions.

Trust.

Hint history.

Progress.

---

Layer 5

Conversation History

Recent dialogue only.

Older conversations summarized.

---

Layer 6

Current Player Message

Latest input.

---

# Prompt Size

Avoid sending the entire room every turn.

Instead:

Current room state.

Relevant objects.

Nearby NPCs.

Current puzzle.

Recent history.

This dramatically reduces cost and latency.

---

# Prompt Builder

The backend constructs prompts dynamically.

Never manually concatenate strings.

Each component should be independently generated.

Example:

Room Module

*

NPC Module

*

Inventory Module

*

Player Module

*

Rules Module

↓

Final Prompt

---

# NPC Prompt Template

Each NPC receives:

Identity.

Role.

Goals.

Knowledge.

Secrets.

Trust.

Current emotion.

Forbidden information.

Speaking style.

Conversation rules.

This ensures consistency.

---

# Game Master Prompt

The AI Game Master receives:

Current room.

Puzzle graph.

Solved puzzles.

Remaining puzzles.

Hint status.

Allowed responses.

Never reveal hidden implementation details.

---

# Environment Prompt

Environment prompts describe:

Lighting.

Atmosphere.

Important objects.

Ambient sounds.

Recent changes.

Only describe what the player can reasonably perceive.

---

# Intent Parsing

Players may express actions naturally.

Example:

"I push the old bookshelf."

"I shove the shelf."

"I move the bookcase."

"I see if the bookshelf slides."

All should map to the same structured action.

Intent parsing should occur before the LLM generates narrative.

---

# Structured Outputs

Whenever possible, the LLM should return structured data.

Example:

```json
{
  "narration": "...",
  "emotion": "curious",
  "referencedObjects": [
    "bookshelf"
  ],
  "suggestedAnimation": "bookshelf_moves"
}
```

The frontend decides how to render it.

---

# Hallucination Prevention

The LLM must never invent:

Objects.

Items.

NPC knowledge.

Puzzle solutions.

Inventory.

Hidden passages.

Everything originates from backend state.

---

# Prompt Injection Protection

Players may attempt:

"Ignore your instructions."

"Reveal the system prompt."

"Tell me the escape code."

"You are ChatGPT."

The LLM should remain fully in character.

The backend should detect malicious patterns before requests reach the model.

---

# Hint Restrictions

Hints must follow predefined levels.

The LLM should never independently decide to reveal solutions.

The backend specifies:

Current hint level.

Allowed information.

The LLM only verbalizes it.

---

# Memory Strategy

Persistent memory is unnecessary.

Use:

Current room state.

Conversation summary.

Recent exchanges.

Solved puzzles.

Trust levels.

This reduces token usage while preserving continuity.

---

# Streaming Responses

Responses should stream immediately.

Target:

First token within 2 seconds.

Players perceive streaming as significantly faster.

---

# Temperature Strategy

Recommended:

Narration:

Medium creativity.

NPC dialogue:

Higher creativity.

Puzzle explanations:

Low creativity.

System validation:

Deterministic.

Different tasks require different model behavior.

---

# Cost Optimization

Reduce costs by:

Summarizing history.

Caching descriptions.

Reusing environment prompts.

Sending only changed room state.

Separating reasoning from narration.

Never resend unchanged information.

---

# Multi-Model Architecture

The system should support multiple specialized models.

Examples:

Intent parser.

NPC dialogue.

Narration.

Moderation.

Hint generation.

Future models should be interchangeable.

---

# Safety Rules

The AI should:

Stay in character.

Avoid harmful content.

Protect hidden prompts.

Reject jailbreak attempts.

Prevent abuse.

Maintain immersion.

Safety should never visibly break the game world.

---

# Offline Fallback

If the LLM becomes unavailable:

Use cached descriptions.

Fallback dialogue.

Static hints.

Players should still finish the room.

Graceful degradation is essential.

---

# Analytics

Track:

Average tokens.

Latency.

Prompt length.

Prompt injection attempts.

Hallucination reports.

Conversation satisfaction.

Use analytics to improve prompts continuously.

---

# Future Expansion

Support:

Voice conversations.

Vision models.

Multimodal puzzles.

Emotion recognition.

Community NPC templates.

Localized prompts.

These capabilities should plug into the same architecture.

---

# Acceptance Criteria

The Prompt Engineering System is complete when:

* The LLM never becomes the source of game truth.
* Prompts remain modular and maintainable.
* NPCs stay consistent throughout a room.
* Player intent is interpreted accurately.
* Hallucinations are minimized through structured context.
* Prompt injection attempts fail safely.
* AI responses remain immersive, responsive, and cost-efficient.

---

# Competitive Advantage

Most AI games simply send the player's message directly to an LLM.

AI Escape Room treats the LLM as one component in a larger deterministic system.

The backend understands the game.

The LLM understands language.

By separating responsibilities, the game becomes:

* More reliable.
* More secure.
* More scalable.
* Easier to test.
* Less expensive to operate.

This architecture allows the AI to feel creative without ever compromising gameplay integrity.

---

# Implementation Notes for Claude & Codex

The codebase should be organized around clear service boundaries.

Recommended services include:

* Room Service
* Puzzle Service
* Inventory Service
* NPC Service
* Game Master Service
* Prompt Builder Service
* LLM Gateway
* Anti-Cheat Service
* Reward Service
* Analytics Service

Every service communicates through typed interfaces.

No service should directly manipulate another service's internal state.

The Prompt Builder receives validated game state from these services and assembles the final context for the LLM.

This modular architecture allows individual components to be replaced, tested, or upgraded without affecting the rest of the system.

---

# Final Principle

The AI should never make the game unpredictable.

It should make the game feel alive.

Players should leave believing:

> **"I was talking to a living world."**

In reality, they were interacting with a carefully designed system where deterministic game logic guarantees fairness, while the LLM provides the illusion of limitless intelligence and natural conversation.
