import "./InfoPages.css";
import "./Contact.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import EmptyState from "../components/EmptyState/EmptyState";
import { useAuth } from "../context/AuthContext";
import { submitContactMessage, fetchMyMessages } from "../services/contactService";
import { toast } from "../context/ToastContext";

const TYPES = [
    { value: "FEEDBACK", label: "Feedback", hint: "Tell us what you liked (or didn't) about the site, a class, or a mentor." },
    { value: "SUGGESTION", label: "Suggestion", hint: "Share an idea to help us improve." },
    { value: "COMPLAINT", label: "Raise a Complaint", hint: "Something went wrong? Let us know and we'll follow up." },
];

function StarRating({ value, onChange }) {
    return (
        <div className="star-rating">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    className={n <= value ? "star filled" : "star"}
                    onClick={() => onChange(n)}
                >
                    ★
                </span>
            ))}
        </div>
    );
}

function Contact() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [type, setType] = useState("FEEDBACK");
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [rating, setRating] = useState(5);
    const [sent, setSent] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [myMessages, setMyMessages] = useState([]);
    const [loadingHistory, setLoadingHistory] = useState(Boolean(user));

    useEffect(() => {
        if (!user) return;
        fetchMyMessages().then(setMyMessages).finally(() => setLoadingHistory(false));
    }, [user]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!subject || !message) return;

        setSubmitting(true);
        try {
            const created = await submitContactMessage({ type, subject, message, rating: type === "FEEDBACK" ? rating : undefined });
            setMyMessages((prev) => [created, ...prev]);
            setSent(true);
            setSubject("");
            setMessage("");
            setTimeout(() => setSent(false), 4000);
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not send your message.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!user) {
        return (
            <MainLayout>
                <section className="info-page">
                    <h1>Contact & Feedback</h1>
                    <p>Please log in to send us feedback, suggestions, or raise a complaint.</p>
                    <button onClick={() => navigate("/login")} style={{ marginTop: 16, padding: "12px 26px", background: "#2563EB", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>
                        Login
                    </button>
                </section>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <section className="info-page">

                <h1>Contact & Feedback</h1>

                <p>
                    Rate your experience, suggest an improvement, or raise a complaint - we read every message.
                </p>

                {sent && (
                    <p className="contact-success">
                        Thanks for reaching out - we'll get back to you soon.
                    </p>
                )}

                <div className="contact-type-tabs">
                    {TYPES.map((t) => (
                        <button
                            key={t.value}
                            type="button"
                            className={type === t.value ? "contact-type-btn active" : "contact-type-btn"}
                            onClick={() => setType(t.value)}
                        >
                            {t.label}
                        </button>
                    ))}
                </div>

                <p className="contact-type-hint">
                    {TYPES.find((t) => t.value === type)?.hint}
                </p>

                <form className="contact-form" onSubmit={handleSubmit}>

                    {type === "FEEDBACK" && (
                        <div>
                            <label style={{ display: "block", marginBottom: 8, color: "#4B5563" }}>Your rating</label>
                            <StarRating value={rating} onChange={setRating} />
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Subject"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                    />

                    <textarea
                        placeholder="Your message"
                        rows="5"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Sending..." : "Send Message"}
                    </button>

                </form>

                <div className="ticket-history">
                    <h2>Your Complaint Tickets</h2>

                    {loadingHistory ? (
                        <p>Loading...</p>
                    ) : myMessages.filter((m) => m.type === "COMPLAINT").length === 0 ? (
                        <EmptyState icon="🗂️" message="You haven't raised any complaints. If something's wrong, use the form above to let us know." />
                    ) : (
                        myMessages.filter((m) => m.type === "COMPLAINT").map((m) => (
                            <div key={m.id} className="ticket-card">
                                <div className="ticket-card-header">
                                    <span className="ticket-number">Ticket #{m.id.slice(-6).toUpperCase()}</span>
                                    <span className={`ticket-status-badge ${m.status}`}>{m.status.replace("_", " ")}</span>
                                </div>
                                <h4>{m.subject}</h4>
                                <p>{m.message}</p>

                                {m.adminResponse ? (
                                    <div className="ticket-response">
                                        <strong>Response from EntreSkill Hub Team</strong>
                                        <p>{m.adminResponse}</p>
                                    </div>
                                ) : (
                                    <p className="ticket-pending-note">We've received this and are looking into it.</p>
                                )}
                            </div>
                        ))
                    )}
                </div>

            </section>
        </MainLayout>
    );
}

export default Contact;
