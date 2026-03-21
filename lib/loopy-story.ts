export type UIWidgetType = 'button' | 'card' | 'terminal_hack' | 'dialogue_next';

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
    svgBackground: "forest_dusk" | "neon_cave" | "cyber_castle" | "void_abyss";
    enemySvg?: "slime" | "dragon" | "king" | "tree";
    choices: StoryChoice[];
}

export const STORY_CHAPTERS: Record<string, StoryChapter> = {
    "chap_1": {
        id: "chap_1",
        title: "The Syntax Forest",
        description: "You step through the dimensional terminal into a forest of glowing brackets. A wild Syntax Slime blocks your path! Its jelly-like body is vibrating with undeclared variables.",
        loopyMood: "warrior",
        svgBackground: "forest_dusk",
        enemySvg: "slime",
        choices: [
            { id: "c1", label: "Cast 'const' to immobilize it", widgetType: "card", nextChapterId: "chap_2", xpReward: 50 },
            { id: "c2", label: "Throw an Array! [🗡️]", widgetType: "card", nextChapterId: "chap_1_fail", xpReward: 0 }
        ]
    },
    "chap_1_fail": {
        id: "chap_1_fail",
        title: "FATAL EXCEPTION: TYPE ERROR",
        description: "The slime absorbs your mutable array and grows twice its size! It engulfs you completely. Your codebase has crashed.",
        loopyMood: "huddled",
        svgBackground: "void_abyss",
        choices: [
            { id: "c1", label: "Restart Checkpoint (-20 XP)", widgetType: "button", nextChapterId: "chap_1", xpReward: -20 }
        ]
    },
    "chap_2": {
        id: "chap_2",
        title: "The Glowing Root",
        description: "The slime hardens into an immutable block and shatters. You press forward and discover an ancient Syntax Tree. It's beautiful, but its branches are tangled in a fatal merge conflict.",
        loopyMood: "happy",
        svgBackground: "forest_dusk",
        enemySvg: "tree",
        choices: [
            { id: "c1", label: "Resolve the conflict carefully", widgetType: "terminal_hack", nextChapterId: "chap_3", xpReward: 75 },
            { id: "c2", label: "Git Push --Force! (Dangerous)", widgetType: "button", nextChapterId: "chap_2_fail", xpReward: 0 }
        ]
    },
    "chap_2_fail": {
        id: "chap_2_fail",
        title: "FATAL EXCEPTION: BRANCH DELETED",
        description: "Your forced push overwrites the ancient history of the Syntax Tree. The timeline collapses in on itself! You are erased from the commit history.",
        loopyMood: "huddled",
        svgBackground: "void_abyss",
        choices: [
            { id: "c1", label: "Restore Backup (-30 XP)", widgetType: "button", nextChapterId: "chap_2", xpReward: -30 }
        ]
    },
    "chap_3": {
        id: "chap_3",
        title: "The Descent",
        description: "The ground opens up! You fall into the Neon Caves. The deeper you go, the more callbacks you see nesting into the walls. You are stranded in Callback Hell.",
        loopyMood: "thinking",
        svgBackground: "neon_cave",
        choices: [
            { id: "c1", label: "Equip Async/Await Lantern", widgetType: "dialogue_next", nextChapterId: "chap_4" }
        ]
    },
    "chap_4": {
        id: "chap_4",
        title: "The Async Dragon",
        description: "Suddenly, a tremendous roar echoes. The Async Dragon descends! It breathes devastating `Uncaught (in promise)` fire at you!",
        loopyMood: "warrior",
        svgBackground: "neon_cave",
        enemySvg: "dragon",
        choices: [
            { id: "c1", label: "Cast AWAIT to freeze time", widgetType: "card", nextChapterId: "chap_5", xpReward: 100 },
            { id: "c2", label: "Ignore the Promise!", widgetType: "card", nextChapterId: "chap_4_fail", xpReward: 0 }
        ]
    },
    "chap_4_fail": {
        id: "chap_4_fail",
        title: "FATAL EXCEPTION: UNHANDLED REJECTION",
        description: "Because you ignored the Promise, the Dragon's fire resolves asynchronously right into your face. You are burned to a crisp.",
        loopyMood: "huddled",
        svgBackground: "void_abyss",
        choices: [
            { id: "c1", label: "Catch the Error (-50 XP)", widgetType: "button", nextChapterId: "chap_4", xpReward: -50 }
        ]
    },
    "chap_5": {
        id: "chap_5",
        title: "The Cyber Castle Gates",
        description: "Your modern spells subdue the beast. The dragon nods respectfully and flies away. Before you stands the Cyber Castle, but the gate is locked with strict JWT encryption.",
        loopyMood: "thinking",
        svgBackground: "cyber_castle",
        choices: [
            { id: "c1", label: "Decrypt the Auth Payload", widgetType: "terminal_hack", nextChapterId: "chap_6", xpReward: 50 },
            { id: "c2", label: "Bypass LocalStorage (Insecure)", widgetType: "button", nextChapterId: "chap_5_fail", xpReward: 0 }
        ]
    },
    "chap_5_fail": {
        id: "chap_5_fail",
        title: "FATAL EXCEPTION: UNAUTHORIZED",
        description: "The Cyber Castle's middleware detects your missing token. The sentinels banish you to the 401 Outer Rim.",
        loopyMood: "huddled",
        svgBackground: "void_abyss",
        choices: [
            { id: "c1", label: "Acquire Valid Token (-40 XP)", widgetType: "button", nextChapterId: "chap_5", xpReward: -40 }
        ]
    },
    "chap_6": {
        id: "chap_6",
        title: "The Garbage King",
        description: "You enter the throne room. The Garbage King sits on a throne of unreferenced objects. He is hoarding gigabytes of precious memory, causing the entire realm to lag!",
        loopyMood: "warrior",
        svgBackground: "cyber_castle",
        enemySvg: "king",
        choices: [
            { id: "c1", label: "Summon the Garbage Collector", widgetType: "card", nextChapterId: "chap_7", xpReward: 200 },
            { id: "c2", label: "Create more Global Variables!", widgetType: "card", nextChapterId: "chap_6_fail", xpReward: 0 }
        ]
    },
    "chap_6_fail": {
        id: "chap_6_fail",
        title: "FATAL EXCEPTION: OUT OF MEMORY",
        description: "Your global variables fill the last remaining megabytes of RAM. The entire browser tab crashes. White screen of death.",
        loopyMood: "huddled",
        svgBackground: "void_abyss",
        choices: [
            { id: "c1", label: "Hard Refresh (-100 XP)", widgetType: "button", nextChapterId: "chap_6", xpReward: -100 }
        ]
    },
    "chap_7": {
        id: "chap_7",
        title: "Victory: The Runtime Restored",
        description: "The King is swept away by the V8 Engine's mighty collector! The kingdom's frame rate returns to a silky smooth 60fps. You have restored order to the DOM.",
        loopyMood: "happy",
        svgBackground: "cyber_castle",
        choices: [
            { id: "c1", label: "Return to Reality (Home)", widgetType: "button", nextChapterId: "home" }
        ]
    }
};
