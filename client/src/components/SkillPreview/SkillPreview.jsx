import "./SkillPreview.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const PREVIEW_SKILLS = [
    "Cooking",
    "Tailoring",
    "Handicrafts",
    "Mobile Repair",
    "Graphic Design",
    "Teaching",
    "Photography",
    "Electrician"
];

function SkillPreview() {
    const [selected, setSelected] = useState([]);
    const navigate = useNavigate();
    const { user } = useAuth();

    function toggleSkill(skill) {
        setSelected((prev) =>
            prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
        );
    }

    function handleContinue() {
        if (!user) {
            // Remember what they picked so it can prefill the real skill
            // assessment once they've registered.
            if (selected.length > 0) {
                localStorage.setItem("preselectedSkills", JSON.stringify(selected));
            }
            navigate("/register");
            return;
        }

        if (localStorage.getItem("primarySkill")) {
            navigate("/dashboard");
        } else {
            navigate("/skill-assessment");
        }
    }

    return (
        <section className="skill-preview">

            <h2>Find the Right Business for Your Skills</h2>

            <p>
                Select the skills you already have. After registration, we'll recommend business ideas that match your strengths.
            </p>

            <div className="skills-grid">

                {PREVIEW_SKILLS.map((skill) => (
                    <button
                        key={skill}
                        type="button"
                        className={selected.includes(skill) ? "skill-chip selected" : "skill-chip"}
                        onClick={() => toggleSkill(skill)}
                    >
                        {skill}
                    </button>
                ))}

            </div>

            <button className="continue-btn" onClick={handleContinue}>
                Continue →
            </button>

        </section>
    );
}

export default SkillPreview;
