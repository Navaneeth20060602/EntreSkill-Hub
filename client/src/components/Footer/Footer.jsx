import "./Footer.css";
import { Link } from "react-router-dom";

function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">

                <div className="footer-brand">
                    <h3>EntreSkill Hub</h3>
                    <p>Turning skills into sustainable micro-businesses.</p>
                </div>

                <div className="footer-links">
                    <Link to="/business-ideas">Business Ideas</Link>
                    <Link to="/learning">Learning</Link>
                    <Link to="/mentors">Mentors</Link>
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                </div>

            </div>

            <p className="footer-copy">
                &copy; {new Date().getFullYear()} EntreSkill Hub. All rights reserved.
            </p>
        </footer>
    );
}

export default Footer;
