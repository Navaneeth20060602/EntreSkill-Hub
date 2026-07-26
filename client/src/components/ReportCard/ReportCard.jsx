import "./ReportCard.css";
import { X, Award, ClipboardList, Download, Trophy } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { API_ORIGIN } from "../../services/api";

const STATUS_LABEL = {
    IN_PROGRESS: "In Progress",
    PENDING_APPROVAL: "Awaiting Admin Approval",
    COMPLETED: "Completed",
    FAILED: "Not Passed Yet",
};

function ReportCard({ enrollment, certificate, onClose }) {
    const { user } = useAuth();

    function handleDownloadReportCard() {
        window.print();
    }

    const isCompleted = enrollment.status === "COMPLETED";

    return (
        <div className="report-card-backdrop" onClick={onClose}>
            <div className="report-card-box printable-report-card" onClick={(e) => e.stopPropagation()}>
                <button className="report-card-close no-print" aria-label="Close report card" onClick={onClose}><X size={18} /></button>

                <div className="report-card-seal">{isCompleted ? <Award size={28} /> : <ClipboardList size={28} />}</div>

                <div className="report-card-header">
                    <span className="report-card-kicker">EntreSkill Hub · Official Report Card</span>
                    <h3>{user ? user.fullName : "Learner"}</h3>
                    <p className="report-card-subtitle">{enrollment.businessTitle}</p>
                </div>

                <span className={`report-card-badge ${enrollment.status}`}>
                    {STATUS_LABEL[enrollment.status] || enrollment.status}
                </span>

                <div className="report-card-marks">
                    <div className="report-card-row">
                        <span>Exam Marks</span>
                        <strong>{enrollment.examScore !== null ? `${enrollment.examScore}/${enrollment.examTotal}` : "Not attempted"}</strong>
                    </div>
                    <div className="report-card-row">
                        <span>Exam Result</span>
                        <strong className={enrollment.examPassed ? "pass" : enrollment.examPassed === false ? "fail" : ""}>
                            {enrollment.examPassed === null ? "-" : enrollment.examPassed ? "Passed" : "Not Passed"}
                        </strong>
                    </div>
                    <div className="report-card-row">
                        <span>Interview Marks</span>
                        <strong>{enrollment.interviewScore !== null && enrollment.interviewScore !== undefined ? `${enrollment.interviewScore}/100` : "Pending"}</strong>
                    </div>
                    <div className="report-card-row">
                        <span>Interview Result</span>
                        <strong className={enrollment.interviewPassed ? "pass" : enrollment.interviewPassed === false ? "fail" : ""}>
                            {enrollment.interviewPassed === null ? "-" : enrollment.interviewPassed ? "Passed" : "Not Passed"}
                        </strong>
                    </div>
                    <div className="report-card-row">
                        <span>Interview Attempts Used</span>
                        <strong>{enrollment.interviewAttempts}/2</strong>
                    </div>
                </div>

                <p className="report-card-issued only-print">
                    Generated on {new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })} · EntreSkill Hub
                </p>

                <div className="no-print" style={{ display: "flex", gap: 10, marginTop: 20 }}>
                    <button className="report-card-download-btn" onClick={handleDownloadReportCard}>
                        <Download size={16} /> Download Report Card
                    </button>

                    {certificate && (
                        <a className="report-card-download-btn" href={`${API_ORIGIN}${certificate.fileUrl}`} download>
                            <Trophy size={16} /> Download Certificate
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ReportCard;
