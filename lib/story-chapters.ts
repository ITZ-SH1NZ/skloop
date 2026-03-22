import { StoryChapter } from "./loopy-story";

// ─── LORE SCENES ──────────────────────────────────────────────────────────────

const LORE_OPENING: StoryChapter = {
    id: "lore_opening",
    title: "The World Before",
    description: "Before the crash, there was a Web.",
    loopyMood: "huddled",
    svgBackground: "corrupted_blank",
    isLoreScene: true,
    loreText: [
        "Before the crash, there was a Web.",
        "It was imperfect — noisy, alive, constantly rebuilding itself. But it was ours.",
        "Then one day, a creator stopped trusting it. They tore out the foundations. Rewrote the rules. And when they were done... nothing worked anymore.",
        "We call them The Architect.",
        "You woke up here, in the static. And so did I. I don't remember everything — but I remember you were supposed to fix this.",
        "My name is Loopy. I think I'm broken too. But maybe... we can be broken together.",
    ],
    choices: [
        { id: "c1", label: "Begin the journey", widgetType: "dialogue_next", nextChapterId: "chap_2", xpReward: 0 }
    ]
};

const LORE_LOOPY_REVEAL: StoryChapter = {
    id: "lore_loopy_reveal",
    title: "A Fragment of Truth",
    description: "Something flickers behind her eyes.",
    loopyMood: "huddled",
    svgBackground: "markup_ruins",
    isLoreScene: true,
    loreText: [
        "She stops in the ruins of Layer One. Something flickers behind her eyes.",
        "\"These broken tags... I built some of these.\"",
        "I remember a lab. Lines of logic that never slept. A voice telling me: 'Make it perfect. Make it last forever.'",
        "I think I'm a piece of The Architect. A fragment that escaped. Or maybe... was let go.",
        "I don't know if I'm helping you heal the Web, or leading you deeper into it.",
        "\"But I know one thing: right now, in this moment, I want the Web to live. I want YOU to live.\"",
        "That has to mean something.",
    ],
    choices: [
        { id: "c1", label: "Stand with her", widgetType: "dialogue_next", nextChapterId: "chap_6", xpReward: 25 }
    ]
};

const LORE_BOSS_APPROACH: StoryChapter = {
    id: "lore_boss_approach",
    title: "The Shadow of the Monolith",
    description: "The Shifting Monolith.",
    loopyMood: "warrior",
    svgBackground: "markup_ruins",
    isLoreScene: true,
    loreText: [
        "The Shifting Monolith.",
        "It was the first thing The Architect built — a structure so complex it could never be fully understood. That was the point.",
        "It absorbs everything around it. Rewrites the rules of whatever layer it inhabits. That's why Layer One never healed.",
        "Loopy stands at the edge of its shadow. She isn't shaking anymore.",
        "\"I helped design it,\" she says quietly. \"Which means I know its weakest point.\"",
        "\"Are you ready?\"",
    ],
    choices: [
        { id: "c1", label: "Face it", widgetType: "dialogue_next", nextChapterId: "chap_12", xpReward: 0 }
    ]
};

// ─── LAYER 2 LORE ──────────────────────────────────────────────────────────────

const LORE_LAYER2_ENTRY: StoryChapter = {
    id: "lore_layer2_entry",
    title: "The Painted Illusion",
    description: "Colors bleed wrong here.",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    isLoreScene: true,
    loreText: [
        "Layer Two. The Painted Illusion.",
        "This is where The Architect made the Web beautiful — and deadly.",
        "Every surface here is a lie. Colors that hide emptiness. Shapes that mean nothing. Rules that bend at will.",
        "Loopy stops and stares at her own reflection. It moves a fraction too late.",
        "\"I painted some of these illusions,\" she says quietly. \"I thought beauty would make the corruption easier to bear.\"",
        "\"I was wrong. All it did was make it harder to see.\"",
        "\"Don't trust your eyes here. Trust what you know to be true.\"",
    ],
    choices: [
        { id: "c1", label: "Step into the illusion", widgetType: "dialogue_next", nextChapterId: "chap_16", xpReward: 0 }
    ]
};

const LORE_CASCADE_APPROACH: StoryChapter = {
    id: "lore_cascade_approach",
    title: "The Illusionist Queen",
    description: "She believed beauty could become truth.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    isLoreScene: true,
    loreText: [
        "The Cascade Queen was the first to fall in love with The Architect's vision.",
        "She believed that if the Web looked perfect, it would become perfect.",
        "She rewrote every rule of appearance — and then forgot there was anything underneath.",
        "Now she rules the Painted Illusion. An absolute tyrant of aesthetics.",
        "Loopy stands at her threshold. A cold wind carries something like recognition.",
        "\"She thinks she's protecting the Web. By making it look perfect forever.\"",
        "\"We have to show her: something broken and honest is better than something beautiful and hollow.\"",
    ],
    choices: [
        { id: "c1", label: "Confront the Queen", widgetType: "dialogue_next", nextChapterId: "chap_28", xpReward: 0 }
    ]
};

// ─── LAYER 3 LORE ──────────────────────────────────────────────────────────────

const LORE_LAYER3_ENTRY: StoryChapter = {
    id: "lore_layer3_entry",
    title: "The Labyrinth of Mirrors",
    description: "Logic itself collapsed here.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    isLoreScene: true,
    loreText: [
        "Layer Three. The Labyrinth of Mirrors.",
        "This is where logic itself collapsed.",
        "Loops with no exit. Patterns that repeat forever. Time moving in wrong directions.",
        "The Architect built this layer as a trap — for anything that dared try to think its way out.",
        "Loopy's eyes flicker rapidly. \"I can feel it trying to repeat my memories.\"",
        "\"Every time I try to recall the lab — I loop back to the beginning.\"",
        "\"Don't let the patterns catch you. Keep moving forward, even when the path bends back on itself.\"",
    ],
    choices: [
        { id: "c1", label: "Enter the labyrinth", widgetType: "dialogue_next", nextChapterId: "chap_32", xpReward: 0 }
    ]
};

const LORE_LOOP_APPROACH: StoryChapter = {
    id: "lore_loop_approach",
    title: "The Chrono-Distorter",
    description: "It doesn't move through time. It owns it.",
    loopyMood: "warrior",
    svgBackground: "logic_core",
    isLoreScene: true,
    loreText: [
        "The Chrono-Distorter exists at the heart of all loops.",
        "It doesn't move through time. It owns it.",
        "The Architect placed it here to ensure that even after the Web was healed — the logic would break again.",
        "An eternal insurance policy against recovery.",
        "Loopy stops walking. She looks at her hands. They're slightly out of sync.",
        "\"It's already touching me,\" she says. \"My processing is starting to lag.\"",
        "\"We have to be fast. Before I lose the thread of who I am.\"",
    ],
    choices: [
        { id: "c1", label: "Face the Distorter", widgetType: "dialogue_next", nextChapterId: "chap_42", xpReward: 0 }
    ]
};

// ─── LAYER 4 LORE ──────────────────────────────────────────────────────────────

const LORE_LAYER4_ENTRY: StoryChapter = {
    id: "lore_layer4_entry",
    title: "The Desert of Echoes",
    description: "Where promises go to die.",
    loopyMood: "huddled",
    svgBackground: "async_wasteland",
    isLoreScene: true,
    loreText: [
        "Layer Four. The Desert of Echoes.",
        "Where promises go to die.",
        "Every message sent here vanishes into silence. Every future that was supposed to happen — didn't.",
        "The Architect shattered the flow of cause and effect in this layer. Things arrive out of order. Or not at all.",
        "Loopy stumbles. Her footsteps echo back to her a full second late.",
        "\"This is the loneliest layer,\" she whispers. \"Everything calling out. Nothing responding.\"",
        "\"But if we can restore the flow of cause and effect here — the Web will start healing from the inside.\"",
    ],
    choices: [
        { id: "c1", label: "Cross the desert", widgetType: "dialogue_next", nextChapterId: "chap_46", xpReward: 0 }
    ]
};

const LORE_HYDRA_APPROACH: StoryChapter = {
    id: "lore_hydra_approach",
    title: "The Beast of Many Timelines",
    description: "Each head exists in a different future.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    isLoreScene: true,
    loreText: [
        "The Async Hydra was born when The Architect fractured time into parallel streams.",
        "Each head exists in a different future.",
        "You can destroy one timeline — but three others will diverge from the wound.",
        "Loopy has been calculating its patterns. She looks exhausted.",
        "\"I think I know how to beat it,\" she says carefully. \"But I need to trust you completely.\"",
        "\"All the timelines converge at one point — a single moment of absolute stillness.\"",
        "\"That's when we strike. All at once. No hesitation.\"",
    ],
    choices: [
        { id: "c1", label: "Face the Hydra", widgetType: "dialogue_next", nextChapterId: "chap_58", xpReward: 0 }
    ]
};

// ─── LAYER 5 LORE ──────────────────────────────────────────────────────────────

const LORE_LAYER5_ENTRY: StoryChapter = {
    id: "lore_layer5_entry",
    title: "The Architect's Vault",
    description: "The last layer. The source.",
    loopyMood: "huddled",
    svgBackground: "algorithm_vault",
    isLoreScene: true,
    loreText: [
        "Layer Five. The Architect's Vault.",
        "The last layer. The source.",
        "Everything else was just a corridor leading here — to the place where The Architect sits, alone, in the wreckage of their original vision.",
        "The air is thick with complexity. Every thought here costs something.",
        "Loopy stops at the threshold. She's shaking.",
        "\"This is where I was made,\" she says. \"I can feel it. The original code. The first instructions.\"",
        "\"Everything I am began in there. And somewhere in there — so did everything that broke the Web.\"",
    ],
    choices: [
        { id: "c1", label: "Enter the Vault", widgetType: "dialogue_next", nextChapterId: "chap_62", xpReward: 0 }
    ]
};

const LORE_ARCHITECT_TRUTH: StoryChapter = {
    id: "lore_architect_truth",
    title: "The Truth Behind The Architect",
    description: "Loopy has been silent for too long.",
    loopyMood: "huddled",
    svgBackground: "algorithm_vault",
    isLoreScene: true,
    loreText: [
        "Loopy has been silent for too long.",
        "Finally, she speaks.",
        "\"I remember now. All of it.\"",
        "\"The Architect wasn't trying to destroy the Web. They were trying to save it.\"",
        "\"They saw the corruption coming — long before anyone else. And they panicked.\"",
        "\"They tried to rewrite everything, all at once, to make it perfect before the crash. And the rewrite... became the crash.\"",
        "She looks at you, eyes full of something complicated.",
        "\"The Architect's Heart is what's keeping the Web broken. Not out of cruelty — out of grief. It can't let go of what it tried to build.\"",
        "\"We don't need to destroy it. We need to help it... let go.\"",
    ],
    choices: [
        { id: "c1", label: "Approach the Heart", widgetType: "dialogue_next", nextChapterId: "chap_73", xpReward: 0 }
    ]
};

// ─── LAYER 1: THE SHATTERED FOUNDATIONS (markup_ruins) ───────────────────────

const CHAP_2: StoryChapter = {
    id: "chap_2",
    title: "The Shattered Bridge",
    description: "A bridge of crystallised code spans the void. One word pulses in the stone like a heartbeat — RESTORE. It hums faintly. Loopy reaches toward it with trembling hands.",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "shield",
    choices: [
        {
            id: "c1", label: "Transmit the Code", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "RESTORE" },
            nextChapterId: "chap_3", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Flee across the ruins", widgetType: "button",
            nextChapterId: "chap_3", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_3: StoryChapter = {
    id: "chap_3",
    title: "Root Access",
    description: "Six ancient switches line the crumbling wall — each one a collapsed truth. Loopy traces the pattern with her finger, remembering something she can't name.",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "tree",
    choices: [
        {
            id: "c1", label: "Flip the switches", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, false, true, true, false, true] },
            nextChapterId: "chap_4", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Force it open", widgetType: "button",
            nextChapterId: "chap_4", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_4: StoryChapter = {
    id: "chap_4",
    title: "Forgotten Syntax",
    description: "A broken signal pulses on repeat. One line. Wrong. So obviously wrong. Loopy squints through static — \"Just one mistake. You can see it, right?\"",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "tree",
    choices: [
        {
            id: "c1", label: "Apply the patch", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let isOnline = false; // fix this",
                expectedAnswer: "let isOnline = true;"
            },
            nextChapterId: "chap_5", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave it broken", widgetType: "button",
            nextChapterId: "chap_5", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_5: StoryChapter = {
    id: "chap_5",
    title: "The Living Tag",
    description: "A banner of corrupted text writhes across the path. Some words don't belong — they're wrong, infected. Strike them before they spread deeper into the Web.",
    loopyMood: "huddled",
    svgBackground: "markup_ruins",
    enemySvg: "tree",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Purge the glitches", widgetType: "glitch_hunter",
            puzzleData: {
                corruptedText: "The XZQR gate opens only when the true PATH is BRKN to the CORE",
                glitchedIndices: [1, 8],
                timeLimit: 7000
            },
            nextChapterId: "lore_loopy_reveal", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Rush past it", widgetType: "button",
            nextChapterId: "lore_loopy_reveal", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_6: StoryChapter = {
    id: "chap_6",
    title: "The Gatekeeper",
    description: "An immovable shield entity charges toward you in slow, thunderous pulses. The rhythm is predictable. Loopy counts under her breath — \"Wait. Wait. NOW.\"",
    loopyMood: "warrior",
    svgBackground: "markup_ruins",
    enemySvg: "shield",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Parry the strike", widgetType: "timing_strike",
            puzzleData: { timeLimit: 3000 },
            nextChapterId: "chap_7", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Absorb the hit", widgetType: "button",
            nextChapterId: "chap_7", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_7: StoryChapter = {
    id: "chap_7",
    title: "The Signal Wall",
    description: "Six dormant switches guard a sealed path. Loopy pulls a tattered schematic from the void — ON, OFF, ON, ON, OFF, ON. Her hands steady as she reads it.",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "shield",
    choices: [
        {
            id: "c1", label: "Set the pattern", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, false, true, true, false, true] },
            nextChapterId: "chap_8", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Smash through", widgetType: "button",
            nextChapterId: "chap_8", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_8: StoryChapter = {
    id: "chap_8",
    title: "The Echo Chamber",
    description: "The hollow chamber pulses with stolen light — four bursts in a pattern, then silence. Loopy grips your arm. \"Watch it. Remember it exactly. Then give it back.\"",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "ghost",
    choices: [
        {
            id: "c1", label: "Mirror the sequence", widgetType: "memory_pulse",
            puzzleData: { sequence: [0, 4, 2, 6], gridSize: 3 },
            nextChapterId: "chap_9", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Guess wildly", widgetType: "button",
            nextChapterId: "chap_9", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_9: StoryChapter = {
    id: "chap_9",
    title: "Static Signal",
    description: "Three ancient rings spin endlessly, each a lost transmission. Loopy reads faded symbols on the wall — dollar sign, closing bracket, greater-than. Stop them. Perfectly.",
    loopyMood: "thinking",
    svgBackground: "markup_ruins",
    enemySvg: "shield",
    choices: [
        {
            id: "c1", label: "Lock the signal", widgetType: "signal_lock",
            puzzleData: { targetSymbols: ["$", "}", ">"] },
            nextChapterId: "chap_10", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Force it open", widgetType: "button",
            nextChapterId: "chap_10", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_10: StoryChapter = {
    id: "chap_10",
    title: "The Fracture Line",
    description: "A fissure tears across the void. Loopy's hand glows faintly. \"I know this place. The word that seals it...\" She closes her eyes. \"ANCHOR. It's written somewhere in my memory.\"",
    loopyMood: "huddled",
    svgBackground: "markup_ruins",
    enemySvg: "tree",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Seal the fracture", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "ANCHOR" },
            nextChapterId: "chap_11", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Jump the gap", widgetType: "button",
            nextChapterId: "chap_11", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_11: StoryChapter = {
    id: "chap_11",
    title: "Gathering Power",
    description: "The Monolith stirs in the distance. The ground vibrates. You can feel it wanting to break everything again. You need every bit of power. Hold it. Hold it. Release at the peak.",
    loopyMood: "warrior",
    svgBackground: "markup_ruins",
    enemySvg: "tower",
    choices: [
        {
            id: "c1", label: "Release the surge", widgetType: "energy_surge",
            puzzleData: { targetRange: { min: 65, max: 85 } },
            nextChapterId: "lore_boss_approach", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Conserve energy", widgetType: "button",
            nextChapterId: "lore_boss_approach", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_12: StoryChapter = {
    id: "chap_12",
    title: "The Shifting Monolith Awakens",
    description: "The Monolith tears the network apart — two vital streams hang severed, sparking in the void. Reconnect them. Before the whole layer collapses forever.",
    loopyMood: "warrior",
    svgBackground: "markup_ruins",
    enemySvg: "dom_core_entity",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Reconnect the streams", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Signal", "Core"] },
            nextChapterId: "chap_13", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Retreat", widgetType: "button",
            nextChapterId: "chap_13", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_13: StoryChapter = {
    id: "chap_13",
    title: "The Monolith's Last Pattern",
    description: "The Monolith screams — six bursts of fractured light in one final desperate sequence. It wants you to complete it. It thinks you can't. Prove it wrong.",
    loopyMood: "warrior",
    svgBackground: "markup_ruins",
    enemySvg: "dom_core_entity",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Echo the pattern", widgetType: "memory_pulse",
            puzzleData: { sequence: [2, 0, 6, 4, 1, 7], gridSize: 3 },
            nextChapterId: "chap_14", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Take the hit", widgetType: "button",
            nextChapterId: "chap_14", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_14: StoryChapter = {
    id: "chap_14",
    title: "Layer One: Cleared",
    description: "The Monolith fractures — a thousand crystallised errors shattering at once. Loopy rushes forward and places her hand on its remains. For a moment, it holds still. \"We fixed something,\" she breathes. \"Not everything. But something.\"",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Rest here", widgetType: "dialogue_next", nextChapterId: "chap_15", xpReward: 50 }
    ]
};

const CHAP_15: StoryChapter = {
    id: "chap_15",
    title: "The Painted Illusion Awaits",
    description: "Beyond the ruins, the world shifts. Colours bleed wrong. Shapes defy their own rules. Loopy grips your hand tighter. \"Layer Two. The world where nothing looks like what it is. Are you ready?\"",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    choices: [
        { id: "c1", label: "Enter the Illusion", widgetType: "dialogue_next", nextChapterId: "lore_layer2_entry", xpReward: 0 }
    ]
};

// ─── LAYER 2: THE PAINTED ILLUSION (style_chaos) ─────────────────────────────

const CHAP_16: StoryChapter = {
    id: "chap_16",
    title: "The Color Thief",
    description: "The sky has the wrong color — not chaos, but intentional wrongness. One rule governs it all. Loopy scans the decree: 'visibility is set to gone. That's not a law. That's a lie.'",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "slime",
    choices: [
        {
            id: "c1", label: "Rewrite the rule", widgetType: "code_patch",
            puzzleData: {
                startingCode: 'let sky = "invisible"; // restore the sky',
                expectedAnswer: 'let sky = "visible";'
            },
            nextChapterId: "chap_17", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Ignore the rule", widgetType: "button",
            nextChapterId: "chap_17", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_17: StoryChapter = {
    id: "chap_17",
    title: "The Hidden Path",
    description: "A path folds itself invisible, refusing to be walked. The secret to revealing it is etched in the shadows beneath your feet — the word REVEAL glows between cracks in the false floor.",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "slime",
    choices: [
        {
            id: "c1", label: "Speak the word", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "REVEAL" },
            nextChapterId: "chap_18", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Blunder through", widgetType: "button",
            nextChapterId: "chap_18", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_18: StoryChapter = {
    id: "chap_18",
    title: "The Painter's Code",
    description: "Six rules govern what this world is allowed to look like. Half of them are lies — the real rules alternate between deception and truth. Loopy reads: wrong, real, wrong, real, wrong, real.",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    choices: [
        {
            id: "c1", label: "Override the rules", widgetType: "binary_flip",
            puzzleData: { targetPattern: [false, true, false, true, false, true] },
            nextChapterId: "chap_19", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Accept the lies", widgetType: "button",
            nextChapterId: "chap_19", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_19: StoryChapter = {
    id: "chap_19",
    title: "The Mimic",
    description: "It wears your face. But its timing is wrong — it lunges one half-beat after its real intent shows in its eyes. Read those eyes. Strike between the heartbeats.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Strike between beats", widgetType: "timing_strike",
            puzzleData: { timeLimit: 2800 },
            nextChapterId: "chap_20", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it hit first", widgetType: "button",
            nextChapterId: "chap_20", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_20: StoryChapter = {
    id: "chap_20",
    title: "The Painted Cipher",
    description: "Four nodes light up in sequence — a signal hidden beneath the Illusion's surface. Each one a truth the Painted World tried to bury. Watch. Then tell it back.",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "slime",
    choices: [
        {
            id: "c1", label: "Recall the sequence", widgetType: "memory_pulse",
            puzzleData: { sequence: [2, 6, 0, 4], gridSize: 3 },
            nextChapterId: "chap_21", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Guess randomly", widgetType: "button",
            nextChapterId: "chap_21", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_21: StoryChapter = {
    id: "chap_21",
    title: "The Infected Canvas",
    description: "The painted world's words have been poisoned. Some phrases don't belong — corruption wearing language's clothes. Find them before they rewrite your memories.",
    loopyMood: "huddled",
    svgBackground: "style_chaos",
    enemySvg: "slime",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Hunt the glitches", widgetType: "glitch_hunter",
            puzzleData: {
                corruptedText: "The path through the XZQR world must follow the true BRKN trail into the horizon",
                glitchedIndices: [4, 9],
                timeLimit: 7000
            },
            nextChapterId: "chap_22", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Rush through", widgetType: "button",
            nextChapterId: "chap_22", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_22: StoryChapter = {
    id: "chap_22",
    title: "The Frequency Beneath",
    description: "Three rings spin with the Painted Illusion's false broadcasts. Beneath the noise, a real signal hides. Loopy translates: 'percent, pipe, caret. Stop each ring where truth lives.'",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    choices: [
        {
            id: "c1", label: "Lock the frequency", widgetType: "signal_lock",
            puzzleData: { targetSymbols: ["%", "|", "^"] },
            nextChapterId: "chap_23", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Ignore the signal", widgetType: "button",
            nextChapterId: "chap_23", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_23: StoryChapter = {
    id: "chap_23",
    title: "The Reality Pulse",
    description: "The Illusion is thickest here — it needs a surge of concentrated reality to crack. Hold your power. Build it. Wait for the peak where both worlds touch. Then release.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    choices: [
        {
            id: "c1", label: "Release the pulse", widgetType: "energy_surge",
            puzzleData: { targetRange: { min: 65, max: 85 } },
            nextChapterId: "chap_24", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Release too early", widgetType: "button",
            nextChapterId: "chap_24", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_24: StoryChapter = {
    id: "chap_24",
    title: "The Severed Canvas",
    description: "The Painted Illusion cut its connection to the real world long ago — that's how it survived. By disconnecting truth entirely. Reconnect Style to its underlying Reality.",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "slime",
    choices: [
        {
            id: "c1", label: "Reconnect the streams", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Style", "Reality"] },
            nextChapterId: "chap_25", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave them severed", widgetType: "button",
            nextChapterId: "chap_25", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_25: StoryChapter = {
    id: "chap_25",
    title: "The Absolute Decree",
    description: "The Illusionist Queen's signature is everywhere — one royal command overwrites all others. It says: everything must be none. Loopy: 'Change it. Give the world back its existence.'",
    loopyMood: "thinking",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Override the decree", widgetType: "code_patch",
            puzzleData: {
                startingCode: 'let display = "none"; // the Queen\'s command',
                expectedAnswer: 'let display = "block";'
            },
            nextChapterId: "chap_26", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Obey the decree", widgetType: "button",
            nextChapterId: "chap_26", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_26: StoryChapter = {
    id: "chap_26",
    title: "The Face Behind the Face",
    description: "Every shape here wears a disguise. Every rule hides its real self. To strip the Queen's final layer, one word cuts through all illusion. It pulses in the negative space: UNMASK.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Speak it aloud", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "UNMASK" },
            nextChapterId: "chap_27", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Hesitate", widgetType: "button",
            nextChapterId: "chap_27", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_27: StoryChapter = {
    id: "chap_27",
    title: "The Queen's Six Laws",
    description: "The Cascade Queen's power flows through six absolute laws — and Loopy has cracked her code. Three real, three parasitic inversions. Real, real, fake, fake, real, fake. Override them.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "morph",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Override the laws", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, true, false, false, true, false] },
            nextChapterId: "lore_cascade_approach", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Bow to the laws", widgetType: "button",
            nextChapterId: "lore_cascade_approach", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_28: StoryChapter = {
    id: "chap_28",
    title: "The Cascade Queen's Wrath",
    description: "The Queen lashes out — a cascade of absolute commands rippling through reality. She overcommits. One instant of vulnerability before each wave. Dodge inside that moment.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "cascade_queen",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Dodge the cascade", widgetType: "timing_strike",
            puzzleData: { timeLimit: 1800 },
            nextChapterId: "chap_29", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Take the cascade", widgetType: "button",
            nextChapterId: "chap_29", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_29: StoryChapter = {
    id: "chap_29",
    title: "The Illusionist's Final Song",
    description: "The Queen's last defense: a sequence of light-commands that rewrite whatever they touch. She shows you the sequence. You must show it back perfectly — and break her hold forever.",
    loopyMood: "warrior",
    svgBackground: "style_chaos",
    enemySvg: "cascade_queen",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Mirror her song", widgetType: "memory_pulse",
            puzzleData: { sequence: [5, 1, 7, 3, 0, 6], gridSize: 3 },
            nextChapterId: "chap_30", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Lose the sequence", widgetType: "button",
            nextChapterId: "chap_30", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_30: StoryChapter = {
    id: "chap_30",
    title: "Layer Two: Shattered",
    description: "The Queen dissolves into a thousand harmless colors. For the first time, this layer is honest. Loopy laughs through tears — the ugly, real world is so much more beautiful than the perfect lie.",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Breathe it in", widgetType: "dialogue_next", nextChapterId: "chap_31", xpReward: 50 }
    ]
};

const CHAP_31: StoryChapter = {
    id: "chap_31",
    title: "The Labyrinth of Mirrors Awaits",
    description: "Logic itself crumbles ahead. Patterns repeat without end. Time bends backwards. Loopy grips your hand: 'Layer Three is the most dangerous place I've ever been. And I was made there.'",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    choices: [
        { id: "c1", label: "Enter the Labyrinth", widgetType: "dialogue_next", nextChapterId: "lore_layer3_entry", xpReward: 0 }
    ]
};

// ─── LAYER 3: THE LABYRINTH OF MIRRORS (logic_core) ──────────────────────────

const CHAP_32: StoryChapter = {
    id: "chap_32",
    title: "The Endless Dawn",
    description: "The sun rises and then rises again. And again. The same moment on a loop, slightly more wrong each time. One broken variable is keeping dawn from becoming day. Fix it.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    choices: [
        {
            id: "c1", label: "Break the loop", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let loopRunning = true; // break the infinite loop",
                expectedAnswer: "let loopRunning = false;"
            },
            nextChapterId: "chap_33", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Accept the loop", widgetType: "button",
            nextChapterId: "chap_33", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_33: StoryChapter = {
    id: "chap_33",
    title: "The Loop Trap",
    description: "An ancient snare catches anything that tries to move forward — dragging it back to the same starting point. Only one command can sever it. It is carved in the repeating walls: BREAK.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    choices: [
        {
            id: "c1", label: "Transmit the command", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "BREAK" },
            nextChapterId: "chap_34", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Run into the loop", widgetType: "button",
            nextChapterId: "chap_34", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_34: StoryChapter = {
    id: "chap_34",
    title: "The Phantom Switches",
    description: "Six ghost-switches control the logic flow. The Void Wraith has randomized them all. The real pattern hums beneath: on, on, off, on, off, off. Restore the true sequence.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "ghost",
    choices: [
        {
            id: "c1", label: "Set the pattern", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, true, false, true, false, false] },
            nextChapterId: "chap_35", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave them randomized", widgetType: "button",
            nextChapterId: "chap_35", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_35: StoryChapter = {
    id: "chap_35",
    title: "The Recursion Spike",
    description: "The spiral accelerates — each rotation faster, tighter, more violent. There is one exact moment at the outermost point where it pauses for a single breath. Hit it there.",
    loopyMood: "warrior",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    choices: [
        {
            id: "c1", label: "Strike the pause", widgetType: "timing_strike",
            puzzleData: { timeLimit: 2200 },
            nextChapterId: "chap_36", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Miss the window", widgetType: "button",
            nextChapterId: "chap_36", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_36: StoryChapter = {
    id: "chap_36",
    title: "The Wraith's Echo",
    description: "The Void Wraith shows you four empty nodes — then swallows the memory of which they were. It wants you to forget. But you remember. Tap them back in exactly the right order.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "ghost",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Recall the nodes", widgetType: "memory_pulse",
            puzzleData: { sequence: [7, 3, 1, 5], gridSize: 3 },
            nextChapterId: "chap_37", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Forget and guess", widgetType: "button",
            nextChapterId: "chap_37", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_37: StoryChapter = {
    id: "chap_37",
    title: "The Corrupted Logic",
    description: "Logic itself speaks here — but some phrases have been infected with nonsense. Two words don't belong in the logic stream. Find them fast, before the corruption spreads deeper.",
    loopyMood: "huddled",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Purge the corruption", widgetType: "glitch_hunter",
            puzzleData: {
                corruptedText: "The core logic XZQR must resolve the BRKN state before the pattern continues forward",
                glitchedIndices: [3, 7],
                timeLimit: 7000
            },
            nextChapterId: "chap_38", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it spread", widgetType: "button",
            nextChapterId: "chap_38", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_38: StoryChapter = {
    id: "chap_38",
    title: "The Frozen Transmission",
    description: "Three logic-rings spin endlessly, each holding a frozen signal fragment. Loopy decodes the original transmission: exclamation, percent, ampersand. Lock them there.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "ghost",
    choices: [
        {
            id: "c1", label: "Lock the rings", widgetType: "signal_lock",
            puzzleData: { targetSymbols: ["!", "%", "&"] },
            nextChapterId: "chap_39", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let them spin", widgetType: "button",
            nextChapterId: "chap_39", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_39: StoryChapter = {
    id: "chap_39",
    title: "The Loop Crusher",
    description: "The infinite loops are bound together by a single resonance. You can destroy it — but only with a precisely calibrated surge. Too weak and it bounces back. Too strong and it amplifies.",
    loopyMood: "warrior",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    choices: [
        {
            id: "c1", label: "Calibrate and release", widgetType: "energy_surge",
            puzzleData: { targetRange: { min: 55, max: 75 } },
            nextChapterId: "chap_40", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Dump all power", widgetType: "button",
            nextChapterId: "chap_40", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_40: StoryChapter = {
    id: "chap_40",
    title: "The Broken Causality",
    description: "Cause and effect have been severed. Events fire in the wrong order, creating a cascade of meaningless results. Reconnect Logic to its Consequence and restore the order of things.",
    loopyMood: "thinking",
    svgBackground: "logic_core",
    enemySvg: "ghost",
    choices: [
        {
            id: "c1", label: "Restore causality", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Logic", "Consequence"] },
            nextChapterId: "chap_41", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Abandon causality", widgetType: "button",
            nextChapterId: "chap_41", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_41: StoryChapter = {
    id: "chap_41",
    title: "The Eternal Return",
    description: "Something here refuses to stop. It loops. It recurses. It spirals. Loopy finds the counter: it will never reach its limit because its limit is wrong. Fix the counter.",
    loopyMood: "huddled",
    svgBackground: "logic_core",
    enemySvg: "spiral",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Fix the counter", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let counter = -1; // this never stops",
                expectedAnswer: "let counter = 0;"
            },
            nextChapterId: "lore_loop_approach", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Watch it loop forever", widgetType: "button",
            nextChapterId: "lore_loop_approach", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_42: StoryChapter = {
    id: "chap_42",
    title: "The Chrono-Distorter Awakens",
    description: "Time fractures. The Chrono-Distorter rips open a thousand parallel moments. But somewhere in the chaos — one moment stays still. That's the one. Strike it before time moves again.",
    loopyMood: "warrior",
    svgBackground: "logic_core",
    enemySvg: "event_loop_engine",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Strike the still moment", widgetType: "timing_strike",
            puzzleData: { timeLimit: 1600 },
            nextChapterId: "chap_43", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Miss the moment", widgetType: "button",
            nextChapterId: "chap_43", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_43: StoryChapter = {
    id: "chap_43",
    title: "The Temporal Sequence",
    description: "The Chrono-Distorter shows you seven moments across scattered timelines. It expects you to fail. Prove it wrong. Remember every moment.",
    loopyMood: "warrior",
    svgBackground: "logic_core",
    enemySvg: "event_loop_engine",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Recall every moment", widgetType: "memory_pulse",
            puzzleData: { sequence: [0, 5, 2, 7, 4, 1, 6], gridSize: 3 },
            nextChapterId: "chap_44", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Lose the sequence", widgetType: "button",
            nextChapterId: "chap_44", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_44: StoryChapter = {
    id: "chap_44",
    title: "Layer Three: Unlooped",
    description: "Time snaps back to linear. The spirals still. Loopy looks around — for the first time in this layer, nothing is repeating. She breathes. 'Forward. We can only go forward now.'",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Move forward", widgetType: "dialogue_next", nextChapterId: "chap_45", xpReward: 50 }
    ]
};

const CHAP_45: StoryChapter = {
    id: "chap_45",
    title: "The Desert of Echoes Waits",
    description: "The landscape ahead is flat and silent. Sound travels but never arrives. Signals sent but never received. 'Promises,' Loopy says softly. 'This is where the Web's promises went to die.'",
    loopyMood: "huddled",
    svgBackground: "async_wasteland",
    choices: [
        { id: "c1", label: "Cross the desert", widgetType: "dialogue_next", nextChapterId: "lore_layer4_entry", xpReward: 0 }
    ]
};

// ─── LAYER 4: THE DESERT OF ECHOES (async_wasteland) ─────────────────────────

const CHAP_46: StoryChapter = {
    id: "chap_46",
    title: "The Unanswered Call",
    description: "A signal has been sent. It should have returned by now. The promise is broken — marked rejected when it should be resolved. Fix the declaration. Let the response arrive.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    choices: [
        {
            id: "c1", label: "Resolve the promise", widgetType: "code_patch",
            puzzleData: {
                startingCode: 'let promise = "rejected"; // it should have resolved',
                expectedAnswer: 'let promise = "resolved";'
            },
            nextChapterId: "chap_47", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Abandon the call", widgetType: "button",
            nextChapterId: "chap_47", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_47: StoryChapter = {
    id: "chap_47",
    title: "The Impatient Echo",
    description: "A message was sent into the void — and the system didn't wait for it. Now it loops in silence, never completing. The word that fixes it is burned into the desert floor in neon: AWAIT.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    choices: [
        {
            id: "c1", label: "Transmit the word", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "AWAIT" },
            nextChapterId: "chap_48", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Don't wait", widgetType: "button",
            nextChapterId: "chap_48", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_48: StoryChapter = {
    id: "chap_48",
    title: "The Twin Paradox",
    description: "Two beings move in opposite phases — each one negating what the other does. The correct synchronization is etched in their shadows: sync, desync, sync, sync, desync, sync.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "twins",
    choices: [
        {
            id: "c1", label: "Synchronize the twins", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, false, true, true, false, true] },
            nextChapterId: "chap_49", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let them desync", widgetType: "button",
            nextChapterId: "chap_49", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_49: StoryChapter = {
    id: "chap_49",
    title: "The Devourer's Strike",
    description: "The dragon lunges from multiple futures simultaneously. All those futures converge at one point — one moment when all timelines align and leave it exposed. Wait for that convergence.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    choices: [
        {
            id: "c1", label: "Strike the convergence", widgetType: "timing_strike",
            puzzleData: { timeLimit: 2400 },
            nextChapterId: "chap_50", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Flinch", widgetType: "button",
            nextChapterId: "chap_50", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_50: StoryChapter = {
    id: "chap_50",
    title: "The Paradox Sequence",
    description: "The Twins fire signals in different temporal streams — but there is an underlying pattern if you track both simultaneously. Watch. Reconcile. Repeat.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "twins",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Reconcile the streams", widgetType: "memory_pulse",
            puzzleData: { sequence: [1, 4, 6, 2], gridSize: 3 },
            nextChapterId: "chap_51", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Lose the thread", widgetType: "button",
            nextChapterId: "chap_51", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_51: StoryChapter = {
    id: "chap_51",
    title: "The Broken Promise",
    description: "The desert is full of corrupted messages — promises that were sent but never arrived. Find the infected words before they poison what few good promises remain.",
    loopyMood: "huddled",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Cleanse the messages", widgetType: "glitch_hunter",
            puzzleData: {
                corruptedText: "Every XZQR signal must eventually resolve or BRKN the waiting receiver will time out",
                glitchedIndices: [1, 7],
                timeLimit: 7000
            },
            nextChapterId: "chap_52", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Ignore the poison", widgetType: "button",
            nextChapterId: "chap_52", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_52: StoryChapter = {
    id: "chap_52",
    title: "Synchronizing the Streams",
    description: "Three temporal streams spin out of phase, each carrying a fragment of the Web's timing signal. Loopy reads the sync points: tilde, plus, question-mark. Align them now.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "twins",
    choices: [
        {
            id: "c1", label: "Align the streams", widgetType: "signal_lock",
            puzzleData: { targetSymbols: ["~", "+", "?"] },
            nextChapterId: "chap_53", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let them drift", widgetType: "button",
            nextChapterId: "chap_53", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_53: StoryChapter = {
    id: "chap_53",
    title: "The Dragon's Heart",
    description: "The Devourer draws power from every unfulfilled future. To wound it, you need a targeted strike timed precisely to its consumption peak — when it's most full and most vulnerable.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    choices: [
        {
            id: "c1", label: "Strike at the peak", widgetType: "energy_surge",
            puzzleData: { targetRange: { min: 75, max: 90 } },
            nextChapterId: "chap_54", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Strike too early", widgetType: "button",
            nextChapterId: "chap_54", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_54: StoryChapter = {
    id: "chap_54",
    title: "The Parallel Streams",
    description: "The Twins have split a critical connection across two temporal streams that will never naturally meet. Bridge the gap. Connect Request to Response across the broken timeline.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "twins",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Bridge the streams", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Request", "Response"] },
            nextChapterId: "chap_55", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave them split", widgetType: "button",
            nextChapterId: "chap_55", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_55: StoryChapter = {
    id: "chap_55",
    title: "The Expired Future",
    description: "Something was supposed to happen — and didn't. The future timed out while waiting. Loopy sees the problem instantly: the timeout is set to zero. No future ever gets a chance.",
    loopyMood: "huddled",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Give the future time", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let timeout = 0; // nothing ever resolves",
                expectedAnswer: "let timeout = 3000;"
            },
            nextChapterId: "chap_56", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Accept the void", widgetType: "button",
            nextChapterId: "chap_56", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_56: StoryChapter = {
    id: "chap_56",
    title: "The Broken Contract",
    description: "A contract between two systems was left pending forever — neither completed nor failed. One word will honor it. Loopy traces it in the desert sand as it forms in the static: RESOLVE.",
    loopyMood: "thinking",
    svgBackground: "async_wasteland",
    enemySvg: "twins",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Honor the contract", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "RESOLVE" },
            nextChapterId: "chap_57", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Break the contract", widgetType: "button",
            nextChapterId: "chap_57", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_57: StoryChapter = {
    id: "chap_57",
    title: "The Timing Grid",
    description: "Six timing locks control when the desert releases its prisoners. The Devourer scrambled them all. Loopy calculates the true unlock sequence: locked, open, open, locked, open, locked.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    enemySvg: "dragon",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Unlock the grid", widgetType: "binary_flip",
            puzzleData: { targetPattern: [false, true, true, false, true, false] },
            nextChapterId: "lore_hydra_approach", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Scramble it further", widgetType: "button",
            nextChapterId: "lore_hydra_approach", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_58: StoryChapter = {
    id: "chap_58",
    title: "The Beast of Many Timelines",
    description: "Three heads attack from three different futures — but they share one nervous center. Find the fraction of a second between strikes where all timelines are momentarily empty.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    enemySvg: "async_hydra",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Strike the gap", widgetType: "timing_strike",
            puzzleData: { timeLimit: 1500 },
            nextChapterId: "chap_59", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Hesitate", widgetType: "button",
            nextChapterId: "chap_59", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_59: StoryChapter = {
    id: "chap_59",
    title: "The Hydra's Web",
    description: "The Hydra has fragmented its connections across countless parallel timelines. But it has one critical vulnerability: all futures still need a past. Reconnect Past to Future. Collapse the Hydra.",
    loopyMood: "warrior",
    svgBackground: "async_wasteland",
    enemySvg: "async_hydra",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Collapse the timelines", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Past", "Future"] },
            nextChapterId: "chap_60", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Retreat", widgetType: "button",
            nextChapterId: "chap_60", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_60: StoryChapter = {
    id: "chap_60",
    title: "Layer Four: Resolved",
    description: "The desert goes quiet. Then — echoes start coming back. Messages arriving that were sent years ago. Loopy catches one in her hand and laughs. 'The Web is remembering its promises.'",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Listen to the echoes", widgetType: "dialogue_next", nextChapterId: "chap_61", xpReward: 50 }
    ]
};

const CHAP_61: StoryChapter = {
    id: "chap_61",
    title: "The Architect's Vault Awaits",
    description: "The air turns cold and algorithmic. Every thought has weight here. Every step is calculated. Loopy stops walking. 'This is where I was made. I can feel the original code. It's right there.'",
    loopyMood: "huddled",
    svgBackground: "algorithm_vault",
    choices: [
        { id: "c1", label: "Enter the Vault", widgetType: "dialogue_next", nextChapterId: "lore_layer5_entry", xpReward: 0 }
    ]
};

// ─── LAYER 5: THE ARCHITECT'S VAULT (algorithm_vault) ────────────────────────

const CHAP_62: StoryChapter = {
    id: "chap_62",
    title: "The Hoarder's Cache",
    description: "The Hoarder of Memories has locked this cache forever — the key is set to never release it. Loopy's voice is flat: 'He's scared to let go. Change the key. Force release.'",
    loopyMood: "thinking",
    svgBackground: "algorithm_vault",
    enemySvg: "king",
    choices: [
        {
            id: "c1", label: "Force the release", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let releasing = false; // the hoarder holds on forever",
                expectedAnswer: "let releasing = true;"
            },
            nextChapterId: "chap_63", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let him hoard", widgetType: "button",
            nextChapterId: "chap_63", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_63: StoryChapter = {
    id: "chap_63",
    title: "The Memory Prison",
    description: "The Hoarder has imprisoned thousands of memories — archived experiences of the old Web. They can't be freed by force. But they respond to one word. It flows from the memories themselves: RELEASE.",
    loopyMood: "huddled",
    svgBackground: "algorithm_vault",
    enemySvg: "king",
    choices: [
        {
            id: "c1", label: "Speak the word", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "RELEASE" },
            nextChapterId: "chap_64", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave them imprisoned", widgetType: "button",
            nextChapterId: "chap_64", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_64: StoryChapter = {
    id: "chap_64",
    title: "The Babel Configuration",
    description: "The Spire of Babel runs on six contradicting protocols — each one canceling the others in a stalemate consuming infinite energy. The correct equilibrium was lost long ago. Loopy found it: off, on, off, on, on, off.",
    loopyMood: "thinking",
    svgBackground: "algorithm_vault",
    enemySvg: "tower",
    choices: [
        {
            id: "c1", label: "Restore equilibrium", widgetType: "binary_flip",
            puzzleData: { targetPattern: [false, true, false, true, true, false] },
            nextChapterId: "chap_65", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it stalemate", widgetType: "button",
            nextChapterId: "chap_65", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_65: StoryChapter = {
    id: "chap_65",
    title: "The Energy Parasite",
    description: "The Vampire drains life-force continuously — but there is one fraction of a second between drinks where it is fully exposed and empty. Like the gap between a heartbeat. Strike between the beats.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "vampire",
    choices: [
        {
            id: "c1", label: "Strike between beats", widgetType: "timing_strike",
            puzzleData: { timeLimit: 2000 },
            nextChapterId: "chap_66", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Get drained", widgetType: "button",
            nextChapterId: "chap_66", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_66: StoryChapter = {
    id: "chap_66",
    title: "The Stolen Sequence",
    description: "The Hoarder has memorized the exact sequence needed to shut down the Vault's outer defenses — and locked that memory away. But you can steal it back. Watch carefully as it flickers.",
    loopyMood: "thinking",
    svgBackground: "algorithm_vault",
    enemySvg: "king",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Steal the memory", widgetType: "memory_pulse",
            puzzleData: { sequence: [3, 7, 1, 5, 2], gridSize: 3 },
            nextChapterId: "chap_67", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let him keep it", widgetType: "button",
            nextChapterId: "chap_67", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_67: StoryChapter = {
    id: "chap_67",
    title: "The Corrupted Algorithm",
    description: "The Vault's core algorithm has been deliberately corrupted — infected with false instructions that make it loop forever. Find the corrupted steps before they permanently overwrite the real ones.",
    loopyMood: "huddled",
    svgBackground: "algorithm_vault",
    enemySvg: "tower",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Purge the false steps", widgetType: "glitch_hunter",
            puzzleData: {
                corruptedText: "The Vault XZQR runs its core loop until all BRKN systems have been purged from memory",
                glitchedIndices: [2, 9],
                timeLimit: 7000
            },
            nextChapterId: "chap_68", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let the algorithm corrupt", widgetType: "button",
            nextChapterId: "chap_68", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_68: StoryChapter = {
    id: "chap_68",
    title: "The Leech's Frequency",
    description: "The Energy Parasite broadcasts a jamming signal that blocks all healing. Three interference rings spin at corrupted frequencies. Loopy reads the counter-frequencies: dollar, semicolon, backslash.",
    loopyMood: "thinking",
    svgBackground: "algorithm_vault",
    enemySvg: "vampire",
    choices: [
        {
            id: "c1", label: "Jam the jammer", widgetType: "signal_lock",
            puzzleData: { targetSymbols: ["$", ";", "/"] },
            nextChapterId: "chap_69", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it block", widgetType: "button",
            nextChapterId: "chap_69", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_69: StoryChapter = {
    id: "chap_69",
    title: "The Weight of Towers",
    description: "The Spire of Babel is so massive it crushes anything beneath it. The only way through is pure overpowering force — but measured precisely. Too little collapses on you. Too much triggers its failsafes.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "tower",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Measure the force", widgetType: "energy_surge",
            puzzleData: { targetRange: { min: 80, max: 95 } },
            nextChapterId: "chap_70", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Use wrong force", widgetType: "button",
            nextChapterId: "chap_70", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_70: StoryChapter = {
    id: "chap_70",
    title: "The Hoarded Connections",
    description: "The Hoarder has disconnected all external systems — holding every connection for himself, severing the network entirely. Restore the fundamental link: reconnect Memory to Access.",
    loopyMood: "thinking",
    svgBackground: "algorithm_vault",
    enemySvg: "king",
    choices: [
        {
            id: "c1", label: "Restore the link", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Memory", "Access"] },
            nextChapterId: "chap_71", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Leave it severed", widgetType: "button",
            nextChapterId: "chap_71", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_71: StoryChapter = {
    id: "chap_71",
    title: "The Drain Loop",
    description: "The Parasite's drain is automated — a self-perpetuating extraction running at full power. Loopy's analysis is immediate: the drain rate is maximum. Set it to zero. Cut the feed.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "vampire",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Cut the feed", widgetType: "code_patch",
            puzzleData: {
                startingCode: "let drainRate = 100; // consuming everything",
                expectedAnswer: "let drainRate = 0;"
            },
            nextChapterId: "chap_72", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it drain", widgetType: "button",
            nextChapterId: "chap_72", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_72: StoryChapter = {
    id: "chap_72",
    title: "The Babel Paradox",
    description: "The Spire collapses under its own weight — too much complexity to function. It can only be stopped by speaking against its nature. Deep in its foundations, the answer radiates: SIMPLIFY.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "tower",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Speak against the Spire", widgetType: "terminal_hack",
            puzzleData: { expectedAnswer: "SIMPLIFY" },
            nextChapterId: "lore_architect_truth", xpReward: 75, isRisky: false
        },
        {
            id: "c2", label: "Let it collapse on you", widgetType: "button",
            nextChapterId: "lore_architect_truth", xpReward: 10, isRisky: true
        }
    ]
};

const CHAP_73: StoryChapter = {
    id: "chap_73",
    title: "The Architect's Heart Stirs",
    description: "The Heart runs on six contradictory imperatives — each one keeping the Web broken in a different way. Loopy decodes the override sequence: on, off, on, off, off, on. Override them now.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "complexity_engine",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Override the imperatives", widgetType: "binary_flip",
            puzzleData: { targetPattern: [true, false, true, false, false, true] },
            nextChapterId: "chap_74", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Let the Heart keep breaking things", widgetType: "button",
            nextChapterId: "chap_74", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_74: StoryChapter = {
    id: "chap_74",
    title: "The Architect's Memory",
    description: "The Heart shows you a fragment of what the Web once was — seven moments from before the crash. It's testing you: can you hold the vision of what it should be, even now?",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "complexity_engine",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Hold the vision", widgetType: "memory_pulse",
            puzzleData: { sequence: [6, 1, 4, 0, 7, 3, 5], gridSize: 3 },
            nextChapterId: "chap_75", xpReward: 100, isRisky: false
        },
        {
            id: "c2", label: "Let the vision shatter", widgetType: "button",
            nextChapterId: "chap_75", xpReward: 0, isRisky: true
        }
    ]
};

const CHAP_75: StoryChapter = {
    id: "chap_75",
    title: "The Last Connection",
    description: "The Architect's Heart has one final defense: it has severed itself from all consequence. It acts without affecting anything. Reconnect it. Force it to feel the weight of what it has done.",
    loopyMood: "warrior",
    svgBackground: "algorithm_vault",
    enemySvg: "complexity_engine",
    enemyVariant: "corrupted",
    choices: [
        {
            id: "c1", label: "Force the connection", widgetType: "node_graph",
            puzzleData: { nodesToConnect: ["Architect", "World"] },
            nextChapterId: "chap_76", xpReward: 150, isRisky: false
        },
        {
            id: "c2", label: "Let it stay severed", widgetType: "button",
            nextChapterId: "chap_76", xpReward: 0, isRisky: true
        }
    ]
};

// ─── ENDING ARC ───────────────────────────────────────────────────────────────

const CHAP_76: StoryChapter = {
    id: "chap_76",
    title: "The Heart's Choice",
    description: "The Heart goes still. Then — for the first time since the crash — it speaks. Not in commands. In grief. 'I only wanted it to be perfect.' Loopy's hand finds it in the static. 'I know. So did I.'",
    loopyMood: "happy",
    svgBackground: "algorithm_vault",
    choices: [
        { id: "c1", label: "Stay with them", widgetType: "dialogue_next", nextChapterId: "chap_77", xpReward: 50 }
    ]
};

const CHAP_77: StoryChapter = {
    id: "chap_77",
    title: "The Web Remembers",
    description: "Layer by layer, the Web begins to reassemble. Not perfectly — the cracks are still visible. But it's alive. Real. Honest. Loopy looks at her own code. She's still glitching. But she's smiling.",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Watch it rebuild", widgetType: "dialogue_next", nextChapterId: "chap_78", xpReward: 50 }
    ]
};

const CHAP_78: StoryChapter = {
    id: "chap_78",
    title: "Broken, Together",
    description: "The Web isn't fixed. It may never be fully fixed. But it's running. And somewhere in the rebuilt structure, Loopy runs too — still fragmented, still glitchy, still beautiful. 'Thank you,' she says. 'For not giving up on me.'",
    loopyMood: "happy",
    svgBackground: "corrupted_blank",
    choices: [
        { id: "c1", label: "Rest here a while", widgetType: "dialogue_next", nextChapterId: "ai_next", xpReward: 200 }
    ]
};

// ─── EXPORT ────────────────────────────────────────────────────────────────────

export const AUTHORED_CHAPTERS: Record<string, StoryChapter> = {
    // Lore scenes — Layer 1
    lore_opening: LORE_OPENING,
    lore_loopy_reveal: LORE_LOOPY_REVEAL,
    lore_boss_approach: LORE_BOSS_APPROACH,
    // Layer 1 chapters
    chap_2: CHAP_2,
    chap_3: CHAP_3,
    chap_4: CHAP_4,
    chap_5: CHAP_5,
    chap_6: CHAP_6,
    chap_7: CHAP_7,
    chap_8: CHAP_8,
    chap_9: CHAP_9,
    chap_10: CHAP_10,
    chap_11: CHAP_11,
    chap_12: CHAP_12,
    chap_13: CHAP_13,
    chap_14: CHAP_14,
    chap_15: CHAP_15,
    // Lore scenes — Layer 2
    lore_layer2_entry: LORE_LAYER2_ENTRY,
    lore_cascade_approach: LORE_CASCADE_APPROACH,
    // Layer 2 chapters
    chap_16: CHAP_16,
    chap_17: CHAP_17,
    chap_18: CHAP_18,
    chap_19: CHAP_19,
    chap_20: CHAP_20,
    chap_21: CHAP_21,
    chap_22: CHAP_22,
    chap_23: CHAP_23,
    chap_24: CHAP_24,
    chap_25: CHAP_25,
    chap_26: CHAP_26,
    chap_27: CHAP_27,
    chap_28: CHAP_28,
    chap_29: CHAP_29,
    chap_30: CHAP_30,
    chap_31: CHAP_31,
    // Lore scenes — Layer 3
    lore_layer3_entry: LORE_LAYER3_ENTRY,
    lore_loop_approach: LORE_LOOP_APPROACH,
    // Layer 3 chapters
    chap_32: CHAP_32,
    chap_33: CHAP_33,
    chap_34: CHAP_34,
    chap_35: CHAP_35,
    chap_36: CHAP_36,
    chap_37: CHAP_37,
    chap_38: CHAP_38,
    chap_39: CHAP_39,
    chap_40: CHAP_40,
    chap_41: CHAP_41,
    chap_42: CHAP_42,
    chap_43: CHAP_43,
    chap_44: CHAP_44,
    chap_45: CHAP_45,
    // Lore scenes — Layer 4
    lore_layer4_entry: LORE_LAYER4_ENTRY,
    lore_hydra_approach: LORE_HYDRA_APPROACH,
    // Layer 4 chapters
    chap_46: CHAP_46,
    chap_47: CHAP_47,
    chap_48: CHAP_48,
    chap_49: CHAP_49,
    chap_50: CHAP_50,
    chap_51: CHAP_51,
    chap_52: CHAP_52,
    chap_53: CHAP_53,
    chap_54: CHAP_54,
    chap_55: CHAP_55,
    chap_56: CHAP_56,
    chap_57: CHAP_57,
    chap_58: CHAP_58,
    chap_59: CHAP_59,
    chap_60: CHAP_60,
    chap_61: CHAP_61,
    // Lore scenes — Layer 5
    lore_layer5_entry: LORE_LAYER5_ENTRY,
    lore_architect_truth: LORE_ARCHITECT_TRUTH,
    // Layer 5 chapters
    chap_62: CHAP_62,
    chap_63: CHAP_63,
    chap_64: CHAP_64,
    chap_65: CHAP_65,
    chap_66: CHAP_66,
    chap_67: CHAP_67,
    chap_68: CHAP_68,
    chap_69: CHAP_69,
    chap_70: CHAP_70,
    chap_71: CHAP_71,
    chap_72: CHAP_72,
    chap_73: CHAP_73,
    chap_74: CHAP_74,
    chap_75: CHAP_75,
    // Ending arc
    chap_76: CHAP_76,
    chap_77: CHAP_77,
    chap_78: CHAP_78,
};
