import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

export async function POST(req: NextRequest) {
    try {
        const { message, mode, history } = await req.json();

        // Path to the python script (in backend directory)
        const scriptPath = path.join(process.cwd(), "..", "backend", "scripts", "loopy_agent.py");
        // Path to venv python (relative to frontend root)
        const venvPython = path.join(process.cwd(), "..", ".venv", "bin", "python");

        console.log("Loopy Request:", { message, mode, scriptPath, venvPython });

        return new Promise<NextResponse>((resolve, reject) => {
            const pythonProcess = spawn(venvPython, [
                scriptPath,
                message,
                mode,
                JSON.stringify(history)
            ]);

            let dataString = "";
            let errorString = "";

            pythonProcess.stdout.on("data", (data) => {
                dataString += data.toString();
            });

            pythonProcess.stderr.on("data", (data) => {
                errorString += data.toString();
            });

            pythonProcess.on("close", (code) => {
                if (code !== 0) {
                    console.error("Python script error:", errorString);
                    resolve(NextResponse.json(
                        { content: "Error: Failed to process request via Python agent." },
                        { status: 500 }
                    ));
                    return;
                }

                try {
                    const result = JSON.parse(dataString);
                    resolve(NextResponse.json(result));
                } catch (e) {
                    console.error("Failed to parse Python output:", dataString);
                    resolve(NextResponse.json(
                        { content: "Error: Invalid response format from Python agent." },
                        { status: 500 }
                    ));
                }
            });
        });

    } catch (error) {
        return NextResponse.json(
            { content: "Error: Internal Server Error" },
            { status: 500 }
        );
    }
}
