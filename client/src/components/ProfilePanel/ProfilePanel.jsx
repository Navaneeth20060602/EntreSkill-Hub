import "./ProfilePanel.css";
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import { updateMyDetails } from "../../services/profileService";
import { API_ORIGIN } from "../../services/api";
import ChangePassword from "../ChangePassword/ChangePassword";
import { toast } from "../../context/ToastContext";

function ProfilePanel() {
    const { user, setUser } = useAuth();
    const { t } = useLanguage();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ fullName: user?.fullName || "", bio: user?.bio || "" });
    const [photoFile, setPhotoFile] = useState(null);
    const [saving, setSaving] = useState(false);

    async function handleSave(e) {
        e.preventDefault();
        setSaving(true);
        try {
            const fd = new FormData();
            Object.entries(form).forEach(([k, v]) => fd.append(k, v));
            if (photoFile) fd.append("photo", photoFile);
            const updated = await updateMyDetails(fd);
            if (setUser) setUser(updated);
            toast.success("Profile updated successfully.");
        } catch (err) {
            toast.error(err.response?.data?.message || "Could not update profile.");
        } finally {
            setSaving(false);
        }
    }

    return (
        <section className="profile-panel">
            <div className="profile-panel-card">
                <div className="profile-panel-header" onClick={() => setOpen((o) => !o)}>
                    <h3>{t("myProfile")}</h3>
                    <span>{open ? "▲" : "▼"}</span>
                </div>

                {open && (
                    <>
                        {user?.photo && (
                            <img className="profile-photo-preview" src={`${API_ORIGIN}${user.photo}`} alt={user.fullName} />
                        )}
                        <form className="profile-edit-form" onSubmit={handleSave}>
                            <input placeholder="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
                            <textarea placeholder="A short bio (optional)" rows="3" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                            <input type="file" accept="image/*" aria-label="Upload profile photo" onChange={(e) => setPhotoFile(e.target.files[0])} />
                            <button type="submit" disabled={saving}>
                                {saving ? "Saving..." : t("saveProfile")}
                            </button>
                        </form>

                        <div className="profile-panel-divider" />
                        <ChangePassword />
                    </>
                )}
            </div>
        </section>
    );
}

export default ProfilePanel;
