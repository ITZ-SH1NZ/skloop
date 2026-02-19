"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { MessageCircle, Video, Mic, MicOff, VideoOff, PhoneOff, Flag, AlertTriangle } from "lucide-react";

export default function SessionPage({ params }: { params: { id: string } }) {
    const [messages, setMessages] = useState([
        { id: 1, sender: "them", text: "Hey! Ready to start the React lesson?", time: "10:00 AM" },
        { id: 2, sender: "me", text: "Yes! I've got my VS Code open.", time: "10:01 AM" },
    ]);
    const [isVideoOn, setIsVideoOn] = useState(true);
    const [isMicOn, setIsMicOn] = useState(true);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col lg:flex-row">
            {/* Video Area */}
            <div className="relative flex-1 bg-black lg:border-r border-white/10 p-4 flex items-center justify-center">
                <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-2xl bg-surface/50 border border-white/5">
                    {/* Placeholder for video stream */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                            <Avatar fallback="SK" className="h-24 w-24 mx-auto mb-4 text-2xl" />
                            <div className="text-xl font-semibold">Sarah K.</div>
                            <div className="text-muted text-sm animate-pulse">Connecting...</div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="absolute bottom-6 left-1/2 flex -translate-x-1/2 gap-4">
                        <Button
                            variant={isMicOn ? "secondary" : "ghost"}
                            size="md"
                            className="rounded-full h-12 w-12 p-0"
                            onClick={() => setIsMicOn(!isMicOn)}
                        >
                            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5 text-red-500" />}
                        </Button>
                        <Button
                            variant={isVideoOn ? "secondary" : "ghost"}
                            size="md"
                            className="rounded-full h-12 w-12 p-0"
                            onClick={() => setIsVideoOn(!isVideoOn)}
                        >
                            {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-red-500" />}
                        </Button>
                        <Button
                            variant="primary" // Should be destructive ideally
                            className="rounded-full h-12 w-12 p-0 bg-red-500 hover:bg-red-600 border-none text-white"
                        >
                            <PhoneOff className="h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <div className="absolute top-6 left-6">
                    <Badge variant="outline" className="bg-black/50 backdrop-blur-md px-3 py-1 text-sm border-white/10">
                        <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse inline-block" />
                        Live • 00:12:45
                    </Badge>
                </div>

                <div className="absolute top-6 right-6">
                    <Button variant="ghost" size="sm" className="text-muted hover:text-red-400">
                        <Flag className="mr-2 h-4 w-4" />
                        Report Issue
                    </Button>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex w-full flex-col bg-surface/30 lg:w-[400px]">
                <div className="border-b border-white/5 p-4 bg-background/50 backdrop-blur-md">
                    <h3 className="font-bold flex items-center">
                        <MessageCircle className="mr-2 h-5 w-5 text-primary" />
                        Session Chat
                    </h3>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'me'
                                    ? 'bg-primary text-background font-medium rounded-tr-none'
                                    : 'bg-surface border border-white/5 rounded-tl-none'
                                }`}>
                                {msg.text}
                                <div className={`text-[10px] mt-1 ${msg.sender === 'me' ? 'text-black/60' : 'text-muted'}`}>
                                    {msg.time}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-4 border-t border-white/5 bg-background/50">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Type a message..."
                            className="w-full rounded-full bg-surface border border-white/10 px-4 py-3 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary pr-12"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-full transition-colors">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
