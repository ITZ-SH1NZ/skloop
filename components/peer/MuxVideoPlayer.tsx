"use client";

import MuxPlayer from "@mux/mux-player-react";

interface Props {
    url: string; // https://stream.mux.com/{playbackId}
    className?: string;
}

export function MuxVideoPlayer({ url, className }: Props) {
    const playbackId = url.replace("https://stream.mux.com/", "");
    return (
        <MuxPlayer
            playbackId={playbackId}
            streamType="on-demand"
            className={className}
            style={{ aspectRatio: "16/9", width: "100%" }}
        />
    );
}
