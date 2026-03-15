"use client";

import { useEffect, useState } from "react";
import { getNotificationDiagnostic } from "@/actions/diagnostic-actions";

export default function DiagnosticsPage() {
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const runDiagnostic = async () => {
        setLoading(true);
        try {
            const data = await getNotificationDiagnostic();
            setResult(data);
        } catch (err) {
            setResult({ error: err });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold">Notification Diagnostics</h1>
            <button 
                onClick={runDiagnostic}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                disabled={loading}
            >
                {loading ? "Running..." : "Run Diagnostic"}
            </button>
            {result && (
                <pre className="p-4 bg-zinc-100 rounded overflow-auto max-w-full text-xs">
                    {JSON.stringify(result, null, 2)}
                </pre>
            )}
        </div>
    );
}
