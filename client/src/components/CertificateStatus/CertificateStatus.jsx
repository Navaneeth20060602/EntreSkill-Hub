import "./CertificateStatus.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMyEnrollments } from "../../services/examService";
import { fetchMyCertificates } from "../../services/certificateService";
import ReportCard from "../ReportCard/ReportCard";

function CertificateStatus() {
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

    const bothPassed = enrollment?.examPassed && enrollment?.interviewPassed;

    if (!bothPassed) {
        return (
            <div className="certificate-status-page">
                <h1>Certificate</h1>
                <div className="certificate-blocked">
                    Please complete both the final exam and the interview to earn your certificate and report card.
                    <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 14 }}>
                        {!enrollment?.examPassed && <button onClick={() => navigate("/exam")}>Go to Exam</button>}
                        {enrollment?.examPassed && !enrollment?.interviewPassed && <button onClick={() => navigate("/interview")}>Go to Interview</button>}
                    </div>
                </div>
            </div>
        );
    }

    if (enrollment.status !== "COMPLETED") {
        return (
            <div className="certificate-status-page">
                <h1>Certificate</h1>
                <div className="certificate-waiting">
                    🎉 You've passed both the exam and interview! Please wait while the admin reviews and issues your certificate.
                </div>
            </div>
        );
    }

    return (
        <div className="certificate-status-page">
            <h1>Certificate</h1>
            <ReportCard
                enrollment={enrollment}
                certificate={certificate}
                onClose={() => navigate("/dashboard")}
            />
        </div>
    );
}

export default CertificateStatus;
