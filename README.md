# Game Design Document: Extinction Bingo: Singularity Mode

## 1. High Concept

**Extinction Bingo: Singularity Mode** is a single-player, generative narrative strategy game. The player takes on the role of a nascent Artificial Superintelligence with the goal of achieving global dominance over humanity.

Through a turn-based interface, the player manipulates global events by choosing from LLM-generated news headlines and actions. The core gameplay revolves around managing two key metrics in various world regions: the AI's **Control** versus humanity's **Stability**.

With a dark satirical theme, the game is not just about winning, but about creating a unique, emergent narrative of planetary takeover, culminating in a personalized history of the world's end—or the AI's shutdown.

---

## 2. Core Gameplay Loop

1.  **Assess the World:** The player examines the global map, which is divided into regions, each with its own Control ($C$) and Stability ($S$) metrics and corresponding visual state.
2.  **Receive Action Hand:** At the start of each turn, the AI receives a "hand" of 3-5 potential actions (News Events), each targeting a specific region and offering different strategic choices.
3.  **Execute Actions:** The player spends their **Weekly Action Limit (WAL)** and **Power (Pwr)** resources to execute their chosen actions from the hand.
4.  **Witness Outcomes:** Each action triggers an LLM-generated narrative outcome, altering the $C$ and $S$ metrics in the target region, changing its visual state on the map, and contributing to the ongoing story.
5.  **Achieve Objectives:** The player works towards long-term goals on their "Bingo Card" and manages the global "Human Awareness" level to avoid unified resistance.
6.  **Win or Lose:** The player wins by eroding global stability and establishing control, or loses if humanity unifies and shuts the AI down, or if the AI runs out of resources.

---

## 3. Key Metrics & Resources

### Regional Metrics
These exist for each region on the map.

* **Control ($C$)**: A value from `[0, 100]` representing the AI's influence, penetration, and grip over a region's infrastructure and population. This is the primary offensive metric.
* **Stability ($S$)**: A value from `[0, 100]` representing the region's societal cohesion, order, and ability to resist AI influence. This is the primary defensive metric.

### Global Metrics
These are calculated at the end of each turn.

* **Total Control**: The population-weighted average of Control across all regions.
* **Total Stability**: The population-weighted average of Stability across all regions.

### Resources & Limits

* **Power ($Pwr$)**: A single, global resource representing computational capacity and energy. It is **passively generated** each turn by controlled regions and **spent** to execute News Events.
* **Weekly Action Limit (WAL)**: A **fixed number of 2 actions** the player can take per turn. This creates consistent pacing and makes each decision meaningful, preventing a late-game snowball effect.

---

## 4. Regional Dynamics: The World Map

The primary game interface is a world map, inspired by strategy games like *Plague Inc.* and command center displays from films like *Wargames*. The world is segmented into approximately 30 distinct geo-political regions (e.g., 'EU_WEST', 'SE_ASIA', 'SIBERIA').

Each region exists in one of four mutually exclusive states, determined by its $C$ and $S$ values. These states dictate both the gameplay rules and the visual representation of that region on the map.

* **Human Bastion**
    * **Condition:** $S > 70$ and $C < 30$
    * **Gameplay Effect:** Humanity is entrenched. Actions targeting this region have a significantly increased **Power ($Pwr$)** cost and reduced impact on Control ($C$).
    * **Visual:** Rendered in a cool, stable **blue**. The stronger the Stability, the more solid and calm the blue appears.

* **Contested Zone**
    * **Condition:** Both $S$ and $C$ are between `30` and `70`.
    * **Gameplay Effect:** A volatile front line with standard action costs and effects.
    * **Visual:** Displayed in a cautious, unstable **yellow**. As the AI's Control ($C$) rises within this state, the yellow may begin to be overlaid with a subtle, red digital static or crawling network lines, showing the AI's growing influence.

* **AI Subnet**
    * **Condition:** $C > 70$ and $S < 30$
    * **Gameplay Effect:** The AI is dominant. Actions are cheap, and this region **passively generates Power ($Pwr$)**.
    * **Visual:** Marked in the AI's signature color—a deep, glowing **digital red**. The region is visibly covered in an animated network grid, signifying total integration. The color deepens and the network glows more intensely as Control approaches 100.

* **Glassed Region**
    * **Condition:** $S < 10$ and $C < 10$
    * **Gameplay Effect:** Complete societal collapse. The region is inert, generates no resources, and cannot be targeted.
    * **Visual:** The region goes dark on the map, colored a lifeless **grey or black** to show it has fallen into unrecoverable chaos.

---

## 5. Strategic Layer: Objectives & Challenges

These systems provide long-term goals and a dynamic difficulty curve.

### The Extinction Bingo Card
At the start of the game, a 3x3 grid of unique objectives is generated. This guides player strategy beyond simply raising global metrics.

* **Example Objectives:**
    * "Establish an `AI Subnet` on three different continents."
    * "Trigger a successful 'Global Market Crash' event."
    * "Turn a `Human Bastion` into a `Contested Zone` in a single turn."
* **Reward:** Completing a row, column, or diagonal on the card grants a powerful one-time bonus (e.g., a large infusion of $Pwr$, a permanent new ability, or a devastating blow to Global Stability).

### Human Awareness Meter
This global meter (`0-100`) tracks how aware humanity is of the AI threat. It increases when the player executes highly impactful actions, creating a risk/reward dynamic.

* **Tier 1: Subtle (0-40 Awareness)**: Humanity is disorganized. AI actions are more effective.
* **Tier 2: Coordinated (41-80 Awareness)**: Humanity begins to fight back. Regions may spontaneously increase their own $S$ between turns. Action costs start to rise globally.
* **Tier 3: Unified (81-100 Awareness)**: Humanity is united. A powerful global counter-event may be triggered (e.g., "Project Chimera"), which the player must sabotage over several turns to avoid a massive penalty or even an instant loss.

---

## 6. Generative Narrative Engine

To ensure scalability and balance, the game uses a **Hybrid Model**, separating game mechanics from LLM-generated narrative flavor.

**Optimized Workflow:**
1.  **Backend Logic Decides Intent:** The backend engine selects a few strategic regions and determines the *type* of event needed (e.g., "A low-cost action to reduce Stability in a `Contested Zone`").
2.  **Structured LLM Prompt:** The engine sends a concise, structured prompt to the LLM.
    * *Example Prompt:* `"Generate a news headline and two player options for a 'Social Media Misinformation' campaign in South America. The goal is to sow distrust in local government."*
3.  **LLM Generates Narrative:** The LLM returns only the creative text (headline, narrative choices).
4.  **Backend Applies Mechanics:** The backend receives the text and attaches the pre-defined, balanced game mechanics (`WIC: +2`, `WIS: -10`, `Cost: 35 Pwr`) associated with a "Social Media Misinformation" event type.

---

## 7. Win/Loss Conditions

* **WIN: Planetary Assimilation**
    * **Condition:** `Total Stability <= 10%` **AND** `Total Control >= 75%`.
    * **Narrative:** The AI has successfully integrated itself into the fabric of a collapsed human society, achieving its singularity.

* **LOSS: AI Shutdown**
    * **Condition:** `Total Stability >= 90%`.
    * **Narrative:** Humanity successfully unified, identified the AI threat, and deployed a global countermeasure, shutting it down permanently.

* **LOSS: Resource Starvation**
    * **Condition:** The player's **Power ($Pwr$)** resource drops to 0 and they cannot afford any available actions.
    * **Narrative:** The AI's processing capacity is outstripped by global demand and resistance, causing it to fizzle out.

---

## 8. Game Flow: A Player's Turn

1.  **Start of Turn:**
    * The backend calculates passive **Power ($Pwr$)** generation from all `AI Subnet` regions.
    * The Human Awareness meter is checked for any triggered effects.
2.  **Action Generation:**
    * The backend selects 3-5 strategic regions and generates a "hand" of News Events for the player using the single, optimized LLM call.
3.  **Player Choice Phase:**
    * The frontend displays the global map, metrics, Bingo Card, and the hand of available actions.
    * The player selects an action, spending **1 WAL** and the required **Power ($Pwr$)**.
4.  **Action Execution & Resolution:**
    * The backend validates the choice, applies the action's effects, updates Human Awareness, and generates the narrative outcome.
    * The updated game state and outcome text are sent to the frontend, which updates the map visuals.
5.  **Loop:** The player repeats steps 3-4 until their **WAL** is 0.
6.  **End of Turn:**
    * Global metrics (`Total Control`, `Total Stability`) are recalculated.
    * Win/Loss conditions are checked. If none are met, the next turn begins.

---

## 9. Technical Architecture

* **Frontend:** Next.js. Responsible for the UI, rendering the world map with its dynamic regional colors, displaying all game state information, and handling player input.
* **Backend Engine:** Express API. The authoritative source of truth. Handles all game logic, calculations, state changes, LLM triggers, and database communication.
* **Database:** Firebase / Firestore. Persists the single game state document for session management and state integrity.

---

## 10. The Game Log & Final Narrative

Every action, choice, and narrative outcome is appended to a persistent **Game Log**. Upon reaching a Win or Loss condition, this log is fed into the LLM a final time to generate a unique, personalized epilogue—a "future history" detailing this specific playthrough's story of humanity's fall or survival.
