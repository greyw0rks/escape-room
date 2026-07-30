# AI Escape Room

## Document 13 — Mini App Architecture & Technical Blueprint

Version 1.0

---

# Executive Summary

This document defines the complete technical architecture for the **Mini App MVP**.

The objective is not to build a massive MMO.

The objective is to build a lightweight, scalable, and responsive Mini App capable of serving thousands of concurrent players while remaining inexpensive to operate.

The architecture should be:

* Modular
* Server authoritative
* AI-first
* Mobile optimized
* Crypto-native
* Cloud scalable

Everything should be designed so additional features can be added later without major rewrites.

---

# Core Philosophy

The client renders.

The backend decides.

The AI narrates.

The blockchain settles value.

No game-critical logic should depend on the frontend.

---

# MVP Tech Stack

## Frontend

Recommended:

* Next.js
* React
* TypeScript
* Tailwind CSS
* Framer Motion
* Zustand (state management)

Alternative:

* React Native (future mobile app)

---

## Backend

Recommended:

* Node.js
* NestJS (preferred)
* TypeScript

Why NestJS?

* Modular architecture
* Dependency injection
* Easy testing
* Scales well
* Excellent WebSocket support

---

## Database

Recommended:

PostgreSQL

Use for:

* Accounts
* Rooms
* Leaderboards
* Scores
* Seasons
* Analytics
* Rewards

---

## Cache

Redis

Use for:

* Session storage
* Room state
* Rate limiting
* Matchmaking
* Temporary AI memory
* Daily challenges

Redis dramatically reduces latency.

---

## AI Layer

Separate AI Gateway Service.

Supported providers:

OpenAI

Anthropic

Google Gemini

Local models (future)

Never tightly couple the codebase to one provider.

---

## Blockchain

Abstract blockchain interactions.

Supported through adapters.

Example:

Wallet Adapter

↓

Reward Adapter

↓

Tournament Adapter

↓

Treasury Adapter

Switching chains should require minimal code changes.

---

# High-Level System

```text id="arch13_001"
Frontend
      │
      ▼
API Gateway
      │
      ▼
Authentication
      │
      ▼
Game Service
      │
      ├──────── Puzzle Service
      │
      ├──────── NPC Service
      │
      ├──────── Inventory Service
      │
      ├──────── Hint Service
      │
      ├──────── Room Service
      │
      ├──────── Leaderboard Service
      │
      ├──────── Reward Service
      │
      └──────── AI Gateway
```

Every service owns its own responsibility.

---

# Backend Services

## Authentication Service

Responsibilities:

Wallet login.

Guest login.

Session management.

JWT generation.

---

## Room Service

Creates rooms.

Loads room state.

Tracks progression.

Validates completion.

---

## Puzzle Service

Runs puzzle logic.

Checks dependencies.

Validates solutions.

Calculates progress.

---

## Inventory Service

Tracks:

Collected items.

Usage.

Combinations.

Persistence.

---

## NPC Service

Maintains:

NPC memory.

Trust.

Emotion.

Dialogue context.

---

## Hint Service

Controls:

Hint levels.

Penalties.

Timing.

Adaptive guidance.

---

## AI Gateway

Responsibilities:

Prompt building.

Provider routing.

Streaming.

Caching.

Moderation.

Retries.

Never expose API keys to clients.

---

## Reward Service

Handles:

Prize calculation.

Distribution.

Tournament payouts.

Season rewards.

---

## Leaderboard Service

Tracks:

Daily rankings.

Weekly rankings.

Season rankings.

Friend rankings.

Ghost replays.

---

## Analytics Service

Collect:

Room completion.

Hint usage.

Drop-off.

Latency.

Revenue.

Retention.

Future balancing depends on analytics.

---

# Frontend Structure

Recommended folders:

```text id="arch13_002"
app/

components/

hooks/

stores/

services/

lib/

types/

styles/

assets/
```

Keep business logic out of UI components.

---

# State Management

Use Zustand.

Separate stores:

Player Store

Room Store

Inventory Store

Leaderboard Store

Wallet Store

Settings Store

Avoid one giant global store.

---

# API Design

Prefer REST for:

Authentication.

Leaderboards.

Rewards.

Rooms.

Use WebSockets for:

Streaming AI.

Live timers.

Leaderboard updates.

Tournament events.

---

# Streaming

Player sends message.

↓

Backend validates.

↓

LLM streams.

↓

Frontend renders progressively.

Streaming dramatically improves perceived responsiveness.

---

# Database Schema

Core tables:

Users

Wallets

Rooms

RoomSessions

Puzzles

NPCs

InventoryItems

Scores

Rewards

Achievements

Leaderboards

Seasons

AnalyticsEvents

PromptLogs

Design with future migrations in mind.

---

# Room Session

Every session stores:

Room ID.

Player ID.

Puzzle state.

Inventory.

Hints used.

Timer.

Completion.

Replay data.

This enables reconnecting after network interruptions.

---

# Security

Never trust the frontend.

Validate:

Scores.

Puzzle completion.

Rewards.

Timers.

Wallet ownership.

Everything important is server-side.

---

# Anti-Abuse

Rate limiting.

Session validation.

Replay verification.

Prompt injection filtering.

Wallet cooldowns.

API throttling.

Behavior analysis.

Security should be layered.

---

# Performance Targets

Room loading:

< 2 seconds

Player interaction:

< 100 ms feedback

AI response begins:

< 2 seconds

Leaderboard refresh:

Near real time

Wallet actions:

As fast as network allows

---

# Scalability

The architecture should scale horizontally.

Stateless backend.

Redis sessions.

Shared database.

Object storage for assets.

Multiple AI workers.

Load balancer.

No component should require sticky sessions.

---

# Logging

Every request should include:

Request ID.

Player ID.

Room ID.

Session ID.

Latency.

Errors.

AI Provider.

Logs simplify debugging.

---

# Deployment

Recommended:

Frontend

Vercel

Backend

Railway, Fly.io, Render, or AWS

Database

Managed PostgreSQL

Redis

Managed Redis

Object Storage

Cloudflare R2 or S3

Keep deployment simple for the MVP.

---

# Monitoring

Use:

Sentry

OpenTelemetry

Grafana (future)

Track:

Errors.

Latency.

AI failures.

Database health.

Reward failures.

---

# Testing Strategy

Unit Tests

Puzzle logic.

Inventory.

Scoring.

Integration Tests

Room generation.

Reward flow.

Wallet login.

End-to-End Tests

Complete room.

Crypto reward.

Leaderboard updates.

Testing should prioritize game logic over UI.

---

# CI/CD

Every pull request should:

Run tests.

Check types.

Lint code.

Build successfully.

Deploy preview.

Main branch should always remain deployable.

---

# Future Expansion

The architecture should support:

Native mobile apps.

Multiplayer.

Voice AI.

User-generated rooms.

Creator marketplace.

Regional servers.

Cross-game economy.

These additions should not require rebuilding the core.

---

# Acceptance Criteria

The MVP architecture is complete when:

* The frontend remains lightweight and responsive.
* The backend owns all game logic.
* AI providers are interchangeable.
* Blockchain integration is abstracted.
* Services remain modular.
* Players can reconnect without losing progress.
* The system can scale beyond the first thousand users.

---

# Competitive Advantage

Many AI games tightly couple the frontend, AI model, and game logic.

AI Escape Room separates responsibilities.

This provides:

* Better security.
* Easier maintenance.
* Lower AI costs.
* Faster iteration.
* Easier blockchain integration.
* Better scalability.

The result is an architecture that feels simple to the player while remaining robust behind the scenes.

---

# Roadmap Alignment

This document intentionally defines **only what is required for the Mini App launch**.

Future startup-scale features—including multiplayer synchronization, creator tools, custom room builders, AI marketplaces, advanced moderation, regional infrastructure, and enterprise analytics—should be implemented **only after** the Mini App demonstrates strong product-market fit.

The codebase should nevertheless be written with clean interfaces and modular boundaries so those features can be added without major architectural changes.

---

# Final Principle

Build the smallest architecture capable of supporting a world-class game.

Do not optimize for one million users before reaching one thousand.

A successful Mini App is one that players love enough to invite their friends to.

Scalability matters.

Fun matters more.
