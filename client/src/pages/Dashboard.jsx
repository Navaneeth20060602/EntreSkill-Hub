import MainLayout from "../layouts/MainLayout";
import DashboardCards from "../components/Dashboard/DashboardCards";
import DashboardSnapshot from "../components/Dashboard/DashboardSnapshot";
import BusinessRecommendations from "../components/BusinessRecommendations/BusinessRecommendations";
import MyMarks from "../components/MyMarks/MyMarks";
import ProfilePanel from "../components/ProfilePanel/ProfilePanel";

function Dashboard() {

    return (

        <MainLayout>

            <DashboardCards />

            <DashboardSnapshot />

            <BusinessRecommendations />

            <MyMarks />

            <ProfilePanel />

        </MainLayout>

    );

}

export default Dashboard;
