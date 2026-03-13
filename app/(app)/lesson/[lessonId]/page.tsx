"use client";

import { use } from "react";
import LessonLayout from "@/components/lesson/LessonLayout";
import VideoView from "@/components/lesson/VideoView";
import ArticleView from "@/components/lesson/ArticleView";
import QuizView from "@/components/lesson/QuizView";
import ChallengeView from "@/components/lesson/ChallengeView";
import FlowchartBuilder from "@/components/lesson/FlowchartBuilder";
import { useRouter } from "next/navigation";
import { claimDailyQuest } from "@/actions/task-actions";
import useSWR from "swr";
import { fetchLesson } from "@/lib/swr-fetchers";
import { createClient } from "@/utils/supabase/client";

export default function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
    const { lessonId } = use(params);
    const router = useRouter();

    const { data: lesson, isLoading } = useSWR(
        lessonId ? ['lesson', lessonId] : null,
        fetchLesson as any
    );

    if (isLoading || !lesson) return (
        <div className="min-h-screen bg-[#FDFCF8] flex items-center justify-center">
            <div className="w-8 h-8 rounded-full border-4 border-lime-400 border-t-transparent animate-spin" />
        </div>
    );

    const handleComplete = async () => {
        console.log("Lesson Completed:", lesson.id);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Determine if it was a Topic or a Lesson from the older structure
                if (lesson.type === "video" || lesson.type === "article" || lesson.type === "quiz" || lesson.type === "challenge" || lesson.type === "flowchart") {

                    const { awardTopicCompletion } = await import("@/actions/course-actions");
                    const result = await awardTopicCompletion(user.id, lesson.id);

                    if (!result.success) {
                        alert(result.error || "Cannot complete this topic yet.");
                        return; 
                    }

                    if (result.xpAwarded && result.xpAwarded > 0) {
                        console.log(`Awarded ${result.xpAwarded} XP and ${result.coinsAwarded} Coins!`);
                        if (result.moduleCompleted) {
                            console.log("Module completed bonus awarded!");
                        }
                    }
                }

                // Fallback for older specific Lessons (Course Lesson)
                if (lesson.moduleTitle === "Course Lesson") {
                    await supabase
                        .from("user_lesson_progress")
                        .upsert({
                            user_id: user.id,
                            lesson_id: lesson.id,
                            status: "completed",
                            completed_at: new Date().toISOString()
                        }, { onConflict: "user_id, lesson_id" });
                }
            }
        } catch (err) {
            console.error("Failed to mark complete:", err);
        } finally {
            // Also log lesson completion quest background process
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    await claimDailyQuest(user.id, 'lesson').catch(err => console.error("Failed to log lesson quest", err));
                }
            } catch (ignore) { }

            router.push(`/course/${lesson.trackSlug || 'web-development'}`); // Re-route to course map
        }
    };

    return (
        <LessonLayout
            title={lesson.title}
            type={lesson.type}
            moduleTitle={lesson.moduleTitle}
            onComplete={handleComplete}
            trackSlug={lesson.trackSlug}
        >
            {lesson.type === "video" && (
                <VideoView
                    videoUrl={lesson.videoUrl}
                    summary={lesson.summary}
                    duration={lesson.duration}
                    miniQuiz={lesson.miniQuiz}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "article" && (
                <ArticleView
                    content={lesson.content}
                    readTime={lesson.readTime}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "quiz" && (
                <QuizView
                    questions={lesson.questions}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "challenge" && (
                <ChallengeView
                    title={lesson.title}
                    description={lesson.description}
                    requirements={lesson.requirements}
                    hints={lesson.hints}
                    initialCode={lesson.initialCode}
                    mode={lesson.mode || 'web'}
                    validationRules={lesson.validationRules}
                    onComplete={handleComplete}
                />
            )}

            {lesson.type === "flowchart" && (
                <div className="h-[calc(100vh-3.5rem)]">
                    <FlowchartBuilder
                        task={lesson.flowchartTask}
                        requiredNodes={lesson.requiredNodes}
                        onComplete={handleComplete}
                    />
                </div>
            )}
        </LessonLayout>
    );
}
