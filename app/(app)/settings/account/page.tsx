"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useToast } from "@/components/ui/ToastProvider";
import { useUser } from "@/context/UserContext";
import { Button } from "@/components/ui/Button";
import { Mail, KeyRound, AlertTriangle, Loader2, Check } from "lucide-react";

export default function AccountSettingsPage() {
    const { user } = useUser();
    const { toast } = useToast();
    const supabase = createClient();

    const [newEmail, setNewEmail] = useState("");
    const [emailSent, setEmailSent] = useState(false);
    const [isSavingEmail, setIsSavingEmail] = useState(false);
    const [resetSent, setResetSent] = useState(false);
    const [isSendingReset, setIsSendingReset] = useState(false);
    const [deleteInput, setDeleteInput] = useState("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleChangeEmail = async () => {
        if (!newEmail || !user) return;
        setIsSavingEmail(true);
        try {
            const { error } = await supabase.auth.updateUser({ email: newEmail });
            if (error) throw error;
            setEmailSent(true);
            toast("Confirmation sent! Check both inboxes.", "success");
        } catch (err: any) {
            toast(err.message || "Failed to update email.", "error");
        } finally {
            setIsSavingEmail(false);
        }
    };

    const handlePasswordReset = async () => {
        if (!user?.email) return;
        setIsSendingReset(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
                redirectTo: `${window.location.origin}/reset-password`,
            });
            if (error) throw error;
            setResetSent(true);
            toast("Password reset link sent to your email!", "success");
        } catch (err: any) {
            toast(err.message || "Failed to send reset link.", "error");
        } finally {
            setIsSendingReset(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Account & Security</h1>
                <p className="text-zinc-500 font-medium mt-1">Manage your email, password, and account safety.</p>
            </div>

            <div className="space-y-6">
                {/* Email */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                            <Mail size={16} className="text-blue-500" />
                        </div>
                        <h2 className="font-black text-zinc-900">Email Address</h2>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Current email: <span className="font-bold text-zinc-900">{user?.email}</span>
                    </p>
                    {emailSent ? (
                        <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
                            <Check size={16} className="text-green-600" />
                            <p className="text-sm font-bold text-green-700">
                                Confirmation emails sent. Check both your old and new inboxes.
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <input
                                type="email"
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="New email address"
                                className="flex-1 bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                            />
                            <Button
                                onClick={handleChangeEmail}
                                disabled={isSavingEmail || !newEmail}
                                className="bg-zinc-900 text-white font-bold rounded-xl px-5 shrink-0"
                            >
                                {isSavingEmail ? <Loader2 size={16} className="animate-spin" /> : "Update"}
                            </Button>
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="bg-white rounded-[2rem] p-6 border border-zinc-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                            <KeyRound size={16} className="text-amber-500" />
                        </div>
                        <h2 className="font-black text-zinc-900">Password</h2>
                    </div>
                    <p className="text-sm text-zinc-500">
                        We'll send a secure reset link to <span className="font-bold text-zinc-700">{user?.email}</span>.
                    </p>
                    {resetSent ? (
                        <div className="flex items-center gap-2 p-4 bg-green-50 rounded-xl border border-green-100">
                            <Check size={16} className="text-green-600" />
                            <p className="text-sm font-bold text-green-700">Reset link sent! Check your inbox.</p>
                        </div>
                    ) : (
                        <Button
                            onClick={handlePasswordReset}
                            disabled={isSendingReset}
                            variant="outline"
                            className="font-bold rounded-xl border-2"
                        >
                            {isSendingReset ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
                            Send Password Reset Link
                        </Button>
                    )}
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-[2rem] p-6 border-2 border-red-100 shadow-sm space-y-4">
                    <div className="flex items-center gap-3 mb-1">
                        <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                            <AlertTriangle size={16} className="text-red-500" />
                        </div>
                        <h2 className="font-black text-red-600">Danger Zone</h2>
                    </div>
                    <p className="text-sm text-zinc-500">
                        Permanently delete your account and all associated data. This action cannot be undone.
                    </p>
                    <Button
                        onClick={() => setShowDeleteModal(true)}
                        className="bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl"
                    >
                        Delete Account
                    </Button>
                </div>
            </div>

            {/* Delete confirmation modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl border border-red-100">
                        <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center mb-4 mx-auto">
                            <AlertTriangle size={24} className="text-red-500" />
                        </div>
                        <h3 className="text-xl font-black text-zinc-900 text-center mb-2">Delete Account</h3>
                        <p className="text-sm text-zinc-500 text-center mb-6">
                            Type <span className="font-black text-zinc-900">@{user?.email?.split("@")[0]}</span> to confirm.
                        </p>
                        <input
                            type="text"
                            value={deleteInput}
                            onChange={(e) => setDeleteInput(e.target.value)}
                            placeholder={`@${user?.email?.split("@")[0]}`}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-red-200 mb-4"
                        />
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => { setShowDeleteModal(false); setDeleteInput(""); }}
                                className="flex-1 font-bold rounded-xl border-2"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={deleteInput !== `@${user?.email?.split("@")[0]}`}
                                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-40"
                                onClick={() => toast("Account deletion is disabled in this build.", "error")}
                            >
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
