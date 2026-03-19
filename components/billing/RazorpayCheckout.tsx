"use client";

import { useEffect } from "react";

// Razorpay injects a global on the window
declare global {
    interface Window {
        Razorpay: any;
    }
}

function loadRazorpayScript(): Promise<boolean> {
    return new Promise((resolve) => {
        if (window.Razorpay) return resolve(true);
        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload  = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
}

export interface RazorpayOptions {
    orderId:     string;
    amount:      number;   // in paise
    currency:    string;
    name:        string;
    description: string;
    prefill?:    { name?: string; email?: string };
    onSuccess:   (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => void;
    onDismiss?:  () => void;
}

export async function openRazorpay(options: RazorpayOptions) {
    const loaded = await loadRazorpayScript();
    if (!loaded) {
        throw new Error("Failed to load Razorpay SDK. Check your internet connection.");
    }

    return new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay({
            key:         process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
            order_id:    options.orderId,
            amount:      options.amount,
            currency:    options.currency,
            name:        options.name,
            description: options.description,
            prefill:     options.prefill || {},
            theme: {
                color: "#D4F268",   // skloop primary
            },
            handler: (response: any) => {
                options.onSuccess(response);
                resolve();
            },
            modal: {
                ondismiss: () => {
                    options.onDismiss?.();
                    resolve();
                },
            },
        });
        rzp.open();
    });
}
