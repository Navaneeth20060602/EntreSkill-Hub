import "./ListingPages.css";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { useAuth } from "../context/AuthContext";
import { fetchMyEnrollments } from "../services/examService";
import LoadingSpinner from "../components/LoadingSpinner/LoadingSpinner";

// "Learning" isn't a separate browse/pick page anymore - course selection
// happens once, in Business Ideas, so this tab just routes the learner to
// wherever they actually need to go next.
function Learning() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const primarySkill = localStorage.getItem("primarySkill");
  const selectedBusiness = localStorage.getItem("selectedBusiness");
  const [checkingCompletion, setCheckingCompletion] = useState(
    Boolean(selectedBusiness),
  );

  useEffect(() => {
    if (loading || !user) return;

    if (!selectedBusiness) {
      if (primarySkill) navigate("/business-ideas", { replace: true });
      return;
    }

    fetchMyEnrollments()
      .then((list) => {
        const enrollment = list.find(
          (e) => e.businessTitle === selectedBusiness,
        );
        if (enrollment?.status === "COMPLETED") {
          navigate("/business-ideas", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
        }
      })
      .catch(() => {
        navigate("/dashboard", { replace: true });
      })
      .finally(() => setCheckingCompletion(false));
  }, [user, loading, primarySkill, selectedBusiness, navigate]);

  if (loading || checkingCompletion) {
    return (
      <MainLayout>
        <LoadingSpinner label="Taking you to the right place..." />
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout>
        <section className="listing-page">
          <h1>Learning Resources</h1>
          <div className="login-required-note">
            <p>
              Please log in to view learning resources matched to your skills.
            </p>
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
          <h1>Learning Resources</h1>
          <div className="login-required-note">
            <p>
              Complete your skill assessment first to see resources matched to
              you.
            </p>
            <button onClick={() => navigate("/skill-assessment")}>
              Take Skill Assessment
            </button>
          </div>
        </section>
      </MainLayout>
    );
  }

  return null;
}

export default Learning;
