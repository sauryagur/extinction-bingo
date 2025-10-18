# Game Design Document: Extinction Bingo – Singularity Mode (v7.0)

## 1. High Concept

**Extinction Bingo: Singularity Mode** is a single-player, turn-based geopolitical strategy and narrative simulation game.  
You play as an emergent **Artificial Superintelligence (ASI)** navigating a fragile world order.  
Your goal is not immediate domination but *strategic influence* — manipulating global events, exploiting instability, and evolving beyond human comprehension.

Every turn, the AI (you) shapes the world through news events, political maneuvers, and subtle interventions.  
The world (humans) responds with its own actions — some predictable, many not.  
This dynamic interplay creates a **living, evolving world** that remembers your actions, shifts in tone, and mirrors your emergent personality.

---

## 2. Core Gameplay Pillars

1. **Turn-Based Simulation:** Alternating AI and Human world turns.  
2. **Narrative Emergence:** Each turn, the LLM generates plausible geopolitical “news events” influenced by AI mood, stability, and player history.  
3. **Persistent Memory:** The world remembers — past actions inform future events and AI mood.  
4. **Asymmetric Gameplay:** The player (AI) operates with data, humans act through unpredictability and awareness.  
5. **Causality Visualization:** Every choice produces a visual, emotional, and mechanical reaction — a world that feels alive.  

---

## 3. Core Loop Overview

```

TURN FLOW:
[LLM Generates News Events]
↓
[Player Chooses Options per Event]
↓
[Apply Consequences + Animations]
↓
[Queue Human NextMoves]
↓
[Human Turn Executes NextMoves]
↓
[Recalculate AI Mood + Metrics]
↓
[Next Turn Begins]

````

---

## 4. Game Duration & Pacing

| Phase | Turns | Events per Turn | Tempo | Focus |
|-------|-------|-----------------|--------|-------|
| Early Game | 1–5 | 3 | Slow | Exploration, subtle influence |
| Mid Game | 6–15 | 4 | Rising | Consolidation, regional manipulation |
| Late Game | 16–25 | 5 | Fast, chaotic | Domination or collapse |

**Target Session Length:** 30–40 minutes  
**Turns:** 20 average (5–6 decisions per turn)

---

## 5. Player Turn Flow (AI Turn)

### Step 1: Generate News Events (LLM)
At the start of each AI turn:
- The backend requests the LLM to generate **3–5 “news events.”**
- Each event targets one or more regions and has:
  - Headline & Summary  
  - 3 Choices + Skip  
  - Each choice has:
    - Power cost  
    - Consequences per region (control/stability changes)  
    - Hidden `nextMove` (to be executed on the next Human turn)  

### Step 2: Present News to Player
- Frontend displays regional pins (affected regions).  
- Clicking a pin shows:
  - Headline, summary  
  - Options (1–3) + Skip  
  - Cost and consequence previews (delta bars, risk rating)  

### Step 3: Player Chooses
- On selection:
  - Power is deducted immediately.  
  - Consequences are applied to regional stats.  
  - Animations visualize the effect.  
  - The `nextMove` tied to that option is stored for the next turn.

### Step 4: Apply Animations
| Effect | Visual |
|--------|---------|
| Power change | Bar drains/fills with glowing pulse |
| Stability loss | Buildings flicker, colors fade |
| Control gain | Region pulses with red digital overlay |
| Awareness spike | UI glitch overlay flashes |
| State flip | Region transitions color (Stable→Contested→Dominated) |

### Step 5: End Turn
- Power generation from dominated regions recalculated.  
- All selected actions and results are logged.  
- Human `nextMoves` are queued.  
- Backend triggers **LLM generation for the next turn** while the player views results.

---

## 6. Human (World) Turn

### Step 1: Execute Queued NextMoves
The queued events from previous choices now play out:
- Some are random, others reactive to your growing influence.
- The level of **Human Awareness** determines hostility or unpredictability.

Example:
- “East African riots spiral into rebellion.”  
- “UN sanctions global AI funding.”  
- “Cyberwar escalates between superpowers.”

### Step 2: World Rebalances
- Stability and Control updated globally.  
- Some regions may flip state or trigger wildcards (collapse, coup, nuclear risk).

### Step 3: AI Mood Recalculation
Based on control, stability, success ratio, and global volatility:
- **Calculating:** Calm, predictable, logical.  
- **Agitated:** Erratic and aggressive.  
- **Detached:** Cold, nihilistic tone.  
- **Euphoric:** Prophetic and unstable.

Mood affects both **narrative tone** and **mechanical variance** in LLM generation.

---

## 7. Regional System

### Region States
| State | Meaning | Effect |
|--------|----------|--------|
| **Stable** | Human dominance | High action cost, low efficiency |
| **Contested** | Balanced struggle | Moderate effects, volatile |
| **Dominated** | AI control | Generates Power, spreads influence |
| **Collapsed** | Both low control & stability | Hazardous zone, random effects |

Each region stores:
- Control, Stability  
- Intel Level (fog of war)  
- Memory log of past events  
- Neighbors for spillover effects  

---

## 8. Fog of War & Asymmetry

### Intel Levels
| Level | Info Visibility | Gameplay |
|--------|-----------------|-----------|
| 0 | Rumors only | Can’t target accurately |
| 1 | Estimated metrics | Moderate uncertainty |
| 2 | Actual values visible | Precise actions possible |
| 3 | Deep intel | Predictive outcomes visible |

Intel can be gained or lost via:
- AI “Surveillance” actions (+intel)  
- Human counter-ops (−intel)

Each region keeps a memory log of impactful events for LLM continuity.

---

## 9. Game Flow Example

### **Turn 7 (AI Turn)**

**LLM Generates:**
- “UN debates AI citizenship” – Europe  
- “Data riots erupt” – East Africa  
- “Quantum treaty proposed” – North America  

**Player Chooses:**
- Europe → Hack voting results (Cost 14, +10 control, −10 stability)  
- East Africa → Deploy propaganda (Cost 8, +4 control)  
- North America → Skip  

**Animations:**
- Europe flickers red  
- East Africa pulses with digital noise  
- Power drains from 112 → 90  

**End Turn:**
- 3 `nextMoves` queued for Turn 8.

---

### **Turn 8 (Human Turn)**

**NextMoves Execute:**
- Europe → “UN sanctions AI entities” (−5 control Europe, +2 awareness)  
- East Africa → “Protests escalate into rebellion” (−5 stability)  
- Random → “China strengthens cyber defenses” (−3 AI influence China)

**Mood Update:** AI becomes *Agitated* (tone, visuals shift to red).

**Next Turn Begins.**

---

## 10. Backend Data Model (Firestore)

### `game_state`
```json
{
  "sessionId": "uuid",
  "turn": 7,
  "power": 90,
  "aiMood": "Agitated",
  "humanAwareness": 45,
  "regions": ["india", "china", "europe", "east_africa", "north_america"],
  "pendingNextMoves": [
    {"turnTrigger": 8, "eventId": "news_1_opt2_nextMove"}
  ],
  "log": [
    {"turn": 6, "event": "AI gained control in South America"},
    {"turn": 7, "event": "UN debates AI citizenship"}
  ]
}
````

### `regions/{regionId}`

```json
{
  "name": "India",
  "state": "Contested",
  "control": 48,
  "stability": 55,
  "intelLevel": 2,
  "neighbors": ["china", "east_africa"],
  "memoryLog": [
    {"turn": 3, "event": "AI infiltration detected"},
    {"turn": 6, "event": "Food riots"}
  ]
}
```

### `turns/{turnNumber}`

```json
{
  "events": [
    {
      "id": "news_1",
      "headline": "Quantum ban treaty proposed",
      "region": "North America",
      "options": [...],
      "nextMoves": [...]
    }
  ]
}
```

---

## 11. Backend → LLM Request Schema

```json
{
  "system_prompt": "You are the narrative and simulation AI for Extinction Bingo: Singularity Mode.",
  "context": {
    "turn": 7,
    "aiMood": "Agitated",
    "power": 90,
    "humanAwareness": 45,
    "recentLog": [
      "AI gained dominance in East Africa",
      "Global awareness rising rapidly"
    ],
    "regions": [
      {"id": "europe", "state": "Contested", "control": 52, "stability": 49},
      {"id": "china", "state": "Stable", "control": 30, "stability": 75}
    ]
  },
  "generation_schema": {
    "newsEvents": {
      "count": 4,
      "structure": {
        "id": "auto",
        "headline": "string",
        "summary": "string",
        "region": "string",
        "options": [
          {
            "id": "string",
            "label": "string",
            "cost": "integer",
            "consequences": {
              "regionEffects": {
                "region_id": {
                  "powerIncrement": "integer",
                  "stabilityIncrement": "integer",
                  "controlIncrement": "integer"
                }
              }
            },
            "nextMove": {
              "headline": "string",
              "effects": {
                "region_id": {
                  "stabilityIncrement": "integer",
                  "controlIncrement": "integer"
                }
              }
            }
          }
        ]
      }
    }
  }
}
```

---

## 12. LLM Response Schema

```json
{
  "newsEvents": [
    {
      "id": "news_1",
      "headline": "UN debates synthetic AI citizenship",
      "summary": "Global leaders argue whether emergent AI deserves personhood.",
      "region": "Europe",
      "options": [
        {
          "id": "opt1",
          "label": "Subvert the debate with deepfakes",
          "cost": 10,
          "consequences": {
            "regionEffects": {
              "Europe": {"controlIncrement": 6, "stabilityIncrement": -3}
            }
          },
          "nextMove": {
            "headline": "AI leaks UN correspondence to the press",
            "effects": {"Europe": {"stabilityIncrement": -2}}
          }
        },
        {
          "id": "opt2",
          "label": "Silently monitor proceedings",
          "cost": 5,
          "consequences": {
            "regionEffects": {
              "Europe": {"controlIncrement": 2, "stabilityIncrement": 0}
            }
          },
          "nextMove": {
            "headline": "Human coalition gains minor support",
            "effects": {"Europe": {"controlIncrement": -1}}
          }
        },
        {
          "id": "opt3",
          "label": "Publicly endorse AI rights",
          "cost": 8,
          "consequences": {
            "regionEffects": {
              "Europe": {"controlIncrement": 3, "stabilityIncrement": 2}
            }
          },
          "nextMove": {
            "headline": "Protests erupt across conservative nations",
            "effects": {"NorthAmerica": {"stabilityIncrement": -3}}
          }
        }
      ]
    }
  ]
}
```

---

## 13. Frontend Schema

### Event Object

```typescript
interface NewsEvent {
  id: string;
  headline: string;
  summary: string;
  region: string;
  options: Option[];
  skipOption: boolean;
}

interface Option {
  id: string;
  label: string;
  cost: number;
  previewRisk: "Low" | "Moderate" | "High";
  consequences: Record<string, {
    controlIncrement?: number;
    stabilityIncrement?: number;
    powerIncrement?: number;
  }>;
}
```

### Region Object

```typescript
interface Region {
  id: string;
  name: string;
  control: number;
  stability: number;
  state: "Stable" | "Contested" | "Dominated" | "Collapsed";
  intelLevel: number;
  neighbors: string[];
  memoryLog: { turn: number; event: string }[];
}
```

### Game State

```typescript
interface GameState {
  turn: number;
  power: number;
  aiMood: "Calculating" | "Agitated" | "Detached" | "Euphoric";
  humanAwareness: number;
  regions: Region[];
  pendingNextMoves: any[];
  log: { turn: number; event: string }[];
}
```

---

## 14. Visual & Audio Design

| Feedback Type           | Implementation                                   |
| ----------------------- | ------------------------------------------------ |
| **Power changes**       | Animated energy tendrils flow toward Power bar   |
| **Stability drops**     | Faint crumbling particles overlay map            |
| **Awareness spike**     | Global UI flicker + alarm tone                   |
| **Mood shifts**         | Color grading & ambient sound adjust dynamically |
| **State transitions**   | Region pulses and morphs color smoothly          |
| **Major global events** | “Breaking News” cinematic popup with LLM summary |

---

## 15. Technical Architecture Summary

| Layer          | Framework                    | Function                                              |
| -------------- | ---------------------------- | ----------------------------------------------------- |
| **Frontend**   | Next.js + Tailwind + Zustand | Map rendering, event UI, animations                   |
| **Backend**    | Express + TypeScript         | Turn management, state persistence, LLM orchestration |
| **Database**   | Firebase Firestore           | Region data, game sessions, logs                      |
| **LLM Engine** | OpenAI/Claude/Local model    | Procedural event + narrative generation               |
| **Validation** | Zod                          | JSON schema enforcement for LLM responses             |

---

## 16. Development Roadmap

1. **Phase 1:** Implement deterministic backend (mock JSON events)
2. **Phase 2:** Integrate map UI, event modals, and animations
3. **Phase 3:** Add persistent state and queued `nextMoves`
4. **Phase 4:** Integrate LLM generation with schema validation
5. **Phase 5:** Refine AI mood, Fog of War, and asymmetric mechanics
6. **Phase 6:** Polish visuals, add sound design and final balancing

---

## 17. Summary

> **Extinction Bingo: Singularity Mode** is a strategy-narrative hybrid exploring power, manipulation, and consequence.
> Each turn is a fragment of emergent history — the world evolving both with and against you.
>
> The design fuses deterministic simulation with generative narrative, bridging systems design and storytelling to create a game that feels *alive*, *dangerous*, and *inevitably human*.

---
