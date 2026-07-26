import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import ChatWindow from "../components/Chat/ChatWindow";
import { fetchMentorById } from "../services/mentorService";
import { fetchMessagesWithMentor, sendMessageToMentor } from "../services/chatService";
import { API_ORIGIN } from "../services/api";

function MentorChat() {
    const { mentorId } = useParams();
    const navigate = useNavigate();
    const [mentor, setMentor] = useState(null);

    useEffect(() => {
        fetchMentorById(mentorId).then(setMentor).catch(() => navigate("/mentors"));
    }, [mentorId, navigate]);

    if (!mentor) {
        return (
            <MainLayout>
                <div style={{ textAlign: "center", padding: 60 }}>Loading...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <ChatWindow
                title={mentor.name}
                subtitle={mentor.specialization}
                photo={mentor.photo ? `${API_ORIGIN}${mentor.photo}` : null}
                myRole="USER"
                fetchMessages={() => fetchMessagesWithMentor(mentorId)}
                sendMessage={(text) => sendMessageToMentor(mentorId, text)}
            />
        </MainLayout>
    );
}

export default MentorChat;
