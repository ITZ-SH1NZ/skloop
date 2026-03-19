import { createClient } from "@/utils/supabase/client";

export const fetchUserTasks = async ([key, userId]: [string, string]) => {
    const { getUserTasks } = await import("@/actions/task-actions");
    return await getUserTasks(userId);
};

export const fetchCourseTrack = async ([key, courseId, userId]: [string, string, string]) => {
    const supabase = createClient();

    // ── Try 1: Look in the `courses` table by slug ──
    const { data: course } = await supabase
        .from("courses")
        .select("id, title, total_lessons")
        .eq("slug", courseId)
        .maybeSingle();

    if (course) {
        const { data: lessons } = await supabase
            .from("lessons")
            .select("id, title, order_index, content, video_url")
            .eq("course_id", course.id)
            .order("order_index", { ascending: true });

        let completedLessonIds = new Set<string>();
        if (userId && lessons) {
            const { data: progress } = await supabase
                .from("user_lesson_progress")
                .select("lesson_id")
                .eq("user_id", userId)
                .in("lesson_id", lessons.map((l) => l.id));
            if (progress) completedLessonIds = new Set(progress.map((p) => p.lesson_id));
        }

        const lessonList = lessons ?? [];
        const completedCount = lessonList.filter((l) => completedLessonIds.has(l.id)).length;
        const progress = lessonList.length > 0
            ? Math.round((completedCount / lessonList.length) * 100)
            : 0;

        let isPreviousLessonCompleted = true;
        const LESSONS_PER_MODULE = 4;
        const builtModules: any = [];
        for (let i = 0; i < lessonList.length; i += LESSONS_PER_MODULE) {
            const chunk = lessonList.slice(i, i + LESSONS_PER_MODULE);
            const moduleNum = Math.floor(i / LESSONS_PER_MODULE) + 1;
            const moduleLessons = chunk.map((l) => {
                const completed = completedLessonIds.has(l.id);
                const locked = !isPreviousLessonCompleted;
                isPreviousLessonCompleted = completed;
                return {
                    id: l.id,
                    title: l.title,
                    order_index: l.order_index,
                    isCompleted: completed,
                    type: l.video_url ? "video" : "article",
                    duration: (l as any).content_data?.duration || (l as any).content_data?.readTime || "10 min",
                    isLocked: locked,
                };
            });
            const allDone = moduleLessons.every((l) => l.isCompleted);
            const anyDone = moduleLessons.some((l) => l.isCompleted);
            builtModules.push({
                id: moduleNum,
                title: `Module ${moduleNum}`,
                description: chunk[0]?.content || `Continue your learning journey in this module.`,
                lessons: moduleLessons,
                status: allDone ? "completed" : anyDone ? "in-progress" : "in-progress",
            });
        }

        const firstActive = builtModules.find((m: any) => m.status === "in-progress");
        const activeModuleId = firstActive?.id ?? builtModules[0]?.id ?? 0;
        const firstUncompleted = lessonList.find((l) => !completedLessonIds.has(l.id)) || lessonList[0];

        return {
            trackData: {
                title: course.title,
                progress,
                totalModules: builtModules.length,
                completedModules: builtModules.filter((m: any) => m.status === "completed").length,
                currentLesson: {
                    id: firstUncompleted?.id ?? "",
                    title: firstUncompleted?.title ?? "Start Learning",
                },
            },
            modules: builtModules,
            activeModuleId
        };
    }

    // ── Try 2: Fall back to the `tracks` table ──
    const { data: track } = await supabase
        .from("tracks")
        .select("id, title")
        .eq("slug", courseId)
        .maybeSingle();

    if (!track) return null;

    const { data: dbModules } = await supabase
        .from("modules")
        .select("id, title, description, order_index")
        .eq("track_id", track.id)
        .order("order_index");

    if (!dbModules || dbModules.length === 0) return null;

    const { data: topics } = await supabase
        .from("topics")
        .select("id, module_id, title, order_index, type, content_data")
        .in("module_id", dbModules.map((m) => m.id))
        .order("order_index", { ascending: true });

    let completedTopicIds = new Set<string>();
    if (userId && topics) {
        const { data: progress } = await supabase
            .from("user_topic_progress")
            .select("topic_id")
            .eq("user_id", userId)
            .eq("status", "completed")
            .in("topic_id", topics.map((t) => t.id));
        if (progress) completedTopicIds = new Set(progress.map((p) => p.topic_id));
    }

    const totalTopics = topics?.length ?? 0;
    const completedCount = topics?.filter((t) => completedTopicIds.has(t.id)).length ?? 0;
    const progress = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

    let isPreviousLessonCompleted = true;

    const builtModules = dbModules.map((mod, idx) => {
        const modTopics = (topics ?? []).filter((t) => t.module_id === mod.id);
        const moduleLessons = modTopics.map((t) => {
            const completed = completedTopicIds.has(t.id);
            const locked = !isPreviousLessonCompleted;
            isPreviousLessonCompleted = completed;
            return {
                id: t.id,
                title: t.title,
                order_index: t.order_index,
                isCompleted: completed,
                type: t.type as any,
                duration: (t.content_data as any)?.duration || (t.content_data as any)?.readTime || "10 min",
                isLocked: locked,
            };
        });
        const allDone = moduleLessons.every((l) => l.isCompleted);
        const anyDone = moduleLessons.some((l) => l.isCompleted);
        return {
            id: idx + 1,
            title: mod.title,
            description: mod.description || `Module ${idx + 1}`,
            lessons: moduleLessons,
            status: allDone ? "completed" : anyDone ? "in-progress" : "in-progress",
        };
    });

    const firstActive = builtModules.find((m: any) => m.status === "in-progress");
    const activeModuleId = firstActive?.id ?? builtModules[0]?.id ?? 0;
    const firstUncompletedTopic = topics?.find((t) => !completedTopicIds.has(t.id)) || topics?.[0];

    return {
        trackData: {
            title: track.title,
            progress,
            totalModules: builtModules.length,
            completedModules: builtModules.filter((m: any) => m.status === "completed").length,
            currentLesson: {
                id: firstUncompletedTopic?.id ?? "",
                title: firstUncompletedTopic?.title ?? "Start Learning",
            },
        },
        modules: builtModules,
        activeModuleId
    };
};

export const fetchLesson = async ([key, lessonId]: [string, string]) => {
    const { LESSON_CONTENT_MAP } = await import("./mock-lesson-data");

    // 1. Check local mock map first
    const localData = LESSON_CONTENT_MAP[lessonId];
    if (localData) {
        return localData;
    }

    const supabase = createClient();

    // 2. Fetch from Supabase 'topics' table
    const { data: topic } = await supabase
        .from("topics")
        .select("*, module:modules(track:tracks(slug))")
        .eq("id", lessonId)
        .maybeSingle();

    if (topic) {
        const content = topic.content_data || {};
        return {
            id: topic.id,
            title: topic.title,
            moduleTitle: "Track Lesson", // Fallback
            type: content.challengeType === 'flowchart' ? 'flowchart' : topic.type,
            videoUrl: content.youtubeId ? `https://www.youtube.com/embed/${content.youtubeId}` : undefined,
            summary: content.summary,
            content: content.markdown || content.content || "",
            description: content.instructions || content.description,
            requirements: content.requirements || [],
            hints: content.hints || [],
            initialCode: content.initialCode || {
                html: content.initialHtml || "",
                css: content.initialCss || "",
                js: content.initialJs || ""
            },
            mode: content.mode || "web",
            questions: content.questions || [],
            validationRules: content.validationRules || [],
            trackSlug: topic.module?.track?.slug || "web-development",
            flowchartTask: content.task,
            requiredNodes: content.requiredNodes || [],
            miniQuiz: content.miniQuiz || []
        };
    }

    // 3. Fallback to `lessons` table
    const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .maybeSingle();

    if (lessonData) {
        return {
            id: lessonData.id,
            title: lessonData.title,
            moduleTitle: "Course Lesson",
            type: "article",
            videoUrl: lessonData.video_url,
            content: lessonData.content || "",
        };
    }

    // 4. Fallback to error UI
    return {
        id: lessonId,
        title: "Lesson Not Found",
        moduleTitle: "Unknown Module",
        type: "article",
        content: `<p>We couldn't find lesson data for ID <strong>${lessonId}</strong>.</p>`
    };
};

export interface PeerProfile {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    track: string;
    level: number;
    xp: number;
    streak: number;
    status: "friend" | "pending_incoming" | "pending_outgoing" | "none";
    isOnline?: boolean;
}

export interface StudyCircle {
    id: string;
    name: string;
    avatarUrl?: string;
    topic: string;
    description: string;
    memberCount: number;
    maxMembers: number;
    tags: string[];
    isJoined: boolean;
}

export const fetchStudyCircles = async ([key, userId]: [string, string]): Promise<StudyCircle[]> => {
    const supabase = createClient();

    // Fetch public group conversations
    const { data: convos } = await supabase
        .from('conversations')
        .select('id, title, description, tags, avatar_url, privacy')
        .eq('type', 'group')
        .eq('privacy', 'public')
        .order('created_at', { ascending: false });

    if (!convos) return [];

    const convoIds = convos.map(c => c.id);

    const { data: participants } = await supabase
        .from('conversation_participants')
        .select('conversation_id, user_id')
        .in('conversation_id', convoIds);

    const countMap = new Map<string, { count: number; isJoined: boolean }>();
    if (participants) {
        for (const p of participants) {
            const existing = countMap.get(p.conversation_id) || { count: 0, isJoined: false };
            existing.count += 1;
            if (p.user_id === userId) existing.isJoined = true;
            countMap.set(p.conversation_id, existing);
        }
    }

    return convos.map(c => {
        const stats = countMap.get(c.id) || { count: 0, isJoined: false };
        return {
            id: c.id,
            name: c.title || 'Unnamed Circle',
            avatarUrl: c.avatar_url || undefined,
            topic: c.tags?.[0] || 'General',
            description: c.description || 'A study circle for eager learners.',
            memberCount: stats.count,
            maxMembers: 50,
            tags: c.tags || [],
            isJoined: stats.isJoined,
        };
    });
};

export const fetchPeers = async ([key, userId]: [string, string]): Promise<PeerProfile[]> => {
    const supabase = createClient();

    // Fetch Connections
    const { data: connections } = await supabase
        .from('connections')
        .select('*')
        .or(`requester_id.eq.${userId},recipient_id.eq.${userId}`);

    if (!connections) return [];

    // Get all unique user IDs from connections (excluding self)
    const peerIds = new Set<string>();
    connections.forEach(conn => {
        if (conn.requester_id !== userId) peerIds.add(conn.requester_id);
        if (conn.recipient_id !== userId) peerIds.add(conn.recipient_id);
    });

    if (peerIds.size === 0) return [];

    // Fetch Profiles
    const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .in('id', Array.from(peerIds));

    if (!profiles) return [];

    return profiles.map(p => {
        // Find the connection relationship
        const conn = connections.find(c =>
            (c.requester_id === userId && c.recipient_id === p.id) ||
            (c.recipient_id === userId && c.requester_id === p.id)
        );

        let status: PeerProfile["status"] = "none";
        if (conn) {
            if (conn.status === 'accepted') status = "friend";
            else if (conn.status === 'pending') {
                if (conn.requester_id === userId) status = "pending_outgoing";
                else status = "pending_incoming";
            }
        }

    return {
        id: p.id,
        name: p.full_name || p.username || 'Unknown',
        username: p.username || `user_${p.id.substring(0, 5)}`,
        avatarUrl: p.avatar_url || undefined,
        track: p.role || "Learner",
        level: p.level || 1,
        xp: p.xp || 0,
        streak: p.streak || 0,
        status,
        isOnline: false
    };
});
};

export interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    username: string;
    avatarUrl: string;
    xp: number;
    coins: number;
    streak: number;
    trend: "up" | "down" | "same";
}

export const fetchGlobalLeaderboard = async ([key, metric]: [string, "xp" | "coins"]): Promise<LeaderboardUser[]> => {
    const { getGlobalLeaderboard } = await import("@/actions/leaderboard-actions");
    return await getGlobalLeaderboard(metric);
};

export const fetchFriendsLeaderboard = async ([key, userId, metric]: [string, string, "xp" | "coins"]): Promise<LeaderboardUser[]> => {
    const { getFriendsLeaderboard } = await import("@/actions/leaderboard-actions");
    return await getFriendsLeaderboard(userId, metric);
};

export const fetchUserRank = async ([key, userId, metric]: [string, string, "xp" | "coins"]) => {
    const { getUserRank } = await import("@/actions/leaderboard-actions");
    return await getUserRank(userId, metric);
};

export interface ShopData {
    coins: number;
    inventory: string[];
    streakShields: number;
    items: any[];
}

export const fetchShopData = async ([key, userId]: [string, string]): Promise<ShopData | null> => {
    const supabase = createClient();
    
    // 1. Fetch User Profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("coins, inventory, streak_shields")
        .eq("id", userId)
        .single();
        
    // 2. Fetch Shop Items from DB
    const { data: shopItems, error } = await supabase
        .from("shop_items")
        .select("*")
        .order("price", { ascending: true });

    if (!profile || error || !shopItems) return null;

    return {
        coins: profile.coins || 0,
        inventory: profile.inventory || [],
        streakShields: profile.streak_shields || 0,
        items: shopItems
    };
};

export const fetchUserProfile = async ([key, userId]: [string, string]) => {
    const supabase = createClient();
    const { data: profile, error } = await supabase
        .from('profiles')
        .select('full_name, username, bio, avatar_url')
        .eq('id', userId)
        .single();
    
    if (error) return null;
    return profile;
};

export const fetchPracticeStats = async ([key, userId]: [string, string]) => {
    const { getPracticeStats } = await import("@/actions/practice-actions");
    return await getPracticeStats();
};

export const fetchCodeleStats = async ([key, userId]: [string, string]) => {
    const { getCodeleStats } = await import("@/actions/codele-actions");
    return await getCodeleStats();
};

export const fetchCodeleLeaderboard = async ([key]: [string]) => {
    const { getCodeleLeaderboard } = await import("@/actions/codele-actions");
    return await getCodeleLeaderboard('global');
};

export const fetchWorkspaceProjects = async ([key, userId]: [string, string]) => {
    const { createClient } = await import("@/utils/supabase/client");
    const supabase = createClient();
    
    const { data, error } = await supabase
        .from('project_members')
        .select(`
            project_id,
            projects (
                id,
                title,
                description,
                status,
                color,
                created_at
            )
        `)
        .eq('user_id', userId);

    if (error || !data) throw error;
    
    return data.map((item: any) => ({
        ...item.projects,
        members: 1, // Placeholder until a member count aggregation is performed
        deadline: "7 days" // Local UI placeholder
    }));
};
