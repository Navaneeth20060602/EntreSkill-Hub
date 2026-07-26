import "./InterviewStatus.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyEnrollments } from "../../services/examService";
import { fetchMyAssignedMentor } from "../../services/mentorService";
import { formatDateTime } from "../../utils/formatDate";

const STATUS_LABEL = {
    NOT_SCHEDULED: "Not Scheduled Yet",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
};

function Countdown({ target }) {
    const [remaining, setRemaining] = useState(new Date(target) - new Date());

    useEffect(() => {
        const timer = setInterval(() => setRemaining(new Date(target) - new Date()), 1000);
        return () => clearInterval(timer);
    }, [target]);

    if (remaining <= 0) {
        return <p className="interview-countdown live">🔴 It's time - join whenever you're ready.</p>;
    }

    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((remaining / (1000 * 60)) % 60);
    const seconds = Math.floor((remaining / 1000) % 60);

    return (
        <p className="interview-countdown">
            ⏳ {days > 0 ? `${days}d ` : ""}{String(hours).padStart(2, "0")}h {String(minutes).padStart(2, "0")}m {String(seconds).padStart(2, "0")}s until your interview
        </p>
    );
}

function InterviewStatus() {
    const navigate = useNavigate();
    const businessTitle = localStorage.getItem("selectedBusiness");

    const [enrollment, setEnrollment] = useState(null);
    const [mentor, setMentor] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchMyEnrollments(), fetchMyAssignedMentor()])
            .then(([list, m]) => {
                setEnrollment(list.find((e) => e.businessTitle === businessTitle) || null);
                setMentor(m);
            })
            .finally(() => setLoading(false));
    }, [businessTitle]);

    if (loading) return <div className="interview-status-page">Loading...</div>;

    if (!enrollment?.examPassed) {
        return (
            <div className="interview-status-page">
                <h1>Interview</h1>
                <div className="interview-blocked">
                    Please complete the final exam first - your interview unlocks once you pass it.
                    <div>
                        <button onClick={() => navigate("/exam")}>Go to Final Exam</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="interview-status-page">
            <h1>Interview</h1>
            <div className="interview-status-card">
                <h2>{businessTitle}</h2>

                <div className="interview-detail-row">
                    <span>Status</span>
                    <strong>{STATUS_LABEL[enrollment.interviewStatus] || "Not Scheduled Yet"}</strong>
                </div>
                <div className="interview-detail-row">
                    <span>Attempts Used</span>
                    <strong>{enrollment.interviewAttempts}/2</strong>
                </div>
                {enrollment.interviewScore !== null && (
                    <div className="interview-detail-row">
                        <span>Score</span>
                        <strong>{enrollment.interviewScore}/100 ({enrollment.interviewPassed ? "Passed" : "Not Passed"})</strong>
                    </div>
                )}

                {enrollment.interviewStatus === "SCHEDULED" && enrollment.meetLink ? (
                    <>
                        <p style={{ marginTop: 16, color: "#4B5563" }}>
                            {enrollment.interviewScheduledAt
                                ? `Scheduled for ${formatDateTime(enrollment.interviewScheduledAt)}`
                                : "Your mentor has shared a meeting link."}
                        </p>
                        {enrollment.interviewScheduledAt && <Countdown target={enrollment.interviewScheduledAt} />}
                        <a className="interview-meet-link" href={enrollment.meetLink} target="_blank" rel="noreferrer">
                            Join Google Meet
                        </a>
                    </>
                ) : enrollment.interviewStatus === "NOT_SCHEDULED" ? (
                    <p style={{ marginTop: 16, color: "#6B7280" }}>
                        Your mentor will reach out via chat to schedule your interview. You can message them anytime.
                    </p>
                ) : null}

                {mentor && (
                    <button className="interview-meet-link" style={{ background: "#F3F4F6", color: "#4B5563", marginTop: 12 }} onClick={() => navigate(`/chat/${mentor.id}`)}>
                        Message Your Mentor
                    </button>
                )}
            </div>
        </div>
    );
}

export default InterviewStatus;
