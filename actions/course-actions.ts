"use server";

import { createClient } from "@/utils/supabase/server";

/**
 * Fetches the primary course or track for the user's dashboard hero
 */
export async function getHeroCourse(userId: string) {
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

    if (data && !error) {
        const courseData = Array.isArray(data.courses) ? data.courses[0] : data.courses as any;
        return {
            title: courseData?.title,
            description: courseData?.description,
            slug: courseData?.slug,
            completedLessons: data.completed_lessons,
            totalLessons: courseData?.total_lessons,
            type: 'course'
        };
    }

    // 2. Fallback to check tracks system
    const { data: trackData } = await supabase
        .from('tracks')
        .select('title, slug, description')
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();

    if (trackData) {
        return {
            title: trackData.title,
            description: trackData.description,
            slug: trackData.slug,
            completedLessons: 0,
            totalLessons: 10, // Placeholder or fetch actual topic count
            type: 'track'
        };
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
