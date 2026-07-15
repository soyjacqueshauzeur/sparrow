# Graph Report - /home/jacques/opencode/Sparrow  (2026-07-08)

## Corpus Check
- Corpus is ~6,292 words - fits in a single context window. You may not need a graph.

## Summary
- 120 nodes · 200 edges · 6 communities (5 shown, 1 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 16 edges (avg confidence: 0.78)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Core Application Logic (script.js)
- Card Generation & Navigation
- Documentation & Architecture
- Game State & Timer
- Speed Control
- Card Display

## God Nodes (most connected - your core abstractions)
1. `Sparrow - Gamified Memorization System` - 15 edges
2. `advanceToNextCard()` - 11 edges
3. `startRunning()` - 11 edges
4. `Sparrow HTML Application UI` - 11 edges
5. `scheduleNext()` - 10 edges
6. `showCard()` - 8 edges
7. `updatePauseButton()` - 7 edges
8. `Category Navigation Pills (Module Selection)` - 7 edges
9. `handlePauseAction()` - 6 edges
10. `selectSet()` - 6 edges

## Surprising Connections (you probably didn't know these)
- `memory-plus-plus.html (Entry Point)` --semantically_similar_to--> `Sparrow HTML Application UI`  [AMBIGUOUS] [semantically similar]
  README.md → index.html
- `Training Mode (Automatic Cycle)` --implements--> `Sparrow HTML Application UI`  [INFERRED]
  README.md → index.html
- `Category Navigation Pills (Module Selection)` --implements--> `1-100 Peg Mnemonic Module`  [INFERRED]
  index.html → README.md
- `Category Navigation Pills (Module Selection)` --implements--> `Numbers Module (Random Digits)`  [INFERRED]
  index.html → README.md
- `Category Navigation Pills (Module Selection)` --implements--> `Binary Module (Random 0/1 Pairs)`  [INFERRED]
  index.html → README.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Sparrow Design Rationale: Duolingo Dark Theme + Zero-Dependency + Google Fonts Nunito** — home_jacques_opencode_Sparrow_README_duolingo_dark_theme, home_jacques_opencode_Sparrow_README_zero_dependency_architecture, home_jacques_opencode_Sparrow_README_google_fonts_nunito [EXTRACTED 1.00]

## Communities (6 total, 1 thin omitted)

### Community 0 - "Core Application Logic (script.js)"
Cohesion: 0.04
Nodes (49): binarioConfig, binCount, bottomControls, clockDisplay, compareBtn, container, contentArea, dataSets (+41 more)

### Community 1 - "Card Generation & Navigation"
Cohesion: 0.14
Nodes (24): advanceToNextCard(), buildShuffleOrder(), compareAndReveal(), fadeOutAndNext(), fadeOutAndNextBinario(), fadeOutAndNextDeck(), fadeOutAndNextNumbers(), generateBinario() (+16 more)

### Community 2 - "Documentation & Architecture"
Cohesion: 0.15
Nodes (22): css/style.css - Duolingo Dark Theme Styles, Duolingo Dark Theme Design, Google Fonts Nunito (Only External Dependency), js/script.js - Application Logic, memory-plus-plus.html (Entry Point), 1-100 Peg Mnemonic Module, Binary Module (Random 0/1 Pairs), Deck Module (52 Playing Cards) (+14 more)

### Community 3 - "Game State & Timer"
Cohesion: 0.18
Nodes (14): changeTimerMinutes(), changeTimerSeconds(), cleanCardFeedback(), pad2(), resetGameState(), resetTimer(), selectSet(), setRecallMode() (+6 more)

### Community 4 - "Speed Control"
Cohesion: 0.50
Nodes (5): adjustSpeed(), getDelay(), msToInput(), parseSpeed(), updateSpeedFill()

## Ambiguous Edges - Review These
- `memory-plus-plus.html (Entry Point)` → `Sparrow HTML Application UI`  [AMBIGUOUS]
  README.md · relation: semantically_similar_to

## Knowledge Gaps
- **52 isolated node(s):** `dataSets`, `pegWords`, `pegOrder`, `deckMatrix`, `deckSuits` (+47 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `memory-plus-plus.html (Entry Point)` and `Sparrow HTML Application UI`?**
  _Edge tagged AMBIGUOUS (relation: semantically_similar_to) - confidence is low._
- **Are the 2 inferred relationships involving `Sparrow HTML Application UI` (e.g. with `Recall Mode (Interactive Flashcard)` and `Training Mode (Automatic Cycle)`) actually correct?**
  _`Sparrow HTML Application UI` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `dataSets`, `pegWords`, `pegOrder` to the rest of the system?**
  _53 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Application Logic (script.js)` be split into smaller, more focused modules?**
  _Cohesion score 0.03773584905660377 - nodes in this community are weakly interconnected._
- **Should `Card Generation & Navigation` be split into smaller, more focused modules?**
  _Cohesion score 0.14130434782608695 - nodes in this community are weakly interconnected._