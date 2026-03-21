"use server";

export async function logValidationProgress(logs: string[]) {
    console.log("\n==================================================");
    console.log("🛠️  [NODE LOG] CHALLENGE VERIFICATION STARTED");
    console.log("==================================================");
    
    logs.forEach(log => {
        console.log(`[VERIFY] ${log}`);
    });

    console.log("==================================================\n");
}
