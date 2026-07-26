import "./ListingPages.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import businesses from "../data/businesses";
import { useAuth } from "../context/AuthContext";
import { fetchMyEnrollments } from "../services/examService";
import { fetchMyCertificates } from "../services/certificateService";
import {
  saveSelectedBusinessRequest,
  fetchProfile,
  toggleBookmarkRequest,
} from "../services/profileService";
import ReportCard from "../components/ReportCard/ReportCard";
import Skeleton from "../components/Skeleton/Skeleton";
import SearchBar from "../components/Search/Search";
import EmptyState from "../components/EmptyState/EmptyState";
import { Lightbulb } from "lucide-react";

function BusinessIdeas() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const primarySkill = localStorage.getItem("primarySkill");

  const [enrollments, setEnrollments] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState([]);
  const [loadingData, setLoadingData] = useState(Boolean(user && primarySkill));
  const [reportCardFor, setReportCardFor] = useState(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user || !primarySkill) return;
    Promise.all([fetchMyEnrollments(), fetchMyCertificates(), fetchProfile()])
      .then(([e, c, progress]) => {
        setEnrollments(e);
        setCertificates(c);
        setBookmarkedIds(progress?.bookmarkedBusinessIds || []);
      })
      .finally(() => setLoadingData(false));
  }, [user, primarySkill]);

  async function handleToggleBookmark(business) {
    const id = String(business.id);
    setBookmarkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
    try {
      await toggleBookmarkRequest(id);
    } catch {
      // Not fatal - it'll just re-sync next time the profile is fetched.
    }
  }

  async function handlePickCourse(business) {
    localStorage.setItem("selectedBusiness", business.title);
    localStorage.removeItem("roadmapProgress");
    try {
      await saveSelectedBusinessRequest(business.title, primarySkill);
    } catch {
      // Not fatal - it's still saved locally for this session.
    }
    navigate("/business-details");
  }

  if (loading || loadingData) {
    return (
      <MainLayout>
        <section className="listing-page">
          <h1>Business Ideas For You</h1>
          <Skeleton
            variant="cards"
            count={6}
            label="Loading your business ideas"
          />
        </section>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <section className="listing-page">
          <h1>Explore Business Ideas</h1>
          <div className="login-required-note">
            <p>Please log in to view business ideas matched to your skills.</p>
            <button onClick={() => navigate("/login")}>Login</button>
          </div>
        </section>
      </MainLayout>
    );
  }

  if (!primarySkill) {
    return (
      <MainLayout>
        <section className="listing-page">
          <h1>Explore Business Ideas</h1>
          <div className="login-required-note">
            <p>
              Complete your skill assessment first to see business ideas matched
              to you.
            </p>
            <button onClick={() => navigate("/skill-assessment")}>
              Take Skill Assessment
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  const activeEnrollment = enrollments.find(
    (e) => e.status === "IN_PROGRESS" || e.status === "PENDING_APPROVAL",
  );
  const completedEnrollments = enrollments.filter(
    (e) => e.status === "COMPLETED",
  );
  const completedTitles = completedEnrollments.map((e) => e.businessTitle);

  const availableBusinesses = businesses.filter(
    (b) => b.skill === primarySkill && !completedTitles.includes(b.title),
  );

  const q = query.trim().toLowerCase();
  const visibleBusinesses = q
    ? availableBusinesses.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          b.description?.toLowerCase().includes(q),
      )
    : availableBusinesses;

  return (
    <MainLayout>
      <section className="listing-page">
        <h1>Business Ideas For You</h1>
        <p>
          Based on your selected skill: <strong>{primarySkill}</strong>
        </p>

        {completedEnrollments.length > 0 && (
          <div className="completed-courses-block">
            <h2>Completed Courses</h2>
            <div className="listing-grid">
              {completedEnrollments.map((e) => (
                <div key={e.id} className="listing-card completed-card">
                  <span className="listing-tag completed-tag">✓ Completed</span>
                  <h3>{e.businessTitle}</h3>
                  <button onClick={() => setReportCardFor(e)}>
                    View Report Card
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeEnrollment ? (
          <div className="listing-grid" style={{ marginTop: 30 }}>
            <div className="listing-card active-card">
              <span className="listing-tag">In Progress</span>
              <h3>{activeEnrollment.businessTitle}</h3>
              <p>
                Finish this course (exam + interview) before starting another.
              </p>
              <button onClick={() => navigate("/dashboard")}>
                Continue Your Journey
              </button>
            </div>
          </div>
        ) : availableBusinesses.length > 0 ? (
          <>
            <h2 style={{ marginTop: 30 }}>
              {completedEnrollments.length > 0
                ? "Start Your Next Course"
                : "Pick a Course to Start"}
            </h2>

            <SearchBar
              value={query}
              onChange={setQuery}
              placeholder="Search business ideas..."
              label="Search business ideas"
            />

            {visibleBusinesses.length === 0 ? (
              <EmptyState
                icon={<Lightbulb size={28} />}
                message={`No business ideas match "${query}".`}
                actionLabel="Clear search"
                onAction={() => setQuery("")}
              />
            ) : (
              <div className="listing-grid">
                {visibleBusinesses.map((business) => (
                  <div key={business.id} className="listing-card">
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <span className="listing-tag">{business.skill}</span>
                      <button
                        onClick={() => handleToggleBookmark(business)}
                        aria-label={
                          bookmarkedIds.includes(String(business.id))
                            ? "Remove bookmark"
                            : "Bookmark this idea"
                        }
                        title={
                          bookmarkedIds.includes(String(business.id))
                            ? "Remove bookmark"
                            : "Bookmark this idea"
                        }
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: 20,
                          cursor: "pointer",
                          color: bookmarkedIds.includes(String(business.id))
                            ? "#F59E0B"
                            : "#D1D5DB",
                        }}
                      >
                        {bookmarkedIds.includes(String(business.id))
                          ? "★"
                          : "☆"}
                      </button>
                    </div>
                    <h3>{business.title}</h3>
                    <p>{business.description}</p>
                    <div className="listing-meta">
                      <span>
                        <strong>Investment:</strong> {business.investment}
                      </span>
                      <span>
                        <strong>Income:</strong> {business.income}
                      </span>
                    </div>
                    <button onClick={() => handlePickCourse(business)}>
                      Start This Course
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <EmptyState
            icon={<Lightbulb size={28} />}
            message={`You've completed every course available for ${primarySkill}. Amazing work! 🎉`}
          />
        )}
      </section>

      {reportCardFor && (
        <ReportCard
          enrollment={reportCardFor}
          certificate={certificates.find(
            (c) => c.businessTitle === reportCardFor.businessTitle,
          )}
          onClose={() => setReportCardFor(null)}
        />
      )}
    </MainLayout>
  );
}

export default BusinessIdeas;
