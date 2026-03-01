// This layout removes the default scrollable padding for the chat page,
// giving it a fixed full-height container so ChatWindow can fill the viewport correctly.
export default function PeerChatLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-full flex flex-col overflow-hidden">
            {children}
        </div>
    );
}
