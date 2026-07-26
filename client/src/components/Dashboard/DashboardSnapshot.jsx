import "./DashboardSnapshot.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, CalendarClock, Award, Bell } from "lucide-react";
import { fetchMyEnrollments } from "../../services/examService";
import { fetchMyCertificates } from "../../services/certificateService";
import { fetchMyNotifications } from "../../services/notificationService";
import { formatDateTime } from "../../utils/formatDate";
import Skeleton from "../Skeleton/Skeleton";

// Action-oriented snapshot for the learner dashboard: at a glance, where do
// I continue, is an interview coming up, what's my certificate status, and
// what did I miss. Purely additive - it fetches its own data and doesn't
// touch anything DashboardCards/BusinessRecommendations/MyMarks already do.
function DashboardSnapshot() {
    const navigate = useNavigate();
    const selectedBusiness = localStorage.getItem("selectedBusiness");

    const [enrollment, setEnrollment] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(Boolean(selectedBusiness));

    useEffect(() => {
        const tasks = [fetchMyNotifications().catch(() => ({ notifications: [] }))];
        if (selectedBusiness) {
            tasks.push(fetchMyEnrollments().catch(() => []));
            tasks.push(fetchMyCertificates().catch(() => []));
        }

        Promise.all(tasks).then(([notifResult, enrollments, certificates]) => {
            setNotifications((notifResult?.notifications || []).slice(0, 3));
            if (selectedBusiness) {
                setEnrollment((enrollments || []).find((e) => e.businessTitle === selectedBusiness) || null);
                setCertificate((certificates || []).find((c) => c.businessTitle === selectedBusiness) || null);
            }
        }).finally(() => setLoading(false));
    }, [selectedBusiness]);

    if (!selectedBusiness && notifications.length === 0 && !loading) {
        // Nothing meaningful to show yet (no course picked, no notifications).
        return null;
    }

    if (loading) {
        return <Skeleton variant="cards" count={4} label="Loading your snapshot" />;
    }

    const certificateReady = Boolean(enrollment?.examPassed && enrollment?.interviewPassed);

    return (
        <div className="dashboard-snapshot-grid">
            {selectedBusiness && (
                <div className="snapshot-card" role="button" tabIndex={0} onClick={() => navigate("/learning-resources")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/learning-resources")}>
                    <div className="snapshot-icon"><BookOpen size={18} aria-hidden="true" /></div>
                    <h4>Continue Learning</h4>
                    <p>{enrollment?.status === "COMPLETED" ? "Course completed - review your resources anytime." : "Pick up where you left off in your resources."}</p>
                </div>
            )}

            {selectedBusiness && (
                <div className="snapshot-card" role="button" tabIndex={0} onClick={() => navigate("/interview")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/interview")}>
                    <div className="snapshot-icon"><CalendarClock size={18} aria-hidden="true" /></div>
                    <h4>Upcoming Interview</h4>
                    <p>
                        {!enrollment?.examPassed
                            ? "Pass the final exam to unlock your interview."
                            : enrollment?.interviewStatus === "SCHEDULED" && enrollment?.interviewScheduledAt
                            ? `Scheduled for ${formatDateTime(enrollment.interviewScheduledAt)}`
                            : enrollment?.interviewStatus === "COMPLETED"
                            ? "Completed."
                            : "Not scheduled yet - your mentor will reach out."}
                    </p>
                </div>
            )}

            {selectedBusiness && (
                <div className="snapshot-card" role="button" tabIndex={0} onClick={() => navigate("/certificate")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/certificate")}>
                    <div className="snapshot-icon"><Award size={18} aria-hidden="true" /></div>
                    <h4>Certificate Status</h4>
                    <p>{certificate ? "Issued - view or download it." : certificateReady ? "Eligible - awaiting issue by admin." : "Complete the exam and interview to become eligible."}</p>
                </div>
            )}

            <div className="snapshot-card" role="button" tabIndex={0} onClick={() => navigate("/dashboard")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/dashboard")}>
                <div className="snapshot-icon"><Bell size={18} aria-hidden="true" /></div>
                <h4>Recent Notifications</h4>
                {notifications.length === 0 ? (
                    <p>You're all caught up - no notifications yet.</p>
                ) : (
                    <ul className="snapshot-notif-list">
                        {notifications.map((n) => (
                            <li key={n.id}>{n.message}</li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

export default DashboardSnapshot;
