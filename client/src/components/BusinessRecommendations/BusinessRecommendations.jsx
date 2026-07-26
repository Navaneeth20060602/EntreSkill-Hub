import "./BusinessRecommendations.css";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchMyEnrollments } from "../../services/examService";

function BusinessRecommendations() {

    const navigate = useNavigate();
    const primarySkill = localStorage.getItem("primarySkill");

    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyEnrollments().then(setEnrollments).finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <section className="recommendations">
                <h2>Your Business Journey</h2>
                <p>Loading your progress...</p>
            </section>
        );
    }

    const activeEnrollment = enrollments.find((e) => e.status === "IN_PROGRESS" || e.status === "PENDING_APPROVAL");
    const completedCount = enrollments.filter((e) => e.status === "COMPLETED").length;

    return (
        <section className="recommendations">

            <h2>Your Business Journey</h2>

            <div className="recommendations-grid">

                <div className="recommendation-card journey-summary-card">

                    {activeEnrollment ? (
                        <>
                            <h3>Currently Learning</h3>
                            <p className="journey-course-name">{activeEnrollment.businessTitle}</p>
                            <p>
                                {activeEnrollment.status === "PENDING_APPROVAL"
                                    ? "Your results are with the admin for approval."
                                    : "Pick up right where you left off."}
                            </p>
                        </>
                    ) : (
                        <>
                            <h3>{completedCount > 0 ? "Ready for your next course?" : "Pick your first course"}</h3>
                            <p>Based on your skill: <strong>{primarySkill}</strong></p>
                        </>
                    )}

                    {completedCount > 0 && (
                        <p className="journey-completed-note">🎉 You've completed {completedCount} course{completedCount > 1 ? "s" : ""} so far.</p>
                    )}

                    <button onClick={() => navigate("/business-ideas")}>
                        {activeEnrollment ? "Continue This Course" : "Browse Business Ideas"}
                    </button>

                </div>

            </div>

        </section>

    );

}

export default BusinessRecommendations;
