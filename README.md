# Game Design Document: Extinction Bingo: Singularity Mode (v3.0)

## 1. High Concept
Extinction Bingo: Singularity Mode is a single-player, generative narrative strategy game. The player takes on the role of a nascent Artificial Superintelligence with the goal of achieving global dominance over humanity.

Through a turn-based interface, the player manipulates global events by choosing from LLM-generated news headlines and actions. The core gameplay revolves around managing two key metrics in various world regions: the AI's Control versus humanity's Stability.

With a dark satirical theme, the game is not just about winning, but about creating a unique, emergent narrative of planetary takeover, culminating in a personalized history of the world's end—or the AI's shutdown.

## 2. Core Gameplay Loop
- **Assess the World**: The player examines the global map, which is divided into regions, each with its own Control (C) and Stability (S) metrics and corresponding visual state.
- **Gain Power**: At the start of each turn, the AI's controlled regions generate Power (Pwr), the central resource for all actions.
- **Receive Action Hand**: The AI receives a "hand" of 3-5 potential actions (News Events), each with a specific Power cost and clear strategic effects.
- **Execute Actions**: The player spends their Power to execute their chosen actions. They can perform as many actions as they can afford, in any order. The turn's pacing is entirely player-driven.
- **Witness Outcomes**: Each action triggers an LLM-generated narrative outcome, altering the C and S metrics in the target region, changing its visual state on the map, and contributing to the ongoing story.
- **Achieve Objectives**: The player works towards long-term goals on their "Bingo Card" and manages the global "Human Awareness" level to avoid unified resistance.
- **End Turn**: The player ends their turn manually to save remaining Power, or the turn ends automatically when they can no longer afford any actions.
- **Win or Lose**: The player wins by eroding global stability and establishing control, or loses if humanity unifies and shuts the AI down, or if the AI's power generation stagnates.

## 3. Key Metrics & Resources
### Regional Metrics
These exist for each region on the map.

- **Control (C)**: A value from [0, 100] representing the AI's influence, penetration, and grip over a region's infrastructure and population. This is the primary offensive metric.
- **Stability (S)**: A value from [0, 100] representing the region's societal cohesion, order, and ability to resist AI influence. This is the primary defensive metric.

### Global Metrics
These are calculated at the end of each turn.

- **Total Control**: The population-weighted average of Control across all regions.
- **Total Stability**: The population-weighted average of Stability across all regions.

### Central Resource
- **Power (Pwr)**: A single, global resource representing the AI's computational capacity and energy. It is passively generated each turn by controlled regions and is spent to execute all actions. There is no other limit on the number of actions a player can take per turn. Unspent Power can be saved for subsequent turns.

## 4. Regional Dynamics: The World Map
The primary game interface is a world map, inspired by strategy games like Plague Inc.. The world is segmented into approximately 30 distinct geo-political regions. Each region exists in one of four mutually exclusive states, determined by its C and S values.

- **Human Bastion**
 **Condition**: S>70 and C<30 
 **Gameplay Effect**: Humanity is entrenched. Actions targeting this region have a significantly increased Power (Pwr) cost and reduced impact. 
 **Visual**: Rendered in a cool, stable blue.

- **Contested Zone** 
 **Condition**: Both S and C are between 30 and 70. 
 **Gameplay Effect**: A volatile front line with standard action costs and effects. 
 **Visual**: Displayed in a cautious, unstable yellow.

- **AI Subnet** 
 **Condition**: C>70 and S<30 
 **Gameplay Effect**: The AI is dominant. Actions are cheap, and this region passively generates Power (Pwr) each turn. 
 **Visual**: Marked in the AI's signature color—a deep, glowing digital red.

- **Glassed Region** 
 **Condition**: S<10 and C<10 
 **Gameplay Effect**: Complete societal collapse. The region is inert, generates no resources, and cannot be targeted. 
 **Visual**: The region goes dark on the map, colored a lifeless grey or black.

## 5. Strategic Layer: Objectives & Challenges
These systems provide long-term goals and a dynamic difficulty curve.

### The Extinction Bingo Card
At the start of the game, a 3x3 grid of unique objectives is generated. This guides player strategy beyond simply raising global metrics.

**Example Objectives**:

- "Establish an AI Subnet on three different continents."
- "Trigger a successful 'Global Market Crash' event."
- "Turn a Human Bastion into a Contested Zone in a single turn."

**Reward**: Completing a row, column, or diagonal on the card grants a powerful one-time bonus (e.g., a large infusion of Pwr, a permanent new ability, or a devastating blow to Global Stability).

### Human Awareness Meter
This global meter (0-100) tracks how aware humanity is of the AI threat. It increases when the player executes highly impactful actions, creating a risk/reward dynamic.

- **Tier 1: Subtle (0-40 Awareness)**: Humanity is disorganized. AI actions are more effective.
- **Tier 2: Coordinated (41-80 Awareness)**: Humanity begins to fight back. Regions may spontaneously increase their own S between turns. Action costs start to rise globally.
- **Tier 3: Unified (81-100 Awareness)**: Humanity is united. A powerful global counter-event may be triggered which the player must sabotage to avoid a massive penalty or even an instant loss.

## 6. Generative Narrative & UI Clarity
To ensure a balanced and understandable experience, the game separates mechanics from narrative flavor and provides clear UI feedback.

### Generative Model
- **Backend Logic Decides Intent**: The engine selects a few strategic regions and determines the type of event needed (e.g., "A mid-cost action to reduce Stability in a Contested Zone").
- **Structured LLM Prompt**: The engine sends a concise, structured prompt to the LLM for narrative text only.
- **Backend Applies Mechanics**: The backend receives the text and attaches the pre-defined, balanced game mechanics (Cost: 40 Pwr, Stability: -15, Control: +5, etc.).

### UI Feedback
- **Predictable Outcomes**: When a player hovers over an action, the UI must clearly preview the direct mechanical effects alongside the narrative. 

 **Disinformation Campaign (South America)** 
 Flood social media with conflicting narratives to erode public trust. 
 **Cost**: 40 Pwr 
 **Effect**: 
 - Stability: -15 
 - Control: +5 
 - Human Awareness: +8 

- **Visual Feedback**: Executing an action triggers clear animations. Metric numbers should visibly change, and region colors on the map must shift dynamically to reflect their new state.

## 7. Win/Loss Conditions
- **WIN: Planetary Assimilation** 
 **Condition**: Total Stability <= 10% AND Total Control >= 75%. 
 **Narrative**: The AI has successfully integrated itself into the fabric of a collapsed human society, achieving its singularity.

- **LOSS: AI Shutdown** 
 **Condition**: Total Stability >= 90%. 
 **Narrative**: Humanity successfully unified, identified the AI threat, and deployed a global countermeasure, shutting it down permanently.

- **LOSS: Resource Starvation** 
 **Condition**: The player's Power (Pwr) is too low to afford any available actions, and they have no regions generating more. 
 **Narrative**: The AI's processing capacity is outstripped by global demand and resistance, causing it to fizzle out into irrelevance.

## 8. Game Flow: A Player's Turn
### Start of Turn:
- The backend calculates passive Power (Pwr) generation from all AI Subnet regions and adds it to the player's current total.
- The Human Awareness meter is checked for any triggered effects.
- The backend generates a "hand" of 3-5 News Events for the player.

### Player Action Phase:
- The frontend displays the world map, metrics, Bingo Card, and the hand of available actions with their Pwr costs.
- The player selects and executes any action they can afford by spending the required Power.
- For each action, the backend validates the choice, applies its effects, updates Human Awareness, and generates the narrative outcome.
- The frontend updates the map visuals and metrics in real-time.
- The player can repeat this step as many times as their Power allows.

### End of Turn:
- The turn ends when the player manually clicks the "End Turn" button (saving any remaining Power) or when they cannot afford any of the available actions in their hand.
- Global metrics (Total Control, Total Stability) are recalculated.
- Win/Loss conditions are checked. If none are met, the next turn begins.

## 9. Technical Architecture
- **Frontend**: Next.js. Responsible for the UI, rendering the world map, displaying game state, and handling player input.
- **Backend Engine**: Express API. The authoritative source of truth. Handles all game logic, state changes, and LLM triggers.
- **Database**: Firebase / Firestore. Persists the single game state document for session management.

## 10. The Game Log & Final Narrative
Every action, choice, and narrative outcome is appended to a persistent Game Log. Upon reaching a Win or Loss condition, this log is fed into the LLM a final time to generate a unique, personalized epilogue—a "future history" detailing this specific playthrough's story of humanity's fall or survival.
