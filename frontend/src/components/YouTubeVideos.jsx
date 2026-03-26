import { useState, useEffect } from 'react';
import { SITE } from '../data/site';

const RSS_API = 'https://api.rss2json.com/v1/api.json';
const VIDEO_COUNT = 4;

function extractVideoId(link) {
  const match = link?.match(/[?&]v=([^&]+)/);
  return match ? match[1] : null;
}

export default function YouTubeVideos({ count = VIDEO_COUNT, className = '', showChannelLink = true }) {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const rssUrl = `https://www.youtube.com/feeds/videos.xml?channel_id=${SITE.youtube.channelId}`;
    const apiUrl = `${RSS_API}?rss_url=${encodeURIComponent(rssUrl)}&count=${count}`;

    fetch(apiUrl)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === 'ok' && data.items?.length) {
          setVideos(
            data.items.map((item) => ({
              title: item.title,
              link: item.link,
              videoId: extractVideoId(item.link),
              thumbnail: item.thumbnail || `https://img.youtube.com/vi/${extractVideoId(item.link)}/mqdefault.jpg`,
              published: item.pubDate,
            }))
          );
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [count]);

  if (loading) {
    return (
      <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
        {[...Array(count)].map((_, i) => (
          <div key={i} className="aspect-video bg-dark-lighter rounded-lg border border-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !videos.length) {
    return (
      <div className={`${className}`}>
        {showChannelLink ? (
          <a
            href={SITE.youtube.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-3 bg-red-600/20 border border-red-600/50 text-red-400 rounded-lg hover:bg-red-600/30 transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
            </svg>
            Voir la chaîne YouTube
          </a>
        ) : (
          <div className="rounded-lg border border-gray-800 bg-dark-lighter p-6 text-center">
            <p className="text-gray-400 text-sm">Vidéos bientôt disponibles.</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg text-white">Dernières vidéos</h3>
        {showChannelLink ? (
          <a
            href={SITE.youtube.channelUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline"
          >
            Voir la chaîne →
          </a>
        ) : null}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {videos.map((video) => (
          <a
            key={video.videoId}
            href={video.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-lg border border-gray-800 overflow-hidden hover:border-primary transition-colors bg-dark-lighter"
          >
            <div className="relative aspect-video">
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
                <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="p-2 text-xs text-gray-400 line-clamp-2 group-hover:text-gray-300" title={video.title}>
              {video.title}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}
