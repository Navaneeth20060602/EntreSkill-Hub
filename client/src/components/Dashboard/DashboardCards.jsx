import "./DashboardCards.css";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";
import { fetchMyEnrollments } from "../../services/examService";
import { getBusinessByTitle } from "../../utils/businessHelpers";
import CourseStepper from "../CourseStepper/CourseStepper";
import NextStepBanner from "./NextStepBanner";

function DashboardCards() {

    const { user } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const primarySkill = localStorage.getItem("primarySkill");
    const selectedBusiness = localStorage.getItem("selectedBusiness");
    const progress = Number(localStorage.getItem("roadmapProgress") || 0);

    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(Boolean(selectedBusiness));

    useEffect(() => {
        if (!selectedBusiness) return;
        fetchMyEnrollments()
            .then((list) => setEnrollment(list.find((e) => e.businessTitle === selectedBusiness) || null))
            .finally(() => setLoading(false));
    }, [selectedBusiness]);

    const business = selectedBusiness ? getBusinessByTitle(selectedBusiness) : null;

    return (

        <section className="dashboard">

            <h1>
                {user ? `${t("welcomeBack")}, ${user.fullName.split(" ")[0]}` : "Welcome to EntreSkill Hub"} <Sparkles size={22} className="dashboard-title-icon" aria-hidden="true" />
            </h1>

            <p>
                {t("yourJourney")} · <strong>{primarySkill || "Not selected"}</strong>
            </p>

            {selectedBusiness && !loading && (
                <NextStepBanner selectedBusiness={selectedBusiness} enrollment={enrollment} progress={progress} />
            )}

            {selectedBusiness && !loading && (
                <CourseStepper current="dashboard" enrollment={enrollment} />
            )}

            {selectedBusiness ? (
                <div className="dashboard-grid">

                    <div className="dashboard-card highlight-card">
                        <h3>{business?.title || selectedBusiness}</h3>
                        {business?.description && <p>{business.description}</p>}
                        <span className="course-status-chip">
                            {enrollment?.status === "COMPLETED" ? <><CheckCircle2 size={14} /> Completed</> :
                             enrollment?.status === "PENDING_APPROVAL" ? "Awaiting Approval" : "In Progress"}
                        </span>
                    </div>

                    <div className="dashboard-card" role="button" tabIndex={0} onClick={() => navigate("/business-roadmap")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/business-roadmap")} style={{ cursor: "pointer" }}>
                        <h3>{t("roadmapProgress")}</h3>
                        <p>{progress}% Completed</p>
                    </div>

                    <div className="dashboard-card" role="button" tabIndex={0} onClick={() => navigate("/mentor-module")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/mentor-module")} style={{ cursor: "pointer" }}>
                        <h3>{t("mentorship")}</h3>
                        <p>{progress >= 100 ? "Mentors unlocked - reach out now!" : `Complete your roadmap (${progress}%) to unlock mentors.`}</p>
                    </div>

                    <div className="dashboard-card" role="button" tabIndex={0} onClick={() => navigate("/learning-resources")} onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && navigate("/learning-resources")} style={{ cursor: "pointer" }}>
                        <h3>{t("learningResources")}</h3>
                        <p>Tutorials and notes shared by your mentor.</p>
                    </div>

                </div>
            ) : (
                <div className="dashboard-empty-state">
                    <p>You haven't picked a course yet.</p>
                    <button onClick={() => navigate("/business-ideas")}>{t("exploreIdeas")}</button>
                </div>
            )}

        </section>

    );

}

export default DashboardCards;
