import "./CourseStepper.css";
import { useNavigate } from "react-router-dom";
import { toast } from "../../context/ToastContext";

// A visual guide to the recommended order (Resources -> Roadmap -> Exam ->
// Interview -> Certificate). Earlier steps are always free to revisit;
// exam/interview/certificate genuinely require finishing what comes before
// them, so clicking those out of order explains what's missing instead of
// silently doing nothing.
function CourseStepper({ current, enrollment }) {
    const navigate = useNavigate();

    const businessTitle = localStorage.getItem("selectedBusiness");
    const resourcesCompleted = localStorage.getItem(`resourcesCompleted:${businessTitle}`) === "true";
    const roadmapDone = Number(localStorage.getItem("roadmapProgress") || 0) >= 100;
    const examPassed = Boolean(enrollment?.examPassed);
    const interviewPassed = Boolean(enrollment?.interviewPassed);

    const steps = [
        { key: "resources", label: "Resources", path: "/learning-resources", done: resourcesCompleted, locked: false },
        { key: "roadmap", label: "Roadmap", path: "/business-roadmap", done: roadmapDone, locked: false },
        { key: "exam", label: "Final Exam", path: "/exam", done: examPassed, locked: !roadmapDone, lockedMessage: "Complete the roadmap (100%) first." },
        { key: "interview", label: "Interview", path: "/interview", done: interviewPassed, locked: !examPassed, lockedMessage: "Pass the final exam first." },
        { key: "certificate", label: "Certificate", path: "/certificate", done: enrollment?.status === "COMPLETED", locked: !interviewPassed, lockedMessage: "Pass the interview first." },
    ];

    function handleClick(step) {
        if (step.locked) {
            toast.error(step.lockedMessage);
            return;
        }
        navigate(step.path);
    }

    return (
        <div className="course-stepper">
            {steps.map((step, idx) => (
                <span key={step.key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <button
                        className={`stepper-step ${step.done ? "done" : ""} ${current === step.key ? "current" : ""} ${step.locked ? "locked" : ""}`}
                        onClick={() => handleClick(step)}
                    >
                        <span className="step-circle">{step.done ? "✓" : step.locked ? "🔒" : idx + 1}</span>
                        {step.label}
                    </button>
                    {idx < steps.length - 1 && <span className="stepper-arrow">→</span>}
                </span>
            ))}
        </div>
    );
}

export default CourseStepper;
