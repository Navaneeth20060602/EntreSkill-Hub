import "./GoogleSignInButton.css";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { toast } from "../../context/ToastContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

// Renders Google's own "Sign in with Google" button via Google Identity
// Services. Requires a real Google OAuth Client ID in VITE_GOOGLE_CLIENT_ID -
// without one, this quietly shows nothing rather than a broken button.
function GoogleSignInButton() {
    const buttonRef = useRef(null);
    const { loginWithGoogle } = useAuth();
    const navigate = useNavigate();
    const [ready, setReady] = useState(false);

    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) return;

        function handleCredentialResponse(response) {
            loginWithGoogle(response.credential)
                .then((user) => {
                    if (user.role === "ADMIN") navigate("/admin-dashboard", { replace: true });
                    else if (user.role === "MENTOR") navigate("/mentor-dashboard", { replace: true });
                    else {
                        const hasPrimarySkill = Boolean(localStorage.getItem("primarySkill"));
                        navigate(hasPrimarySkill ? "/dashboard" : "/skill-assessment", { replace: true });
                    }
                })
                .catch((err) => {
                    toast.error(err.response?.data?.message || "Google sign-in failed. Please try again.");
                });
        }

        function initialize() {
            if (!window.google?.accounts?.id) return;
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleCredentialResponse,
            });
            if (buttonRef.current) {
                window.google.accounts.id.renderButton(buttonRef.current, {
                    theme: "outline",
                    size: "large",
                    width: 320,
                    text: "continue_with",
                });
            }
            setReady(true);
        }

        if (window.google?.accounts?.id) {
            initialize();
            return;
        }

        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = initialize;
        document.body.appendChild(script);

        return () => {
            // Leave the script loaded - it's cheap and other pages may reuse it.
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (!GOOGLE_CLIENT_ID) return null;

    return (
        <>
            <div className="google-divider">or</div>
            <div className="google-signin-wrap">
                <div ref={buttonRef} />
            </div>
            {!ready && <p className="google-signin-note">Loading Google Sign-In...</p>}
        </>
    );
}

export default GoogleSignInButton;
