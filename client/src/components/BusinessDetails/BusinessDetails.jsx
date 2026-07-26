import "./BusinessDetails.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import businesses from "../../data/businesses";
import { fetchMyEnrollments } from "../../services/examService";
import CourseStepper from "../CourseStepper/CourseStepper";
import { useLanguage } from "../../context/LanguageContext";

function BusinessDetails() {

    const navigate = useNavigate();
    const { t } = useLanguage();

    const selectedBusiness = localStorage.getItem("selectedBusiness");
    const resourcesCompleted = localStorage.getItem(`resourcesCompleted:${selectedBusiness}`) === "true";
    const roadmapProgress = Number(localStorage.getItem("roadmapProgress") || 0);

    const business = businesses.find(
        item => item.title === selectedBusiness
    );

    const [enrollment, setEnrollment] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEnrollments()
            .then((list) => setEnrollment(list.find((e) => e.businessTitle === selectedBusiness) || null))
            .finally(() => setLoading(false));
    }, [selectedBusiness]);

    if (!business) {

        return (

            <section className="business-details">

                <h2>Business Not Found</h2>

            </section>

        );

    }

    // A single, clear next step - based on exactly how far the learner has
    // actually gotten - instead of always showing "Start Learning" /
    // "Skip to Roadmap" from scratch every time they revisit this page.
    function renderNextStep() {
        if (loading) return <p>Loading your progress...</p>;

        if (enrollment?.status === "COMPLETED") {
            return (
                <div className="course-complete-banner">
                    🎉 You've completed this course! Check your dashboard for your certificate.
                    <button className="roadmap-btn" onClick={() => navigate("/dashboard")}>Back to Dashboard</button>
                </div>
            );
        }

        if (enrollment?.examPassed) {
            return (
                <div className="info-buttons">
                    <button className="roadmap-btn" onClick={() => navigate("/dashboard")}>
                        View Interview Status
                    </button>
                </div>
            );
        }

        if (roadmapProgress >= 100) {
            return (
                <div className="info-buttons">
                    <button className="learning-btn" onClick={() => navigate("/exam")}>
                        Take Final Exam
                    </button>
                </div>
            );
        }

        if (resourcesCompleted) {
            return (
                <div className="info-buttons">
                    <button className="roadmap-btn" onClick={() => navigate("/business-roadmap")}>
                        Continue Roadmap
                    </button>
                </div>
            );
        }

        return (
            <div className="info-buttons">
                <button className="learning-btn" onClick={() => navigate("/learning-resources")}>
                    Start Learning
                </button>
            </div>
        );
    }

    return (

        <section className="business-details">

            <CourseStepper current="details" enrollment={enrollment} />

            <h1>{business.title}</h1>

            <p className="business-description">

                {business.description}

            </p>

            <div className="details-grid">

                <div className="detail-card">

                    <h3>{t("investment")}</h3>

                    <p>{business.investment}</p>

                </div>

                <div className="detail-card">

                    <h3>{t("income")}</h3>

                    <p>{business.income}</p>

                </div>

                <div className="detail-card">

                    <h3>{t("difficulty")}</h3>

                    <p>{business.difficulty}</p>

                </div>

                <div className="detail-card">

                    <h3>{t("duration")}</h3>

                    <p>{business.duration}</p>

                </div>

            </div>

            <div className="info-section">

                <h2>{t("requiredSkills")}</h2>

                <ul>

                    <li>Communication</li>
                    <li>Customer Handling</li>
                    <li>Business Planning</li>
                    <li>Marketing</li>

                </ul>

            </div>

            {renderNextStep()}

        </section>

    );

}

export default BusinessDetails;
