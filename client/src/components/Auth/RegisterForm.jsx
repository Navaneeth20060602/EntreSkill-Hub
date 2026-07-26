import "./RegisterForm.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { sendOtpRequest, verifyOtpRequest } from "../../services/authService";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";

function RegisterForm() {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({
        fullName: "",
        email: "",
        mobile: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    // OTP state (now sent to email, not mobile)
    const [otpStage, setOtpStage] = useState("idle"); // idle -> sent -> verified
    const [otpValue, setOtpValue] = useState("");
    const [otpSending, setOtpSending] = useState(false);
    const [otpError, setOtpError] = useState("");
    const [demoOtp, setDemoOtp] = useState(""); // shown since no real email provider is set up yet

    function handleChange(e) {
        setForm({ ...form, [e.target.name]: e.target.value });

        // If they change the email after verifying, they need to verify
        // the new one too.
        if (e.target.name === "email" && otpStage === "verified") {
            setOtpStage("idle");
            setOtpValue("");
            setDemoOtp("");
        }
    }

    async function handleSendOtp() {
        setOtpError("");

        if (!form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setOtpError("Enter a valid email address first.");
            return;
        }

        if (form.mobile && !/^[0-9]{10}$/.test(form.mobile)) {
            setOtpError("Enter a valid 10-digit mobile number, or leave it blank.");
            return;
        }

        setOtpSending(true);
        try {
            const result = await sendOtpRequest(form.mobile, form.email);
            setOtpStage("sent");
            setDemoOtp(result?.demoOtp || "");
        } catch (err) {
            setOtpError(err.response?.data?.message || "Could not send OTP. Please try again.");
        } finally {
            setOtpSending(false);
        }
    }

    async function handleVerifyOtp() {
        setOtpError("");

        if (!otpValue) {
            setOtpError("Enter the OTP sent to your email.");
            return;
        }

        try {
            await verifyOtpRequest(form.email, otpValue);
            setOtpStage("verified");
        } catch (err) {
            setOtpError(err.response?.data?.message || "Incorrect OTP. Please try again.");
        }
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");

        if (!form.fullName || !form.email || !form.password) {
            setError("Please fill in your name, email and password.");
            return;
        }

        if (otpStage !== "verified") {
            setError("Please verify your email with the OTP before continuing.");
            return;
        }

        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setSubmitting(true);

        try {
            await register({
                fullName: form.fullName,
                email: form.email,
                mobile: form.mobile || undefined,
                password: form.password,
            });

            navigate("/skill-assessment", { replace: true });
        } catch (err) {
            setError(
                err.response?.data?.message || "Unable to create your account. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section className="register">

            <div className="register-box">

                <h2>Create Your Account</h2>

                <p>
                    Join EntreSkill Hub and start your entrepreneurial journey.
                </p>

                {error && <p className="register-error">{error}</p>}

                <form onSubmit={handleSubmit}>

                    <label>Full Name</label>
                    <input
                        type="text"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={form.fullName}
                        onChange={handleChange}
                    />

                    <label>Email Address</label>
                    <div className="otp-row">
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            disabled={otpStage === "verified"}
                        />
                        {otpStage !== "verified" && (
                            <button
                                type="button"
                                className="otp-btn"
                                onClick={handleSendOtp}
                                disabled={otpSending}
                            >
                                {otpSending ? "Sending..." : otpStage === "sent" ? "Resend OTP" : "Send OTP"}
                            </button>
                        )}
                        {otpStage === "verified" && <span className="otp-verified-badge">✓ Verified</span>}
                    </div>

                    {otpStage === "sent" && (
                        <div className="otp-row">
                            <input
                                type="text"
                                placeholder="Enter 6-digit OTP"
                                value={otpValue}
                                onChange={(e) => setOtpValue(e.target.value)}
                                maxLength={6}
                            />
                            <button type="button" className="otp-btn" onClick={handleVerifyOtp}>
                                Verify
                            </button>
                        </div>
                    )}

                    {demoOtp && otpStage !== "verified" && (
                        <p className="otp-demo-note">
                            Demo mode (no email provider configured yet): your OTP is <strong>{demoOtp}</strong>
                        </p>
                    )}

                    {otpError && <p className="register-error">{otpError}</p>}

                    <label>Mobile Number (optional)</label>
                    <input
                        type="tel"
                        name="mobile"
                        placeholder="10-digit mobile number"
                        value={form.mobile}
                        onChange={handleChange}
                        maxLength={10}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="8+ chars, with a number & symbol"
                        value={form.password}
                        onChange={handleChange}
                    />

                    <label>Confirm Password</label>
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm your password"
                        value={form.confirmPassword}
                        onChange={handleChange}
                    />

                    <button type="submit" disabled={submitting}>
                        {submitting ? "Creating Account..." : "Create Account"}
                    </button>

                </form>

                <GoogleSignInButton />

            </div>

        </section>
    );
}

export default RegisterForm;
