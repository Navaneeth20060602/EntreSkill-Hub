import "./MyJourney.css";
import { useNavigate } from "react-router-dom";

// Replaces the "pick your skills" section on the homepage once a logged-in
// user has already chosen a skill - showing their progress instead of a
// stale invitation to pick skills again.
function MyJourney({ skill }) {
    const navigate = useNavigate();
    const selectedBusiness = localStorage.getItem("selectedBusiness");
    const progress = Number(localStorage.getItem("roadmapProgress") || 0);

    return (
        <section className="my-journey">

            <h2>Your Entrepreneurship Journey</h2>
            <p>Pick up right where you left off.</p>

            <div className="my-journey-card">
                <div>
                    <h3>{selectedBusiness || `Exploring ${skill} businesses`}</h3>
                    <p>
                        {selectedBusiness
                            ? `You're ${progress}% through your roadmap.`
                            : `Your primary skill: ${skill}. Pick a business idea to get started.`}
                    </p>
                </div>
                <button onClick={() => navigate("/dashboard")}>
                    Go to Dashboard
                </button>
            </div>

        </section>
    );
}

export default MyJourney;
