export type UIWidgetType =
  | 'button' | 'card' | 'dialogue_next'
  | 'terminal_hack' | 'code_patch' | 'timing_strike' | 'node_graph'
  | 'memory_pulse' | 'binary_flip' | 'signal_lock' | 'glitch_hunter' | 'energy_surge';

export interface PuzzleData {
    startingCode?: string;      // For code_patch
    expectedAnswer?: string;    // For terminal_hack or code_patch
    timeLimit?: number;         // For timing_strike / glitch_hunter
    nodesToConnect?: string[];  // For node_graph
    targetScore?: number;       // For generic scoring goals
    // New engines
    sequence?: number[];                       // memory_pulse: tap order e.g. [0,4,2,6]
    gridSize?: number;                         // memory_pulse: e.g. 3 = 3×3 grid
    targetPattern?: boolean[];                 // binary_flip: e.g. [true,false,true,true,false,true]
    targetSymbols?: string[];                  // signal_lock: symbol for each ring e.g. ["$","}",">"]
    corruptedText?: string;                    // glitch_hunter: full sentence with glitched words
    glitchedIndices?: number[];                // glitch_hunter: which word indices are wrong
    targetRange?: { min: number; max: number }; // energy_surge: release zone %
}

export interface InventoryItem {
    id: string;
    name: string;
    description: string;
    icon?: string;
}

export type EnemyKey = 'slime' | 'dragon' | 'tree' | 'king' | 'ghost' | 'vampire' | 'spiral' | 'tower' | 'shield' | 'morph' | 'twins' | 'hydra' | 'dom_core_entity' | 'cascade_queen' | 'event_loop_engine' | 'async_hydra' | 'complexity_engine';
export type BackgroundKey = 'corrupted_blank' | 'markup_ruins' | 'style_chaos' | 'logic_core' | 'async_wasteland' | 'algorithm_vault' | 'forest_dusk' | 'neon_cave' | 'cyber_castle' | 'void_abyss' | 'memory_heap' | 'api_desert' | 'dom_jungle' | 'database_dungeon' | 'event_loop_arena';
export type EnemyVariant = 'normal' | 'corrupted';

export interface StoryChoice {
    id: string;
    label: string;
    widgetType: UIWidgetType;
    nextChapterId: string;
    xpReward?: number;
    isRisky?: boolean;  // true = fail/risky path; false/undefined = win path
    flavorText?: string;
    iconOrColor?: string;
    puzzleData?: PuzzleData;
}

export interface StoryChapter {
    id: string;
    title: string;
    description: string;
    loopyMood: "warrior" | "happy" | "thinking" | "huddled";
    svgBackground: BackgroundKey;
    backgroundTint?: string;
    enemySvg?: EnemyKey;
    enemyVariant?: EnemyVariant;
    choices: StoryChoice[];
    grantedItem?: InventoryItem;
    loopyDialogue?: string;   // AI-generated at runtime: 1-2 sentence Loopy reaction
    isLoreScene?: boolean;    // If true, render full-screen cinematic lore layout
    loreText?: string[];      // Paragraphs revealed sequentially in lore scene
}

export const CHAPTER_1: StoryChapter = {
    id: "chap_1",
    title: "System Failure",
    description: "You load a page. Nothing renders correctly. A <div> stretches infinitely across the screen. Your console floods with errors. Then— a flicker. \"Hey… something's wrong. I don't think I'm supposed to look like this.\"",
    loopyMood: "huddled",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Continue", widgetType: "dialogue_next", nextChapterId: "lore_opening", xpReward: 0 }
    ]
};

// Keep old STORY_CHAPTERS for any legacy references
export const STORY_CHAPTERS: Record<string, StoryChapter> = {
    chap_1: CHAPTER_1,
};