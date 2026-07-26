import "./EmptyState.css";
import { Inbox } from "lucide-react";

// A small reusable "nothing here yet" block: icon + message + optional CTA.
// Used across Admin/Mentor dashboards and the Contact page in place of
// scattered plain-text empty notes.
function EmptyState({ icon = <Inbox size={28} />, message, actionLabel, onAction, compact = false }) {
    return (
        <div className={`empty-state ${compact ? "empty-state-compact" : ""}`}>
            <div className="empty-state-icon">{icon}</div>
            <p className="empty-state-message">{message}</p>
            {actionLabel && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {actionLabel}
                </button>
            )}
        </div>
    );
}

export default EmptyState;
