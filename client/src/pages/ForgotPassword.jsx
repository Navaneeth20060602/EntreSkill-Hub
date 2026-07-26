import { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { forgotPasswordRequest, resetPasswordRequest } from "../services/authService";
import "../components/Auth/LoginForm.css";

function ForgotPassword() {
    const navigate = useNavigate();
    const [stage, setStage] = useState("request"); // request -> reset -> done
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [demoOtp, setDemoOtp] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleRequestOtp(e) {
        e.preventDefault();
        setError("");
        setSubmitting(true);
        try {
            const result = await forgotPasswordRequest(email);
            setDemoOtp(result?.demoOtp || "");
            setStage("reset");
        } catch (err) {
            setError(err.response?.data?.message || "Could not send OTP. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();
        setError("");

        if ((newPassword.length < 8 || !/[0-9]/.test(newPassword) || !/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\/;'`~]/.test(newPassword))) {
            setError("New password must be at least 8 characters, with a number and a special character.");
            return;
        }
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);
        try {
            await resetPasswordRequest({ email, otp, newPassword });
            setStage("done");
        } catch (err) {
            setError(err.response?.data?.message || "Could not reset password. Please try again.");
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <MainLayout>
            <section className="login">
                <div className="login-box">

                    <h2>Reset Your Password</h2>

                    {stage === "request" && (
                        <>
                            <p>Enter your account email and we'll send you an OTP.</p>
                            {error && <p className="login-error">{error}</p>}
                            <form onSubmit={handleRequestOtp}>
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Sending..." : "Send OTP"}
                                </button>
                            </form>
                        </>
                    )}

                    {stage === "reset" && (
                        <>
                            <p>Enter the OTP sent to {email} and choose a new password.</p>
                            {demoOtp && (
                                <p className="otp-demo-note" style={{ background: "#FEF3C7", color: "#92400E", padding: "8px 12px", borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
                                    Demo mode (no email provider configured yet): your OTP is <strong>{demoOtp}</strong>
                                </p>
                            )}
                            {error && <p className="login-error">{error}</p>}
                            <form onSubmit={handleResetPassword}>
                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    maxLength={6}
                                />
                                <input
                                    type="password"
                                    placeholder="8+ chars, with a number & symbol"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button type="submit" disabled={submitting}>
                                    {submitting ? "Resetting..." : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}

                    {stage === "done" && (
                        <>
                            <p>Your password has been reset successfully.</p>
                            <button onClick={() => navigate("/login")}>
                                Back to Login
                            </button>
                        </>
                    )}

                </div>
            </section>
        </MainLayout>
    );
}

export default ForgotPassword;
