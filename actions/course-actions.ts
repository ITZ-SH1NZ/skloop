"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Fetches the primary course or track for the user's dashboard hero
 */
export async function getHeroCourse(userId: string) {
    try {
        const supabase = await createClient();

        // 1. Check for started courses
        const { data, error } = await supabase
            .from('user_courses')
            .select(`
                completed_lessons,
                courses (
                    title,
                    slug,
                    description,
                    total_lessons
                )
            `)
            .eq('user_id', userId)
            .order('last_accessed', { ascending: false })
            .limit(1)
            .maybeSingle();

        if (error) {
            console.error("Error fetching user_courses:", error.message);
        }

        if (data && !error) {
            const courseData = Array.isArray(data.courses) ? data.courses[0] : data.courses as any;
            if (courseData) {
                return {
                    title: courseData.title,
                    description: courseData.description,
                    slug: courseData.slug,
                    completedLessons: data.completed_lessons,
                    totalLessons: courseData.total_lessons,
                    type: 'course'
                };
            }
        }

        // 2. Fallback to check tracks system
        const { data: trackData, error: trackError } = await supabase
            .from('tracks')
            .select('title, slug, description')
            .order('order_index', { ascending: true })
            .limit(1)
            .maybeSingle();

        if (trackError) {
            console.error("Error fetching tracks (fallback):", trackError.message);
            console.error("If this table is missing, please run 'tracks_schema.sql' in Supabase SQL Editor.");
        }

        if (trackData && !trackError) {
            return {
                title: trackData.title,
                description: trackData.description,
                slug: trackData.slug,
                completedLessons: 0,
                totalLessons: 10, // Placeholder or fetch actual topic count
                type: 'track'
            };
        }
    } catch (err: any) {
        console.error("Critical error in getHeroCourse:", err.message);
    }

    return null;
}

/**
 * Fetches all courses started by a user
 */
export async function getUserCourses(userId: string) {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from("user_courses")
        .select(`
            course_id,
            completed_lessons,
            is_pinned,
            courses (
                id,
                title,
                slug,
                total_lessons
            )
        `)
        .eq("user_id", userId)
        .order("last_accessed", { ascending: false });

    if (error) return [];
    return data || [];
}

/**
 * Intelligently finds the most relevant unfinished course or track slug to resume.
 */
export async function getResumeCourseSlug(userId: string): Promise<string | null> {
    const supabase = await createClient();

    // 1. Check user_courses for an unfinished course
    const { data: userCourses } = await supabase
        .from('user_courses')
        .select('completed_lessons, courses (slug, total_lessons)')
        .eq('user_id', userId)
        .order('last_accessed', { ascending: false });

    if (userCourses && userCourses.length > 0) {
        for (const uc of userCourses) {
            const course = Array.isArray(uc.courses) ? uc.courses[0] : uc.courses as any;
            if (course && uc.completed_lessons < (course.total_lessons || 1)) {
                return course.slug;
            }
        }
    }

    // 2. Check tracks ordered by sequence
    const { data: tracks } = await supabase
        .from('tracks')
        .select('id, slug, title')
        .order('order_index', { ascending: true });

    if (!tracks || tracks.length === 0) return null;

    // Get user's completed topics
    const { data: completedTopics } = await supabase
        .from('user_topic_progress')
        .select('topic_id')
        .eq('user_id', userId)
        .eq('status', 'completed');

    const completedTopicIds = new Set(completedTopics?.map(t => t.topic_id) || []);

    // Fetch modules and topics to map them to tracks
    const { data: modules } = await supabase.from('modules').select('id, track_id');
    const { data: topics } = await supabase.from('topics').select('id, module_id');

    const trackTopics: Record<string, string[]> = {};
    if (modules && topics) {
        for (const t of topics) {
            const mod = modules.find(m => m.id === t.module_id);
            if (mod) {
                if (!trackTopics[mod.track_id]) trackTopics[mod.track_id] = [];
                trackTopics[mod.track_id].push(t.id);
            }
        }
    }

    // Find the first track that is NOT fully completed
    for (const track of tracks) {
        const topicIds = trackTopics[track.id] || [];
        if (topicIds.length === 0) continue; // Skip empty tracks

        const allCompleted = topicIds.length > 0 && topicIds.every(id => completedTopicIds.has(id));
        if (!allCompleted) {
            return track.slug;
        }
    }

    // 3. Fallback to the first track
    return tracks[0]?.slug || null;
}
