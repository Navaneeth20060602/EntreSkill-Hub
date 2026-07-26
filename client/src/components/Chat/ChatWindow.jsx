import "./ChatWindow.css";
import { useEffect, useRef, useState } from "react";

// Generic chat window used by both the learner (chatting with a mentor) and
// the mentor (chatting with a learner). The parent supplies who "I" am and
// functions to fetch/send messages, so this component doesn't need to know
// which side it's rendering for.
function ChatWindow({ title, subtitle, photo, myRole, fetchMessages, sendMessage }) {
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState("");
    const [loading, setLoading] = useState(true);
    const bodyRef = useRef(null);

    useEffect(() => {
        let cancelled = false;

        async function load() {
            const msgs = await fetchMessages();
            if (!cancelled) {
                setMessages(msgs);
                setLoading(false);
            }
        }
        load();

        // Simple polling so both sides see new messages without needing
        // websockets - refreshes every 5 seconds.
        const interval = setInterval(load, 5000);
        return () => {
            cancelled = true;
            clearInterval(interval);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (bodyRef.current) {
            bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
        }
    }, [messages]);

    async function handleSend(e) {
        e.preventDefault();
        if (!text.trim()) return;

        const saved = await sendMessage(text.trim());
        setMessages((prev) => [...prev, saved]);
        setText("");
    }

    return (
        <div className="chat-window">

            <div className="chat-header">
                {photo ? <img src={photo} alt={title} /> : <div className="avatar-fallback">{title?.[0]}</div>}
                <div>
                    <h3>{title}</h3>
                    <p>{subtitle}</p>
                </div>
            </div>

            <div className="chat-body" ref={bodyRef}>
                {loading ? (
                    <p className="chat-empty">Loading conversation...</p>
                ) : messages.length === 0 ? (
                    <p className="chat-empty">No messages yet. Say hello!</p>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} className={`chat-bubble ${m.senderRole === myRole ? "mine" : "theirs"}`}>
                            {m.message}
                        </div>
                    ))
                )}
            </div>

            <form className="chat-footer" onSubmit={handleSend}>
                <input
                    placeholder="Type a message..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                />
                <button type="submit">Send</button>
            </form>

            <p className="chat-note">Your phone number and email stay private in this chat.</p>

        </div>
    );
}

export default ChatWindow;
