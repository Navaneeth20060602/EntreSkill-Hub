import "../CertificateStatus/CertificateStatus.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyEnrollments } from "../../services/examService";
import { fetchMyCertificates } from "../../services/certificateService";
import ReportCard from "../ReportCard/ReportCard";

// Unlike the certificate (which only appears once the admin approves the
// mentor-recorded results), the report card is just a summary of the
// learner's own exam + interview marks - there's nothing for an admin to
// sign off on here, so it should be visible the moment both are passed,
// regardless of enrollment.status still being PENDING_APPROVAL.
function ReportCardStatus() {
    const navigate = useNavigate();
    const businessTitle = localStorage.getItem("selectedBusiness");

    const [enrollment, setEnrollment] = useState(null);
    const [certificate, setCertificate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchMyEnrollments(), fetchMyCertificates()])
            .then(([enrollments, certificates]) => {
                setEnrollment(enrollments.find((e) => e.businessTitle === businessTitle) || null);
                setCertificate(certificates.find((c) => c.businessTitle === businessTitle) || null);
            })
            .finally(() => setLoading(false));
    }, [businessTitle]);

    if (loading) return <div className="certificate-status-page">Loading...</div>;

    if (!enrollment) {
        return (
            <div className="certificate-status-page">
                <h1>Report Card</h1>
                <div className="certificate-blocked">
                    You haven't enrolled in a course yet.
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
                        <button onClick={() => navigate("/business-ideas")}>Explore Business Ideas</button>
                    </div>
                </div>
            </div>
        );
    }

    const bothPassed = enrollment.examPassed && enrollment.interviewPassed;

    if (!bothPassed) {
        return (
            <div className="certificate-status-page">
                <h1>Report Card</h1>
                <div className="certificate-blocked">
                    Your report card unlocks once you've passed both the final exam and the interview.
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
                        {!enrollment.examPassed && <button onClick={() => navigate("/exam")}>Go to Exam</button>}
                        {enrollment.examPassed && !enrollment.interviewPassed && <button onClick={() => navigate("/interview")}>Go to Interview</button>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-status-page">
            <h1>Report Card</h1>
            <ReportCard
                enrollment={enrollment}
                certificate={certificate}
                onClose={() => navigate("/dashboard")}
            />
        </div>
    );
}

export default ReportCardStatus;
