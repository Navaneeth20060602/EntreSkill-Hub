import { useEffect, useState } from "react";
import "../components/Toast/Toast.css";

// A tiny global event bus so any file - including plain service functions,
// not just components - can trigger a toast without needing to thread
// useToast() through every nested component.
const listeners = new Set();

function emit(message, type) {
    listeners.forEach((fn) => fn({ id: Date.now() + Math.random(), message, type }));
}

// eslint-disable-next-line react-refresh/only-export-components
export const toast = {
    success: (msg) => emit(msg, "success"),
    error: (msg) => emit(msg, "error"),
    info: (msg) => emit(msg, "info"),
};

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    useEffect(() => {
        function handleNew(t) {
            setToasts((prev) => [...prev, t]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((x) => x.id !== t.id));
            }, 5000);
        }
        listeners.add(handleNew);
        return () => listeners.delete(handleNew);
    }, []);

    function dismiss(id) {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }

    return (
        <>
            {children}
            <div className="toast-container">
                {toasts.map((t) => (
                    <div key={t.id} className={`toast-item ${t.type}`}>
                        <span>{t.message}</span>
                        <button className="toast-close" aria-label="Dismiss notification" onClick={() => dismiss(t.id)}>✕</button>
                    </div>
                ))}
            </div>
        </>
    );
}
