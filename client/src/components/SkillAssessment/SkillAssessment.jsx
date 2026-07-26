import "./SkillAssessment.css";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { saveSkillsRequest } from "../../services/profileService";
import { toast } from "../../context/ToastContext";

function SkillAssessment() {

    const skills = [
        "Cooking",
        "Tailoring",
        "Graphic Design",
        "Photography",
        "Teaching",
        "Carpentry",
        "Electrician",
        "Plumbing",
        "Mobile Repair",
        "Computer Skills",
        "Digital Marketing",
        "Handicrafts",
        "Agriculture",
        "Painting",
        "Content Writing",
        "Video Editing"
    ];

    const [selectedSkills, setSelectedSkills] = useState(() => {
        const preselected = localStorage.getItem("preselectedSkills");
        return preselected ? JSON.parse(preselected) : [];
    });
    const [primarySkill, setPrimarySkill] = useState("");

    const navigate = useNavigate();
    const { user } = useAuth();

    // Skills are a one-time choice. Once a primary skill has been saved
    // (locally or on the account), this page should never be shown again -
    // redirect straight to the dashboard, replacing this history entry so
    // the back button on the dashboard goes to Home, not back here.
    useEffect(() => {
        if (localStorage.getItem("primarySkill")) {
            navigate("/dashboard", { replace: true });
        }
    }, [navigate]);

    function toggleSkill(skill) {

        if (selectedSkills.includes(skill)) {

            setSelectedSkills(
                selectedSkills.filter(item => item !== skill)
            );

            if (primarySkill === skill) {
                setPrimarySkill("");
            }

        } else {

            setSelectedSkills([
                ...selectedSkills,
                skill
            ]);

        }

    }

    async function handleContinue() {

        if (selectedSkills.length === 0) {
            toast.error("Please select at least one skill.");
            return;
        }

        if (primarySkill === "") {
            toast.error("Please choose your primary skill.");
            return;
        }

        localStorage.setItem(
    "primarySkill",
    primarySkill
);

localStorage.setItem(
    "selectedSkills",
    JSON.stringify(selectedSkills)
);

localStorage.removeItem("preselectedSkills");

if (user) {
    try {
        await saveSkillsRequest({ selectedSkills, primarySkill });
    } catch (error) {
        // Not fatal - the assessment still works from localStorage even
        // if saving to the account fails (e.g. API briefly unreachable).
        console.error("Could not save skills to your account:", error);
    }
}

navigate("/dashboard", { replace: true });

    }

    return (

        <section className="skill-assessment">

            <div className="skill-box">

                <h2>Select Your Skills</h2>

                <p>
                    Select all the skills you already have and choose one as your primary skill.
                </p>

                <div className="skills-list">

                    {skills.map((skill) => (

                        <button
                            key={skill}
                            onClick={() => toggleSkill(skill)}
                            className={
                                selectedSkills.includes(skill)
                                    ? "skill-btn selected"
                                    : "skill-btn"
                            }
                        >
                            {skill}
                        </button>

                    ))}

                </div>

                {selectedSkills.length > 0 && (

                    <>

                        <h3 className="primary-heading">
                            Select Your Primary Skill
                        </h3>

                        <select
                            value={primarySkill}
                            onChange={(e) => setPrimarySkill(e.target.value)}
                        >

                            <option value="">
                                Choose Primary Skill
                            </option>

                            {selectedSkills.map((skill) => (

                                <option
                                    key={skill}
                                    value={skill}
                                >
                                    {skill}
                                </option>

                            ))}

                        </select>

                    </>

                )}

                <button
                    className="continue-btn"
                    onClick={handleContinue}
                >
                    Continue
                </button>

            </div>

        </section>

    );

}

export default SkillAssessment;