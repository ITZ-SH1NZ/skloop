export type Plan = 'free' | 'plus' | 'pro';

export const PLAN_CONFIG = {
    free: {
        label: 'Free',
        price_monthly: 0,
        price_yearly: 0,
        ai_queries_per_day: 20,
        can_book_mentor: false,
        max_study_circles: 3,
        can_use_code_reviewer: false,
        can_use_interview_prep: false,
        can_export_analytics: false,
        can_get_certificate: false,
        can_save_offline: false,
        can_create_private_circles: false,
        has_plus_badge: false,
    },
    plus: {
        label: 'Plus',
        price_monthly: 149,
        price_yearly: 1490,
        ai_queries_per_day: Infinity,
        can_book_mentor: false,
        max_study_circles: 10,
        can_use_code_reviewer: true,
        can_use_interview_prep: true,
        can_export_analytics: false,
        can_get_certificate: false,
        can_save_offline: true,
        can_create_private_circles: false,
        has_plus_badge: true,
    },
    pro: {
        label: 'Pro',
        price_monthly: 399,
        price_yearly: 3990,
        ai_queries_per_day: Infinity,
        can_book_mentor: true,
        max_study_circles: 999,
        can_use_code_reviewer: true,
        can_use_interview_prep: true,
        can_export_analytics: true,
        can_get_certificate: true,
        can_save_offline: true,
        can_create_private_circles: true,
        has_plus_badge: true,
    },
} as const;

export function getPlan(plan: string): Plan {
    if (plan === 'plus' || plan === 'pro') return plan;
    return 'free';
}

export function canDo(plan: Plan, feature: keyof typeof PLAN_CONFIG.free): boolean {
    return !!PLAN_CONFIG[plan][feature];
}

export const UPGRADE_REASONS: Record<string, { plan: Plan; label: string }> = {
    unlimited_ai:   { plan: 'plus', label: 'Unlimited AI hints' },
    code_reviewer:  { plan: 'plus', label: 'AI Code Reviewer' },
    interview_prep: { plan: 'plus', label: 'AI Interview Prep' },
    book_mentor:    { plan: 'pro',  label: 'Book live mentor sessions' },
    certificate:    { plan: 'pro',  label: 'Completion certificates' },
    analytics_export: { plan: 'pro', label: 'Analytics export' },
};
