import "./MyMarks.css";
import { useEffect, useState } from "react";
import { fetchMyEnrollments } from "../../services/examService";
import { fetchMyCertificates } from "../../services/certificateService";
import { API_ORIGIN } from "../../services/api";
import { useLanguage } from "../../context/LanguageContext";
import { formatDateTime } from "../../utils/formatDate";

const INTERVIEW_STATUS_LABEL = {
    NOT_SCHEDULED: "Not Scheduled",
    SCHEDULED: "Scheduled",
    COMPLETED: "Completed",
};

function MyMarks() {
    const { t } = useLanguage();
    const [enrollments, setEnrollments] = useState([]);
    const [certificates, setCertificates] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([fetchMyEnrollments(), fetchMyCertificates()])
            .then(([e, c]) => { setEnrollments(e); setCertificates(c); })
            .finally(() => setLoading(false));
    }, []);

    if (loading || enrollments.length === 0) return null;

    return (
        <section className="my-marks">
            <h2>{t("myMarks")}</h2>
            <div className="marks-grid">
                {enrollments.map((e) => {
                    const certificate = certificates.find((c) => c.businessTitle === e.businessTitle);
                    return (
                        <div className="marks-card" key={e.id}>
                            <h4>{e.businessTitle}</h4>

                            <div className="marks-row">
                                <span>{t("examMarks")}</span>
                                <strong>{e.examScore !== null ? `${e.examScore}/${e.examTotal}` : "Not attempted"}</strong>
                            </div>

                            <div className="marks-row">
                                <span>Interview Status</span>
                                <strong>{INTERVIEW_STATUS_LABEL[e.interviewStatus] || "Not Scheduled"}</strong>
                            </div>

                            {e.interviewStatus === "SCHEDULED" && e.meetLink && (
                                <div className="interview-meet-box">
                                    <p>Your interview is scheduled{e.interviewScheduledAt ? ` for ${formatDateTime(e.interviewScheduledAt)}` : ""}.</p>
                                    <a href={e.meetLink} target="_blank" rel="noreferrer">
                                        <button>Join Google Meet</button>
                                    </a>
                                </div>
                            )}

                            <div className="marks-row">
                                <span>{t("interviewMarks")}</span>
                                <strong>{e.interviewScore !== null ? `${e.interviewScore}/100` : "Pending"}</strong>
                            </div>

                            <div className="marks-row">
                                <span>Interview Attempts</span>
                                <strong>{e.interviewAttempts}/2</strong>
                            </div>

                            <span className={`marks-status ${e.status}`}>{e.status.replace("_", " ")}</span>

                            {certificate && (
                                <a href={`${API_ORIGIN}${certificate.fileUrl}`} target="_blank" rel="noreferrer" className="certificate-link">
                                    🏆 View Your Certificate
                                </a>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}

export default MyMarks;
