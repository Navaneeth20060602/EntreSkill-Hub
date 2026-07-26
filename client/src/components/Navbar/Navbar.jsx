import "./Navbar.css";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Globe } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { LANGUAGES } from "../../i18n/translations";
import { API_ORIGIN } from "../../services/api";
import NotificationBell from "../NotificationBell/NotificationBell";

function LanguageSwitcher() {
    const { language, setLanguage } = useLanguage();
    const [open, setOpen] = useState(false);

    return (
        <div className="language-switcher">
            <button className="language-switcher-btn" onClick={() => setOpen((v) => !v)}>
                <Globe size={16} className="language-switcher-icon" /> {LANGUAGES.find((l) => l.code === language)?.label}
            </button>
            {open && (
                <div className="language-dropdown">
                    {LANGUAGES.map((l) => (
                        <button
                            key={l.code}
                            className={l.code === language ? "language-option active" : "language-option"}
                            onClick={() => { setLanguage(l.code); setOpen(false); }}
                        >
                            {l.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function Navbar() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();
    const navigate = useNavigate();

    async function handleLogout() {
        await logout();
        localStorage.removeItem("primarySkill");
        localStorage.removeItem("selectedSkills");
        navigate("/");
    }

    return (
        <nav className="navbar">

            <div className="navbar__logo">
                <Link to="/">EntreSkill Hub</Link>
            </div>

            <ul className="navbar__links">

                <li>
                    <Link to="/">{t("home")}</Link>
                </li>

                {
                    (!user || user.role === "USER") && (
                        <>
                            <li>
                                <Link to="/business-ideas">{t("businessIdeas")}</Link>
                            </li>

                            <li>
                                <Link to="/learning">{t("learning")}</Link>
                            </li>

                            <li>
                                <Link to="/mentors">{t("mentors")}</Link>
                            </li>
                        </>
                    )
                }

                {
                    user?.role === "MENTOR" && (
                        <li>
                            <Link to="/mentor-dashboard">My Chats & Resources</Link>
                        </li>
                    )
                }

                {
                    user?.role === "ADMIN" && (
                        <li>
                            <Link to="/admin-dashboard">Manage Platform</Link>
                        </li>
                    )
                }

                <li>
                    <Link to="/about">{t("about")}</Link>
                </li>

                {
                    user?.role !== "ADMIN" && (
                        <li>
                            <Link to="/contact">{user?.role === "USER" || !user ? t("contact") : t("support")}</Link>
                        </li>
                    )
                }

            </ul>

            <div className="navbar__buttons">

                <LanguageSwitcher />

                {user && <NotificationBell />}

                {
                    user ? (
                        <>
                            <Link to={
                                user.role === "ADMIN" ? "/admin-dashboard" :
                                user.role === "MENTOR" ? "/mentor-dashboard" :
                                "/dashboard"
                            }>
                                <button className="navbar__login-btn navbar__avatar-btn">
                                    {user.photo ? (
                                        <img className="navbar__avatar" src={`${API_ORIGIN}${user.photo}`} alt="" />
                                    ) : (
                                        <span className="navbar__avatar navbar__avatar-fallback">
                                            {(user.fullName && !user.fullName.includes("@") ? user.fullName[0] : "U").toUpperCase()}
                                        </span>
                                    )}
                                    {t("hi")}, {user.fullName && !user.fullName.includes("@") ? user.fullName.split(" ")[0] : (user.role === "ADMIN" ? "Admin" : user.role === "MENTOR" ? "Mentor" : "there")}
                                </button>
                            </Link>

                            <button className="navbar__register-btn" onClick={handleLogout}>
                                {t("logout")}
                            </button>
                        </>
                    ) : (
                        <>
                            <Link to="/login">
                                <button className="navbar__login-btn">
                                    {t("login")}
                                </button>
                            </Link>

                            <Link to="/register">
                                <button className="navbar__register-btn">
                                    {t("register")}
                                </button>
                            </Link>
                        </>
                    )
                }

            </div>

        </nav>
    );
}

export default Navbar;
