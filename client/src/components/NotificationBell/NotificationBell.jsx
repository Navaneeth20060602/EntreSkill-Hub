import "./NotificationBell.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell } from "lucide-react";
import { fetchMyNotifications, markNotificationRead, markAllNotificationsRead } from "../../services/notificationService";
import { formatDateTime } from "../../utils/formatDate";

function NotificationBell() {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unread, setUnread] = useState(0);
    const wrapperRef = useRef(null);
    const navigate = useNavigate();

    async function load() {
        try {
            const { notifications, unread } = await fetchMyNotifications();
            setNotifications(notifications);
            setUnread(unread);
        } catch {
            // Silently ignore - the bell just won't update this cycle.
        }
    }

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch + recurring poll, not a derived-state anti-pattern
        load();
        const interval = setInterval(load, 30000); // poll every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        function handleClickOutside(e) {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    async function handleOpen() {
        setOpen((v) => !v);
    }

    async function handleNotificationClick(n) {
        if (!n.read) {
            setNotifications((list) => list.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
            setUnread((u) => Math.max(0, u - 1));
            markNotificationRead(n.id).catch(() => {});
        }
        setOpen(false);
        if (n.link) navigate(n.link);
    }

    async function handleMarkAllRead() {
        setNotifications((list) => list.map((x) => ({ ...x, read: true })));
        setUnread(0);
        markAllNotificationsRead().catch(() => {});
    }

    return (
        <div className="notification-bell-wrapper" ref={wrapperRef}>
            <button className="notification-bell-btn" onClick={handleOpen} aria-label="Notifications">
                <Bell size={18} />
                {unread > 0 && <span className="notification-badge">{unread > 9 ? "9+" : unread}</span>}
            </button>

            {open && (
                <div className="notification-panel">
                    <div className="notification-panel-header">
                        <span>Notifications</span>
                        {unread > 0 && (
                            <button className="notification-mark-all" onClick={handleMarkAllRead}>
                                Mark all read
                            </button>
                        )}
                    </div>

                    <div className="notification-panel-body">
                        {notifications.length === 0 ? (
                            <p className="notification-empty">You're all caught up — no notifications yet.</p>
                        ) : (
                            notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`notification-item ${n.read ? "" : "unread"}`}
                                    onClick={() => handleNotificationClick(n)}
                                >
                                    <p>{n.message}</p>
                                    <span className="notification-date">{formatDateTime(n.createdAt)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default NotificationBell;
