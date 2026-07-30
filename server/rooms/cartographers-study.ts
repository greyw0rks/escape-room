import type { Room } from "../types";

/**
 * "The Cartographer's Study" — the hand-authored seed room.
 *
 * Doubles as the fallback whenever AI generation fails validation, so it must
 * always be solvable. The chain is deliberately short and legible:
 *
 *   drawer (locked, needs letter-opener)  ->  ledger with dates
 *   globe (rotates)                       ->  latitude scratched inside
 *   ledger + globe                        ->  the safe's 4-digit code
 *   safe                                  ->  brass key -> door -> out
 *
 * Every puzzle has three clues, and the NPC (a parrot) can nudge but never solve.
 */
export const cartographersStudy: Room = {
  id: "cartographers-study",
  dayId: null,
  title: "The Cartographer's Study",
  theme: "A map-maker's locked office, late at night",
  intro:
    "The door clicks shut behind you. Oil lamps light a room crowded with maps, half-drawn coastlines and instruments you don't recognise. Somewhere a clock is ticking. The cartographer left in a hurry — and locked the way out behind her.",
  difficulty: "beginner",
  timeLimitSec: 480, // 8 minutes — doc 9's beginner band
  escapePuzzleId: "open-door",
  outro:
    "The lock turns. Cold air spills in from the hallway, smelling of rain and ink. On the desk behind you, the parrot ruffles once and goes quiet. You were never meant to find the way out this fast.",

  objects: [
    {
      id: "desk",
      name: "Writing desk",
      description:
        "A heavy oak desk buried under half-finished maps. One drawer sits slightly proud of the frame, as if something inside is stopping it closing.",
      descriptionAfter:
        "The desk drawer hangs open, the ledger gone from inside it.",
      state: "visible",
      actions: ["inspect", "open", "pull"],
      reveals: ["drawer"],
    },
    {
      id: "drawer",
      name: "Locked drawer",
      description:
        "The drawer is locked, but the lock is a cheap one — the gap at the top is wide enough to slide something thin into.",
      descriptionAfter: "The drawer stands open and empty.",
      state: "hidden",
      actions: ["inspect", "open", "unlock", "use"],
      requiresItem: "letter-opener",
      yields: ["ledger"],
      solvesPuzzle: "open-drawer",
    },
    {
      id: "letter-tray",
      name: "Letter tray",
      description:
        "A wire tray stacked with unopened correspondence. A brass letter-opener lies across the top, its handle shaped like a ship's prow.",
      descriptionAfter: "The tray of letters sits undisturbed. The opener is gone.",
      state: "visible",
      actions: ["inspect", "read", "take"],
      yields: ["letter-opener"],
    },
    {
      id: "globe",
      name: "Standing globe",
      description:
        "A tall brass-mounted globe, taller than it looks useful. It turns freely on its axis — someone has spun it often enough to wear the varnish at the equator.",
      descriptionAfter:
        "The globe has been turned right around. Scratched into the brass meridian, hidden until now, is a number: 47.",
      state: "visible",
      actions: ["inspect", "rotate", "push", "turn_on"],
      solvesPuzzle: "read-globe",
    },
    {
      id: "wall-map",
      name: "Wall map",
      description:
        "An enormous chart of a coastline you don't recognise, pinned at all four corners. Someone has circled a harbour in red ink and written beside it: 'she sailed on the 12th'.",
      state: "visible",
      actions: ["inspect", "read", "move"],
      redHerring: true,
    },
    {
      id: "safe",
      name: "Wall safe",
      description:
        "Set into the wall behind the map stand, a small iron safe with four numbered dials. Scratched above them, almost worn away: 'LATITUDE, THEN THE DAY SHE SAILED.'",
      descriptionAfter:
        "The safe hangs open. Inside, on a square of felt, sits a brass key.",
      state: "visible",
      actions: ["inspect", "open", "unlock", "insert", "press"],
      acceptsCode: "4712",
      solvesPuzzle: "crack-safe",
      requiresPuzzle: "read-globe",
      yields: ["brass-key"],
    },
    {
      id: "door",
      name: "Study door",
      description:
        "Solid oak, no handle on this side — just a keyhole, and a draught underneath that smells like the hallway you came from.",
      descriptionAfter: "The door stands open.",
      state: "visible",
      actions: ["inspect", "open", "unlock", "use", "push", "pull"],
      requiresItem: "brass-key",
      solvesPuzzle: "open-door",
    },
    {
      id: "parrot",
      name: "Grey parrot",
      description:
        "A grey parrot on a brass perch, watching you with one eye and then the other. It has clearly heard everything that has ever been said in this room.",
      state: "visible",
      actions: ["inspect", "talk", "listen"],
    },
  ],

  items: [
    {
      id: "letter-opener",
      name: "Brass letter-opener",
      description:
        "Thin, flat and stronger than it looks. The kind of thing that opens more than letters.",
      category: "tool",
    },
    {
      id: "ledger",
      name: "Sailing ledger",
      description: "A water-stained ledger of departures, kept in a careful hand.",
      category: "info",
      readableText:
        "Departures, this season:\n  the Wren — the 3rd\n  the Cormorant — the 12th\n  the Petrel — the 20th\n\nBeneath, underlined twice: 'SHE sailed on the Cormorant.'",
    },
    {
      id: "brass-key",
      name: "Brass key",
      description: "Small, cold, and shaped for a keyhole you have already seen.",
      category: "key",
    },
  ],

  combinations: [],

  puzzles: [
    {
      id: "open-drawer",
      name: "The locked drawer",
      objective: "Get the drawer open and find what's inside.",
      state: "discovered",
      dependsOn: [],
      solution: "letter-opener",
      yieldsItems: ["ledger"],
      clues: [
        {
          id: "c1",
          sourceId: "desk",
          role: "primary",
          text: "One drawer sits slightly proud — something inside is stopping it closing.",
        },
        {
          id: "c2",
          sourceId: "drawer",
          role: "supporting",
          text: "The lock is cheap, and the gap at the top is wide enough for something thin.",
        },
        {
          id: "c3",
          sourceId: "letter-tray",
          role: "confirmation",
          text: "A flat brass letter-opener lies across the letter tray.",
        },
      ],
      hints: [
        "You haven't looked at everything on the desk yet.",
        "The drawer's lock is cheap. The gap at the top is the weak point.",
        "Something thin and flat would slide into that gap. Have you seen anything like that in here?",
        "The letter tray holds more than letters. Its opener is flat, brass and strong.",
        "Use the brass letter-opener on the locked drawer.",
      ],
    },
    {
      id: "read-globe",
      name: "The globe's secret",
      objective: "Find what the cartographer scratched into the globe.",
      state: "discovered",
      dependsOn: [],
      solution: "rotate",
      clues: [
        {
          id: "c4",
          sourceId: "globe",
          role: "primary",
          text: "The varnish is worn at the equator — someone turns this globe often.",
        },
        {
          id: "c5",
          sourceId: "safe",
          role: "supporting",
          text: "The safe asks for a latitude, and a latitude is a number you read off a globe.",
        },
        {
          id: "c6",
          sourceId: "parrot",
          role: "confirmation",
          text: "The parrot mimics a creaking, turning sound whenever you go near the globe.",
        },
      ],
      hints: [
        "The globe is worn in a way that suggests it gets handled a lot.",
        "Things that turn are usually meant to be turned.",
        "The safe wants a latitude. Where in this room would a latitude be written?",
        "Turn the globe all the way round and look at the brass meridian ring, not the map.",
        "Rotate the globe. The number 47 is scratched into the meridian.",
      ],
    },
    {
      id: "crack-safe",
      name: "The wall safe",
      objective: "Work out the four-digit code and open the safe.",
      state: "hidden",
      dependsOn: ["open-drawer", "read-globe"],
      solution: "4712",
      yieldsItems: ["brass-key"],
      clues: [
        {
          id: "c7",
          sourceId: "safe",
          role: "primary",
          text: "Scratched above the dials: 'LATITUDE, THEN THE DAY SHE SAILED.'",
        },
        {
          id: "c8",
          sourceId: "globe",
          role: "supporting",
          text: "The globe's meridian carries the number 47.",
        },
        {
          id: "c9",
          sourceId: "ledger",
          role: "confirmation",
          text: "The ledger records that SHE sailed on the Cormorant — the 12th.",
        },
      ],
      hints: [
        "The safe tells you exactly what it wants. Read it again, slowly.",
        "It asks for two things in order: a latitude, then a date.",
        "You've seen a latitude on the globe. The date is in something you took from the drawer.",
        "The latitude is 47. The ledger says she sailed on the 12th. Two numbers, four digits, in that order.",
        "The code is 4712.",
      ],
    },
    {
      id: "open-door",
      name: "The way out",
      objective: "Unlock the study door and leave.",
      state: "hidden",
      dependsOn: ["crack-safe"],
      solution: "brass-key",
      clues: [
        {
          id: "c10",
          sourceId: "door",
          role: "primary",
          text: "No handle on this side — just a keyhole.",
        },
        {
          id: "c11",
          sourceId: "safe",
          role: "supporting",
          text: "A brass key sits on a square of felt inside the safe.",
        },
        {
          id: "c12",
          sourceId: "parrot",
          role: "confirmation",
          text: "The parrot says the cartographer always kept the key in the wall.",
        },
      ],
      hints: [
        "You have everything you need now.",
        "The door needs a key, and you've opened something that held one.",
        "The safe wasn't empty.",
        "Use the brass key from the safe on the study door.",
        "Unlock the study door with the brass key.",
      ],
    },
  ],

  npcs: [
    {
      id: "parrot",
      name: "The grey parrot",
      role: "The cartographer's parrot — repeats what it has overheard",
      personality:
        "Watchful and dry. Repeats fragments of old conversations rather than answering directly. Warms up considerably if treated kindly.",
      speakingStyle:
        "Short, clipped phrases. Often echoes the player's own words back at them. Occasionally squawks mid-sentence.",
      trust: "neutral",
      emotion: "confused",
      fallbackLines: [
        "\"Locked it herself,\" the parrot says. \"Locked it herself.\"",
        "The parrot shifts on its perch and says nothing.",
        "\"In the wall,\" it mutters. \"In the wall, in the wall.\"",
      ],
      knowledge: [
        {
          id: "k1",
          minTrust: "neutral",
          text: "The cartographer left in a hurry and locked the door behind her.",
        },
        {
          id: "k2",
          minTrust: "neutral",
          text: "She spun that globe every single evening before she left.",
        },
        {
          id: "k3",
          minTrust: "friendly",
          text: "She kept the key in the wall, not on her person. Always in the wall.",
        },
        {
          id: "k4",
          minTrust: "friendly",
          text: "She talked about a ship called the Cormorant more than any of the others.",
        },
        {
          id: "k5",
          minTrust: "helpful",
          text: "She used to say a position is worth nothing without a date to go with it.",
          requiresPuzzle: "read-globe",
        },
        // Never disclosable at any trust level — this is the anti-cheat boundary.
        { id: "k6", minTrust: "loyal", forbidden: true, text: "The safe code is 4712." },
      ],
    },
  ],
};
