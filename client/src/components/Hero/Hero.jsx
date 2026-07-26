import "./Hero.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";

function Hero() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { t } = useLanguage();
    const hasSkill = Boolean(localStorage.getItem("primarySkill"));

    let heading = "Turn Your Skills Into a Successful Business";
    let subtext = "Discover business ideas based on your skills, follow step-by-step roadmaps, learn from expert resources, and connect with experienced mentors.";
    let buttons = (
        <div className="hero-buttons">
            <button onClick={() => navigate(user ? (hasSkill ? "/dashboard" : "/skill-assessment") : "/register")}>
                {t("getStarted")}
            </button>
            <button onClick={() => navigate("/business-ideas")}>
                {t("exploreIdeas")}
            </button>
        </div>
    );

    if (user?.role === "MENTOR") {
        heading = "Welcome Back, Mentor";
        subtext = "Guide your students, share resources, manage exams, and track their progress - all from your dashboard.";
        buttons = (
            <div className="hero-buttons">
                <button onClick={() => navigate("/mentor-dashboard")}>Go to My Dashboard</button>
            </div>
        );
    } else if (user?.role === "ADMIN") {
        heading = "Welcome Back, Admin";
        subtext = "Manage users, mentors, complaints, and certificates for the whole platform.";
        buttons = (
            <div className="hero-buttons">
                <button onClick={() => navigate("/admin-dashboard")}>Go to Admin Dashboard</button>
            </div>
        );
    } else if (user && hasSkill) {
        heading = "Welcome Back!";
        subtext = "You're already on your way. Jump back into your dashboard to continue where you left off.";
        buttons = (
            <div className="hero-buttons">
                <button onClick={() => navigate("/dashboard")}>{t("continueJourney")}</button>
            </div>
        );
    }

    return (
        <section className="hero">

            <div className="hero-content">

                <h1>
                    {heading}
                </h1>

                <p>
                    {subtext}
                </p>

                {buttons}

            </div>

            <div className="hero-image">
                <svg viewBox="0 0 420 340" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Growth illustration">
                    <circle cx="210" cy="170" r="150" fill="#EFF6FF" />
                    <rect x="70" y="190" width="45" height="90" rx="6" fill="#93C5FD" />
                    <rect x="135" y="150" width="45" height="130" rx="6" fill="#60A5FA" />
                    <rect x="200" y="110" width="45" height="170" rx="6" fill="#3B82F6" />
                    <rect x="265" y="70" width="45" height="210" rx="6" fill="#2563EB" />
                    <polyline points="92,180 157,140 222,100 287,60" fill="none" stroke="#1D4ED8" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="287" cy="60" r="9" fill="#1D4ED8" />
                    <circle cx="222" cy="100" r="7" fill="#1D4ED8" />
                    <circle cx="157" cy="140" r="7" fill="#1D4ED8" />
                    <circle cx="92" cy="180" r="7" fill="#1D4ED8" />
                    <circle cx="330" cy="80" r="26" fill="#FDE68A" />
                    <path d="M330 62 v-8 M330 106 v-8 M312 80 h-8 M356 80 h-8 M317 67 l-6-6 M349 93 l6 6 M317 93 l-6 6 M349 67 l6-6" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
                </svg>
            </div>

        </section>
    );
}

export default Hero;
