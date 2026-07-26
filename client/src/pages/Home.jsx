import SkillPreview from "../components/SkillPreview/SkillPreview";
import WhyChooseUs from "../components/WhyChooseUs/WhyChooseUs";
import BusinessCategories from "../components/BusinessCategories/BusinessCategories";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import MainLayout from "../layouts/MainLayout";
import Hero from "../components/Hero/Hero";
import MyJourney from "../components/MyJourney/MyJourney";
import { useAuth } from "../context/AuthContext";

function Home() {
    const { user } = useAuth();
    const primarySkill = localStorage.getItem("primarySkill");
    const isLearner = !user || user.role === "USER";
    const hasChosenSkill = user?.role === "USER" && Boolean(primarySkill);

    return (
        <MainLayout>

            <Hero />

            {isLearner && <HowItWorks />}

            {isLearner && <WhyChooseUs />}

            {isLearner && (hasChosenSkill ? <MyJourney skill={primarySkill} /> : <SkillPreview />)}

            {isLearner && <BusinessCategories />}

        </MainLayout>
    );
}

export default Home;
