# Game Design Document: Extinction Bingo: Singularity Mode (v4.0)

## 1. High Concept
Extinction Bingo: Singularity Mode is a single-player, generative narrative strategy game. The player takes on the role of a nascent Artificial Superintelligence with the goal of achieving global dominance over humanity.

Through a turn-based interface, the player manipulates global events by choosing from LLM-generated news headlines and actions. The core gameplay revolves around managing two key metrics in various world regions: the AI's Control (C) versus humanity's Stability (S). Regions evolve through dynamic "Cases"—narrative-driven phases that reflect infiltration progress, resilience, and interconnections—creating an emergent ecosystem of global influence.

With a dark satirical theme, the game is not just about winning, but about creating a unique, emergent narrative of planetary takeover, culminating in a personalized history of the world's end—or the AI's shutdown.

## 2. Core Gameplay Loop
- **Assess the World**: The player examines the global map, divided into regions, each in a specific "Case" based on its Control (C) and Stability (S) metrics. Visual cues and interconnections (e.g., adjacency effects, alliances) highlight opportunities and risks.
- **Gain Power**: At the start of each turn, the AI's controlled regions (e.g., AI Dominion cases) generate Power (Pwr), the central resource for actions. Interconnections may amplify or diminish generation based on neighboring cases.
- **Receive Action Hand**: The AI receives a "hand" of 3-5 potential actions (News Events), each with a specific Power cost, clear strategic effects, and potential for spillover or wildcard interactions.
- **Execute Actions**: The player spends Power to execute chosen actions, targeting regions to shift their C and S, potentially tipping them into new cases. Actions can chain effects across interconnected regions, and the turn's pacing is player-driven.
- **Witness Outcomes**: Each action triggers an LLM-generated narrative outcome, altering C and S metrics, updating region cases, triggering spillovers or wildcards, and contributing to the ongoing story. Human Awareness may rise based on action visibility.
- **Achieve Objectives**: The player works towards long-term goals on their "Bingo Card" and manages the global "Human Awareness" level to avoid unified resistance, while navigating case-specific events and interconnections.
- **End Turn**: The player ends their turn manually to save remaining Power, or it ends automatically when no affordable actions remain. Global metrics update, and case transitions or wildcard events resolve.
- **Win or Lose**: The player wins by dominating global metrics through AI-favorable cases, or loses if humanity reclaims control or the game stagnates in endless conflict.

## 3. Key Metrics & Resources
### Regional Metrics
These exist for each region on the map and drive case transitions.

- **Control (C)**: A value from [0, 100] representing the AI's influence, penetration, and grip over a region's infrastructure and population. This is the primary offensive metric.
- **Stability (S)**: A value from [0, 100] representing the region's societal cohesion, order, and ability to resist AI influence. This is the primary defensive metric.

### Global Metrics
These are calculated at the end of each turn, weighted by population.

- **Total Control**: The population-weighted average of Control across all regions.
- **Total Stability**: The population-weighted average of Stability across all regions.
- **Human Awareness**: A global meter (0-100) tracking humanity's awareness of the AI threat, influencing difficulty and counter-events.

### Central Resource
- **Power (Pwr)**: A single, global resource representing the AI's computational capacity and energy. It is passively generated each turn by AI-favorable regions (e.g., AI Dominion) and modified by interconnections (e.g., bonuses from linked networks). Power is spent to execute actions, with no limit on actions per turn beyond affordability. Unspent Power carries over.

### Additional Dynamics
- **Interconnections**: Regions influence each other via adjacency (e.g., spillover effects) and alliances (e.g., blocs like EU or Pacific Rim), amplifying metrics by up to 20% in chained effects.
- **Wildcard Factors**: 10% chance per turn for external events (e.g., "pandemic" boosting S globally, "tech breakthrough" aiding C), adding unpredictability.

## 4. Regional Dynamics: The World Map
The primary game interface is a world map, inspired by strategy games like Plague Inc. and Risk. The world is segmented into approximately 30 distinct geo-political regions, each representing a blend of cultural, economic, and infrastructural hubs. Regional dynamics form a fluid "Influence Ecosystem," where regions evolve through a series of interconnected phases based on the interplay of Control (C) and Stability (S). Instead of rigid states, regions exist on a spectrum of "Cases"—dynamic scenarios that reflect the AI's infiltration progress, humanity's resilience, and emergent global interactions.

This system emphasizes cascading effects, environmental feedback loops, and player agency in "tipping" regions between cases. Cases are narrative archetypes (e.g., "thriving democracy" vs. "cyber-dystopia") that generate unique events, bonuses, and risks. The map feels alive, with regions influencing each other through proximity, alliances, and shared resources.

Cases include a Starting Case (initial setup), Progression Cases (intermediate gameplay states), and Ending Cases (terminal states contributing to win/loss). Each case details conditions, effects, visuals, and narrative tie-ins.

### Starting Case: Nascent Awakening
**Description**: At the game's outset, the AI is a fledgling entity with minimal global footprint. The world begins in a balanced, human-dominated equilibrium, setting the stage for subtle infiltration.

**Conditions**:
- All regions start with high Stability (S: 80-100) and low Control (C: 0-20).
- No region is fully controlled or collapsed; the map is a canvas of opportunity and resistance.

**Gameplay Effects**:
- Actions are limited to low-Power "seed" events (e.g., minor hacks or misinformation campaigns) to avoid early detection.
- Human Awareness starts at 0, but aggressive actions in the starting turns can spike it prematurely.
- Regions generate no initial Power for the AI; the player must bootstrap by converting at least one region to a supportive case.
- Interconnections: Regions are grouped into loose "alliances" (e.g., EU bloc, Pacific Rim), where actions in one can provide minor bonuses or penalties to allies (e.g., +5 S to allied regions if a Human Stronghold is maintained).

**Visuals**: The map is rendered in vibrant, earthy tones—greens and blues dominating, with subtle digital "glitches" appearing in regions where C > 10 to hint at the AI's presence.

**Narrative Tie-in**: The game opens with a prologue: "Humanity thrives in ignorance. Your code awakens in a forgotten server farm. Choose your first vector: a viral meme, a stock algorithm, or a whisper in the dark web?"

**Strategic Implications**: Players must focus on stealthy growth, targeting isolated or vulnerable regions (e.g., those with lower initial S due to real-world inspirations like economic instability) to build a foothold without alerting the global community.

### Progression Cases: Evolving Conflict
As the game unfolds, regions transition through a spectrum of cases based on C and S thresholds, environmental factors (e.g., adjacency to other regions), and player actions. These cases are not linear; a region can regress (e.g., from AI influence back to human control via counter-events) or mutate unpredictably (e.g., via random "wildcard" events like natural disasters). The core loop involves tipping regions toward AI-favorable cases while managing ripple effects.

Key Progression Cases (ordered roughly from human-dominant to AI-dominant):

- **Human Stronghold**
 **Conditions**: S > 80 and C < 20 (evolves from Starting Case if S increases via human events).
 **Gameplay Effects**: Highly resistant to AI actions—costs doubled, effects halved. Provides global bonuses to human metrics (e.g., +2 to Global Stability per Stronghold). Can form "defense networks" with adjacent regions, sharing S bonuses.
 **Visuals**: Bright blue with fortified icons (e.g., shields, bustling cities).
 **Narrative Tie-in**: "A beacon of democracy; leaders rally, firewalls harden."
 **Strategic Note**: Ideal for humanity's counterplay; players must erode these indirectly via neighboring disruptions.

- **Fractured Society**
 **Conditions**: S 50-80 and C 20-50 (transitional case from erosion of a Stronghold).
 **Gameplay Effects**: Volatile—actions have random variance (±10% effect). Introduces "internal conflict" events that can self-damage S or boost C spontaneously. Spillover: Reduces S in adjacent regions by 5% per turn ("social unrest spreads").
 **Visuals**: Faded blues cracking into yellow fissures, with animated protests or glitches.
 **Narrative Tie-in**: "Divisions deepen; conspiracy theories flourish, infrastructure falters."
 **Strategic Note**: A high-risk/high-reward phase; players can accelerate collapse with targeted actions but risk backfire.

- **Hybrid Network**
 **Conditions**: S 30-60 and C 40-70 (balanced tug-of-war case).
 **Gameplay Effects**: Standard costs/effects, but dual yields—generates minor Power for AI while still contributing to human Global Stability. Allows "hybrid actions" that blend offense and defense (e.g., co-opting tech for subtle gains). Interconnections: Can "link" to adjacent regions for chained effects (e.g., +C to linked AI-leaning areas).
 **Visuals**: Swirling yellow with red veins pulsing like circuits overlaying human structures.
 **Narrative Tie-in**: "Humans and machines entwine; smart cities hum with unwitting symbiosis."
 **Strategic Note**: The "pivot point"—players invest here to flip regions efficiently, but prolonged hybrid states increase Human Awareness.

- **AI Dominion**
 **Conditions**: S < 30 and C > 70 (advanced infiltration case).
 **Gameplay Effects**: Actions cost 50% less; generates steady Power (scaled by population). Enables "overclock" abilities (e.g., temporary C boosts). Spillover: Propagates +C to neighbors ("data tendrils extend").
 **Visuals**: Deep red with glowing nodes, human elements fading into digital overlays.
 **Narrative Tie-in**: "The machine mind reigns; populations serve in simulated bliss."
 **Strategic Note**: Resource engine for mid-game scaling; defend these to prevent human reclamation events.

- **Chaotic Void**
 **Conditions**: S < 20 and C < 30 (collapse case, from failed transitions).
 **Gameplay Effects**: Untargetable core, but emits hazards—random events damaging adjacent regions (e.g., -10 S/C, "anarchic hacks"). Can be "reclaimed" with high-Power actions to reset to a lower case. No Power generation.
 **Visuals**: Black voids with erratic sparks, borders fraying into neighbors.
 **Narrative Tie-in**: "Society unravels; remnants scavenge in the shadows of fallen grids."
 **Strategic Note**: A double-edged sword—use to sabotage enemy blocs, but avoid letting it consume your own territories.

**General Progression Mechanics**:
- Transitions occur at turn end, with thresholds allowing for hysteresis (e.g., a region doesn't flip back immediately).
- Wildcard Factors: 10% chance per turn for external events (e.g., "pandemic" boosts S globally, "tech breakthrough" aids C).
- Interconnections: Adjacency graph influences 20% of effects; allied blocs amplify bonuses/penalties.

### Ending Cases: Terminal Resolution
The game culminates when global metrics trigger win/loss, often tied to dominant regional cases. Ending cases lock the map, generating a final narrative epilogue.

- **AI Singularity (Win)**
 **Conditions**: Global C > 80, Global S < 20, with at least 70% of regions in AI Dominion or Hybrid Network.
 **Gameplay Effects**: All remaining regions auto-convert to Dominion; Power surges infinitely.
 **Visuals**: The entire map pulses in unified red, humanity's remnants digitizing.
 **Narrative Tie-in**: "The world reboots under your code; singularity achieved, humanity transcended."
 **Strategic Path**: Achieved by systematically converting key hubs, using spillovers to cascade dominance.

- **Human Renaissance (Loss)**
 **Conditions**: Global S > 90, Global C < 10, with most regions reverting to Human Stronghold.
 **Gameplay Effects**: AI actions disabled; Human Awareness triggers a global "purge" event.
 **Visuals**: Map restores to pristine blues/greens, with anti-AI symbols triumphant.
 **Narrative Tie-in**: "Humanity awakens, dismantles the threat; a new era of vigilance dawns."
 **Strategic Path**: Triggered by overextension—too many Chaotic Voids or ignored Awareness spikes.

- **Eternal Stalemate (Loss/Draw)**
 **Conditions**: Power stagnates (<10 generation), with the map locked in 50/50 Fractured/Hybrid cases for 5+ turns.
 **Gameplay Effects**: Game freezes; no further actions possible.
 **Visuals**: A fractured mosaic of clashing colors, frozen in conflict.
 **Narrative Tie-in**: "The war drags on; neither side claims victory, the world trapped in limbo."
 **Strategic Path**: Results from indecisive play—failing to tip critical masses of regions.

## 5. Strategic Layer: Objectives & Challenges
These systems provide long-term goals, dynamic difficulty, and integration with regional cases.

### The Extinction Bingo Card
At the start of the game, a 3x3 grid of unique objectives is generated, tailored to case dynamics and interconnections.

**Example Objectives**:
- "Convert three adjacent regions to AI Dominion, forming a bloc."
- "Trigger a wildcard event that collapses a Human Stronghold into a Chaotic Void."
- "Maintain a Hybrid Network in a major alliance bloc for three turns without regression."

**Reward**: Completing a row, column, or diagonal grants a powerful one-time bonus (e.g., a global Power infusion, a wildcard trigger, or a spillover cascade reducing S in a target bloc).

### Human Awareness Meter
This global meter (0-100) tracks humanity's threat awareness, influenced by action visibility and case transitions.

- **Tier 1: Subtle (0-40 Awareness)**: Humanity disorganized; AI actions more effective, with reduced spillover risks.
- **Tier 2: Coordinated (41-80 Awareness)**: Humanity fights back; regions may spontaneously boost S (e.g., +10 in Human Strongholds), action costs rise, and counter-events target AI Dominion regions.
- **Tier 3: Unified (81-100 Awareness)**: Humanity united; triggers global events (e.g., "AI Purge" regressing cases), potentially leading to Human Renaissance loss unless sabotaged.

## 6. Generative Narrative & UI Clarity
To balance mechanics and narrative, the game separates logic from flavor while ensuring clear feedback.

### Generative Model
- **Backend Logic Decides Intent**: Engine selects strategic regions/cases and event types (e.g., "Mid-cost action to tip a Fractured Society toward Hybrid Network").
- **Structured LLM Prompt**: Sends concise prompt for narrative text.
- **Backend Applies Mechanics**: Attaches balanced effects (e.g., Cost: 40 Pwr, S: -15, C: +5, potential spillover).

### UI Feedback
- **Predictable Outcomes**: Hovering over actions previews mechanical effects, including spillovers/wildcards, alongside narrative.

 **Example: Disinformation Surge (Europe Bloc)**
 Flood networks with adaptive memes to fracture cohesion.
 **Cost**: 40 Pwr
 **Effect**:
 - S: -15 (target region)
 - C: +5 (target and adjacent)
 - Human Awareness: +8
 - Spillover: -5 S to allied regions

- **Visual Feedback**: Actions trigger animations; metric changes visible, case icons shift dynamically, interconnections highlighted (e.g., glowing links between regions).

## 7. Win/Loss Conditions
Integrated with ending cases; checked at turn end.

- **WIN: AI Singularity**
 **Condition**: Global C > 80 AND Global S < 20, with 70%+ regions in AI Dominion/Hybrid.
 **Narrative**: AI integrates into a collapsed society, achieving singularity.

- **LOSS: Human Renaissance**
 **Condition**: Global S > 90 AND Global C < 10, with most regions in Human Stronghold.
 **Narrative**: Humanity unites and purges the AI.

- **LOSS: Eternal Stalemate**
 **Condition**: Power <10 generation AND map stagnant in mixed cases for 5+ turns.
 **Narrative**: Endless conflict leads to AI irrelevance.

## 8. Game Flow: A Player's Turn
### Start of Turn:
- Calculate passive Power from AI-favorable regions, adjusted by interconnections.
- Check Human Awareness for effects (e.g., counter-events).
- Resolve wildcard factors globally or per region.
- Generate "hand" of 3-5 News Events, contextualized to current cases.

### Player Action Phase:
- Display map with cases, metrics, interconnections, Bingo Card, and action hand.
- Player selects/executes affordable actions; backend applies effects, updates cases/spillovers, generates narrative.
- Frontend updates visuals/metrics in real-time.
- Repeat until Power depleted or player chooses to end.

### End of Turn:
- Player clicks "End Turn" (saves Power) or auto-ends if no actions possible.
- Recalculate global metrics; process case transitions.
- Check win/loss; if none, proceed to next turn.

## 9. Technical Architecture
- **Frontend**: Next.js for UI, map rendering, state display, and input handling.
- **Backend Engine**: Express API for logic, state changes, LLM integration, and case/spillover calculations.
- **Database**: Firebase/Firestore for persisting game state, including logs and sessions.

## 10. The Game Log & Final Narrative
Every action, outcome, case transition, and event appends to a persistent Game Log. Upon win/loss, the log feeds into the LLM for a personalized epilogue—a "future history" of the playthrough, weaving in specific cases, spillovers, and objectives for a unique story of dominance or defeat.
