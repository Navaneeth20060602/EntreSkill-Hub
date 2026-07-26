import "./ChangePassword.css";
import { useState } from "react";
import { Link } from "react-router-dom";
import { changePasswordRequest } from "../../services/authService";

function ChangePassword() {
    const [open, setOpen] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

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
            await changePasswordRequest({ currentPassword, newPassword });
            setSuccess("Password changed successfully.");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err) {
            setError(err.response?.data?.message || "Could not change password.");
        } finally {
            setSubmitting(false);
        }
    }

    if (!open) {
        return (
            <div className="change-password-collapsed">
                <button className="change-password-toggle" onClick={() => setOpen(true)}>
                    Change Password
                </button>
                <Link className="forgot-password-link" to="/forgot-password">
                    Forgot your password?
                </Link>
            </div>
        );
    }

    return (
        <form className="change-password-form" onSubmit={handleSubmit}>
            {error && <p className="cp-error">{error}</p>}
            {success && <p className="cp-success">{success}</p>}

            <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="8+ chars, with a number & symbol"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
            />
            <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <div className="cp-actions">
                <button type="submit" disabled={submitting}>
                    {submitting ? "Saving..." : "Save New Password"}
                </button>
                <button type="button" className="cp-cancel" onClick={() => setOpen(false)}>
                    Cancel
                </button>
            </div>

            <Link className="forgot-password-link" to="/forgot-password">
                Don't remember your current password? Reset it instead
            </Link>
        </form>
    );
}

export default ChangePassword;
