import "./NextStepBanner.css";
import { useNavigate } from "react-router-dom";
import { PartyPopper, ArrowRight } from "lucide-react";

// Computes the learner's single next action from their enrollment/progress
// data and surfaces it as one headline CTA, using the same stage logic as
// CourseStepper (Resources -> Roadmap -> Exam -> Interview -> Certificate).
function NextStepBanner({ selectedBusiness, enrollment, progress }) {
    const navigate = useNavigate();

    if (!selectedBusiness) return null;

    const businessTitle = selectedBusiness;
    const resourcesCompleted = localStorage.getItem(`resourcesCompleted:${businessTitle}`) === "true";
    const roadmapDone = progress >= 100;
    const examPassed = Boolean(enrollment?.examPassed);
    const interviewPassed = Boolean(enrollment?.interviewPassed);
    const courseCompleted = enrollment?.status === "COMPLETED";
    const interviewScheduled = enrollment?.interviewStatus === "SCHEDULED" && enrollment?.interviewScheduledAt;

    let step = null;

    if (courseCompleted) {
        step = {
            title: <><PartyPopper size={20} className="next-step-title-icon" /> You've completed this course!</>,
            subtitle: "Your certificate is ready to view and download.",
            cta: "View Certificate",
            path: "/certificate",
        };
    } else if (interviewPassed) {
        step = {
            title: "Almost there — awaiting final approval",
            subtitle: "Your mentor/admin needs to confirm your completion before your certificate is issued.",
            cta: "View Report Card",
            path: "/report-card",
        };
    } else if (examPassed && interviewScheduled) {
        const when = new Date(enrollment.interviewScheduledAt);
        const formatted = when.toLocaleString(undefined, {
            weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
        });
        step = {
            title: `Your interview is scheduled — ${formatted}`,
            subtitle: "Join a few minutes early using your Google Meet link.",
            cta: "Go to Interview",
            path: "/interview",
        };
    } else if (examPassed) {
        step = {
            title: "You passed the exam — nice work!",
            subtitle: "Next, wait for your mentor to schedule your interview.",
            cta: "Check Interview Status",
            path: "/interview",
        };
    } else if (roadmapDone) {
        step = {
            title: "Ready for your final exam",
            subtitle: "You've completed your roadmap. Take the exam when you're ready — you'll get one attempt.",
            cta: "Take Final Exam",
            path: "/exam",
        };
    } else if (resourcesCompleted) {
        step = {
            title: "Keep going on your roadmap",
            subtitle: `You're at ${progress}% — finish it to unlock your final exam.`,
            cta: "Continue Roadmap",
            path: "/business-roadmap",
        };
    } else {
        step = {
            title: "Start with your mentor's learning resources",
            subtitle: "Watch the videos and read through the notes your mentor shared to get going.",
            cta: "Watch Resources",
            path: "/learning-resources",
        };
    }

    return (
        <div className="next-step-banner">
            <div className="next-step-text">
                <span className="next-step-label">Your Next Step</span>
                <h2>{step.title}</h2>
                <p>{step.subtitle}</p>
            </div>
            <button className="next-step-cta" onClick={() => navigate(step.path)}>
                {step.cta} <ArrowRight size={16} />
            </button>
        </div>
    );
}

export default NextStepBanner;
