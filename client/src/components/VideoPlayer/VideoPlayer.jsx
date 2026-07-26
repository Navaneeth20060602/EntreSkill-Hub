import "./VideoPlayer.css";

function getYoutubeEmbedUrl(url) {
    const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
    return match ? `https://www.youtube-nocookie.com/embed/${match[1]}` : null;
}

// Renders a real, professional video player: a native HTML5 player (with
// play/pause/seek/speed/volume/fullscreen controls) for uploaded video
// files, or an embedded YouTube player for YouTube links.
function VideoPlayer({ url, title, onTimeUpdate }) {
    const youtubeEmbed = getYoutubeEmbedUrl(url);

    return (
        <div className="video-player-wrap">
            {youtubeEmbed ? (
                <iframe
                    src={youtubeEmbed}
                    title={title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                />
            ) : (
                <video controls preload="metadata" onTimeUpdate={onTimeUpdate}>
                    <source src={url} />
                    Your browser does not support the video tag.
                </video>
            )}
        </div>
    );
}

export default VideoPlayer;
