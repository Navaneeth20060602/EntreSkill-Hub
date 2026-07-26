import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import ProtectedRoute from "./routes/ProtectedRoute";
import Skeleton from "./components/Skeleton/Skeleton";

// Every page is now code-split with React.lazy so the initial bundle only
// ships the app shell + router. Each route's chunk is fetched on demand,
// which keeps first load fast instead of downloading every page up front.
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const BusinessIdeas = lazy(() => import("./pages/BusinessIdeas"));
const Learning = lazy(() => import("./pages/Learning"));
const Mentors = lazy(() => import("./pages/Mentors"));
const SkillAssessment = lazy(() => import("./pages/SkillAssessment"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const BusinessDetails = lazy(() => import("./pages/BusinessDetails"));
const LearningResourcesPage = lazy(() => import("./pages/LearningResources"));
const BusinessRoadmap = lazy(() => import("./pages/BusinessRoadmap"));
const MentorModulePage = lazy(() => import("./pages/MentorModule"));
const MentorDashboardPage = lazy(() => import("./pages/MentorDashboard"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboard"));
const MentorChat = lazy(() => import("./pages/MentorChat"));
const ExamPageWrapper = lazy(() => import("./pages/Exam"));
const InterviewPage = lazy(() => import("./pages/Interview"));
const CertificatePage = lazy(() => import("./pages/Certificate"));
const ReportCardPage = lazy(() => import("./pages/ReportCard"));
const NotFound = lazy(() => import("./pages/NotFound"));

function RouteFallback() {
    return <Skeleton variant="page" label="Loading page" />;
}

function App() {

    return (

        <BrowserRouter>

            <Suspense fallback={<RouteFallback />}>

            <Routes>

                <Route path="/" element={<Home />} />

                <Route path="/business-ideas" element={<BusinessIdeas />} />

                <Route path="/learning" element={<Learning />} />

                <Route path="/mentors" element={<Mentors />} />

                <Route path="/login" element={<Login />} />

                <Route path="/register" element={<Register />} />

                <Route path="/forgot-password" element={<ForgotPassword />} />

                <Route path="/about" element={<About />} />

                <Route path="/contact" element={<Contact />} />

                <Route
                    path="/skill-assessment"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <SkillAssessment />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mentor-dashboard"
                    element={
                        <ProtectedRoute roles={["MENTOR"]}>
                            <MentorDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/admin-dashboard"
                    element={
                        <ProtectedRoute roles={["ADMIN"]}>
                            <AdminDashboardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/chat/:mentorId"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <MentorChat />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/exam"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <ExamPageWrapper />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/interview"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <InterviewPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/certificate"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <CertificatePage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/report-card"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <ReportCardPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/business-details"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <BusinessDetails />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/learning-resources"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <LearningResourcesPage />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/business-roadmap"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <BusinessRoadmap />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/mentor-module"
                    element={
                        <ProtectedRoute roles={["USER"]}>
                            <MentorModulePage />
                        </ProtectedRoute>
                    }
                />

                <Route path="*" element={<NotFound />} />

            </Routes>

            </Suspense>

        </BrowserRouter>

    );

}

export default App;
