"use client";

import AuthCard, { AuthInput, AuthButton } from "@/components/auth/AuthCard";
import { Mail, Lock } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export default function LoginPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const supabase = createClient();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        // Get values from the inputs
        const target = e.target as typeof e.target & {
            email: { value: string };
            password: { value: string };
        };
        const email = target.email.value;
        const password = target.password.value;

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
        } else {
            router.push("/dashboard");
        }
    };

    return (
        <AuthCard subtitle="Resume Session">
            <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-4">
                    <AuthInput
                        name="email"
                        type="email"
                        placeholder="Pilot ID / Email"
                        icon={<Mail size={20} />}
                        required
                    />
                    <div>
                        <AuthInput
                            name="password"
                            type="password"
                            placeholder="Passcode"
                            icon={<Lock size={20} />}
                            required
                        />
                        <div className="flex justify-end mt-2">
                            <Link href="/forgot-password" className="text-xs font-bold text-zinc-400 hover:text-lime-600 transition-colors uppercase tracking-wider">
                                Lost Credentials?
                            </Link>
                        </div>
                    </div>
                </div>

                {error && (
                    <p className="text-sm font-bold text-red-500 text-center">{error}</p>
                )}

                <AuthButton disabled={isLoading} className="bg-black text-white hover:bg-zinc-800">
                    {isLoading ? "Authenticating..." : "Initialize"}
                </AuthButton>

                <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-zinc-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                        <span className="bg-white px-4 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                            Or Link
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    className="w-full h-14 bg-white text-zinc-900 border-2 border-zinc-100 rounded-2xl flex items-center justify-center gap-3 hover:border-zinc-300 hover:shadow-lg transition-all duration-200 group font-bold"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="group-hover:scale-110 transition-transform">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC04" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Continue with Google</span>
                </button>
            </form>

            <div className="mt-8 text-center">
                <p className="text-zinc-400 text-xs font-medium">
                    New Pilot?
                    <Link href="/signup" className="text-zinc-900 hover:text-lime-600 transition-colors ml-1 font-black underline decoration-2 decoration-lime-300 underline-offset-2">
                        Start Calibration
                    </Link>
                </p>
            </div>
        </AuthCard>
    );
}
