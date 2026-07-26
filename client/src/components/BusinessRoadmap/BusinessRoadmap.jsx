import "./BusinessRoadmap.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoadmapProgress from "../RoadmapProgress/RoadmapProgress";
import CourseStepper from "../CourseStepper/CourseStepper";
import roadmaps from "../../data/roadmaps";
import learningResources from "../../data/learningResources";
import { fetchMyEnrollments } from "../../services/examService";

function BusinessRoadmap() {

    const navigate = useNavigate();

    const selectedBusiness = localStorage.getItem("selectedBusiness");

    const roadmap = roadmaps[selectedBusiness] || [];
    const hasLearningResources = Boolean(learningResources[selectedBusiness]);
    const resourcesCompleted = localStorage.getItem(`resourcesCompleted:${selectedBusiness}`) === "true";
    const progress = Number(localStorage.getItem("roadmapProgress") || 0);

    const [enrollment, setEnrollment] = useState(null);

    useEffect(() => {
        fetchMyEnrollments().then((list) => setEnrollment(list.find((e) => e.businessTitle === selectedBusiness) || null));
    }, [selectedBusiness]);

    return (

        <section className="roadmap">

            <CourseStepper current="roadmap" enrollment={enrollment} />

            <h2>{selectedBusiness} Roadmap</h2>

            <p>
                Follow these steps to successfully start your business.
            </p>

            {hasLearningResources && !resourcesCompleted && (
                <div className="roadmap-tip">
                    💡 Tip: it's easier to follow this roadmap after going through your mentor's resources first.
                    <button onClick={() => navigate("/learning-resources")}>Go to Resources</button>
                </div>
            )}

            <div className="roadmap-list">

                {

                    roadmap.map((step, index) => (

                        <div

                            key={index}

                            className="roadmap-card"

                        >

                            <div className="step-number">

                                {index + 1}

                            </div>

                            <h3>

                                {step}

                            </h3>

                        </div>

                    ))

                }

            </div>

            <RoadmapProgress />

            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "16px",
                    marginTop: "40px",
                    flexWrap: "wrap"
                }}
            >

                {progress >= 100 && (
                    <button
                        onClick={() => navigate("/exam")}
                        style={{
                            padding: "15px 30px",
                            border: "none",
                            borderRadius: "10px",
                            background: "#15803D",
                            color: "white",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                    >
                        Take Final Exam
                    </button>
                )}

                <button

                    onClick={() => navigate("/mentor-module")}

                    style={{
                        padding: "15px 30px",
                        border: "none",
                        borderRadius: "10px",
                        background: "#2563EB",
                        color: "white",
                        cursor: "pointer",
                        fontSize: "16px"
                    }}

                >

                    Continue to Mentors

                </button>

            </div>

        </section>

    );

}

export default BusinessRoadmap;
