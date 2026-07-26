import "./InfoPages.css";
import MainLayout from "../layouts/MainLayout";

function About() {
    return (
        <MainLayout>
            <section className="info-page">

                <h1>About EntreSkill Hub</h1>

                <p>
                    Many people already have the skills to run a business - cooking,
                    tailoring, photography, teaching, repairs and more - but no clear
                    path from "I'm good at this" to "I run a business doing this".
                    EntreSkill Hub exists to close that gap.
                </p>

                <p>
                    We help you turn a skill into a business idea, follow a clear
                    step-by-step roadmap, learn what you're missing, and connect with
                    mentors who've done it before.
                </p>

                <div className="info-grid">
                    <div className="info-card">
                        <h3>🎯 Our Mission</h3>
                        <p>Make self-employment achievable for anyone with a skill, regardless of background.</p>
                    </div>

                    <div className="info-card">
                        <h3>🌱 Who We're For</h3>
                        <p>Aspiring entrepreneurs, especially women, youth and rural communities.</p>
                    </div>

                    <div className="info-card">
                        <h3>🤝 How We Help</h3>
                        <p>Skill assessment, business roadmaps, learning resources and mentorship - all in one place.</p>
                    </div>
                </div>

            </section>
        </MainLayout>
    );
}

export default About;
