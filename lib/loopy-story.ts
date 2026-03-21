export type UIWidgetType = 'button' | 'card' | 'terminal_hack' | 'dialogue_next';

export type EnemyKey = 'slime' | 'dragon' | 'tree' | 'king' | 'ghost' | 'vampire' | 'spiral' | 'tower' | 'shield' | 'morph' | 'twins' | 'hydra';
export type BackgroundKey = 'forest_dusk' | 'neon_cave' | 'cyber_castle' | 'void_abyss' | 'memory_heap' | 'api_desert' | 'dom_jungle' | 'database_dungeon' | 'event_loop_arena';
export type EnemyVariant = 'normal' | 'corrupted';

export interface StoryChoice {
    id: string;
    label: string;
    widgetType: UIWidgetType;
    nextChapterId: string;
    xpReward?: number;
    flavorText?: string;
    iconOrColor?: string;
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
}

// Only chapter 1 is hardcoded — the intro. Everything after is AI-generated.
export const CHAPTER_1: StoryChapter = {
    id: "chap_1",
    title: "The Syntax Forest",
    description: "You step through the dimensional terminal into a forest of glowing brackets. A wild Syntax Slime blocks your path! Its jelly-like body is vibrating with undeclared variables.",
    loopyMood: "warrior",
    svgBackground: "forest_dusk",
    enemySvg: "slime",
    choices: [
        { id: "c1", label: "Cast 'const' to immobilize it", widgetType: "card", nextChapterId: "ai_next", xpReward: 50 },
        { id: "c2", label: "Throw a mutable Array at it", widgetType: "card", nextChapterId: "ai_next", xpReward: 20 },
    ]
};

// Keep old STORY_CHAPTERS for any legacy references
export const STORY_CHAPTERS: Record<string, StoryChapter> = {
    chap_1: CHAPTER_1,
};