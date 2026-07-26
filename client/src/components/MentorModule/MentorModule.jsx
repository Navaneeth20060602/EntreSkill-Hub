import "./MentorModule.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyAssignedMentor, submitFeedback } from "../../services/mentorService";
import { API_ORIGIN } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../context/ToastContext";

function MentorModule() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const primarySkill = localStorage.getItem("primarySkill");
    const progress = Number(localStorage.getItem("roadmapProgress") || 0);
    const isUnlocked = progress >= 100;

    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(isUnlocked);
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackMsg, setFeedbackMsg] = useState("");

    useEffect(() => {
        if (!isUnlocked) return;
        fetchMyAssignedMentor()
            .then(setMentor)
            .finally(() => setLoading(false));
    }, [isUnlocked]);

    async function handleFeedbackSubmit() {
        if (!user) {
            toast.error("Please log in to leave feedback.");
            return;
        }
        try {
            await submitFeedback(mentor.id, { message: feedbackMsg, rating: 5 });
            toast.success("Thanks for your feedback!");
            setShowFeedback(false);
            setFeedbackMsg("");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not submit feedback.");
        }
    }

    if (!isUnlocked) {
        return (
            <section className="mentor-section">
                <h1>Your Mentor</h1>
                <div className="mentor-locked">
                    <p>
                        🔒 Complete 100% of your business roadmap to unlock mentor contact.
                    </p>
                    <p>Your current progress: <strong>{progress}%</strong></p>
                </div>
            </section>
        );
    }

    return (
        <section className="mentor-section">

            <h1>Your Mentor</h1>

            <p>Ready to talk to your mentor for {primarySkill || "your field"}? Reach out below.</p>

            <div className="mentor-grid">

                {loading ? (
                    <p>Loading your mentor...</p>
                ) : mentor ? (
                    <div className="mentor-card">

                        {mentor.photo ? (
                            <img className="mentor-avatar-img" src={`${API_ORIGIN}${mentor.photo}`} alt={mentor.name} />
                        ) : (
                            <div className="mentor-avatar">👨‍🏫</div>
                        )}

                        <h2>{mentor.name}</h2>
                        <p><strong>Specialization:</strong> {mentor.specialization}</p>
                        <p><strong>Experience:</strong> {mentor.experience}</p>
                        <p><strong>Rating:</strong> ⭐ {mentor.rating > 0 ? mentor.rating.toFixed(1) : "New"}</p>
                        <p><strong>Location:</strong> {mentor.location}</p>

                        <button onClick={() => navigate(`/chat/${mentor.id}`)}>Contact Mentor</button>

                        {showFeedback ? (
                            <div className="feedback-box">
                                <textarea
                                    placeholder="Share your feedback about this mentor..."
                                    value={feedbackMsg}
                                    onChange={(e) => setFeedbackMsg(e.target.value)}
                                />
                                <button onClick={handleFeedbackSubmit}>Submit Feedback</button>
                            </div>
                        ) : (
                            <button className="feedback-link" onClick={() => setShowFeedback(true)}>
                                Leave Feedback
                            </button>
                        )}

                    </div>
                ) : (
                    <p>No mentor has been assigned yet. This usually happens automatically once you pick a skill.</p>
                )}

            </div>

        </section>
    );
}

export default MentorModule;
