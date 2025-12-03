import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getPublicMatrimonyProfile } from '../lib/publicMatrimonyApi';

export const PublicMatrimonyProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        if (typeof window === 'undefined') return;
        const path = window.location.pathname || '';
        const segments = path.split('/').filter(Boolean);
        const id = segments[segments.length - 1];
        if (!id) {
          setError('Missing profile id in URL.');
          setIsLoading(false);
          return;
        }

        const result = await getPublicMatrimonyProfile(id);
        if (!isMounted) return;

        if (!result.ok) {
          if (result.notFound) {
            setError('Profile not found.');
          } else {
            setError(result.error || 'Failed to load profile.');
          }
          setIsLoading(false);
          return;
        }

        setProfile(result.profile || null);
        setIsLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load profile.');
        setIsLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading profile…</p>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-rose-600">{error || 'Profile not found.'}</p>
      </div>
    );
  }

  const full = profile.fullProfile || {};
  const basic = full.basicDetails || {};
  const about = full.about || {};
  const career = full.career || {};
  const kundli = full.kundli || {};
  const rawGallery = Array.isArray(full.gallery) ? full.gallery : [];
  const rawVideos = Array.isArray(full.galleryVideos)
    ? full.galleryVideos
    : Array.isArray(full.videos)
    ? full.videos
    : [];

  const photos = rawGallery
    .map((item: any) => {
      if (!item) return null;
      const url = item.url || item.src;
      if (!url) return null;
      return {
        id: item.id || item._id || url,
        url,
        caption: item.caption || item.title || '',
        isProfilePhoto: Boolean(item.isProfilePhoto),
      };
    })
    .filter(Boolean) as Array<{ id: string; url: string; caption?: string; isProfilePhoto?: boolean }>;

  const videos = rawVideos
    .map((item: any) => {
      if (!item) return null;
      const youtubeUrl = item.youtubeUrl || item.url;
      if (!youtubeUrl) return null;
      return {
        id: item.id || item._id || youtubeUrl,
        youtubeUrl,
        title: item.title || '',
      };
    })
    .filter(Boolean) as Array<{ id: string; youtubeUrl: string; title?: string }>;

  const primaryPhoto =
    photos.find((p) => p.isProfilePhoto) || (photos.length > 0 ? photos[0] : null);

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com')) {
        const v = u.searchParams.get('v');
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
      if (u.hostname === 'youtu.be') {
        const id = u.pathname.replace('/', '');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
    } catch {
      return null;
    }
    return null;
  };

  return (
    <motion.section
      className="max-w-4xl mx-auto bg-white rounded-3xl shadow-sm border border-amber-200 px-6 py-8 sm:px-8 sm:py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8 rounded-2xl border border-amber-100 bg-gradient-to-r from-rose-50 to-amber-50 px-4 py-4">
        <div className="flex items-center gap-4">
          {primaryPhoto && (
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
              <img
                src={primaryPhoto.url}
                alt={primaryPhoto.caption || 'Profile photo'}
                className="h-full w-full object-cover"
              />
            </div>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-rose-900">
              {about.profileManagedBy || 'Matrimony Profile'}
            </h1>
            {basic.location && (
              <p className="mt-1 text-sm text-rose-800/80">{basic.location}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Personal details</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {basic.religion && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Religion</dt>
                <dd className="font-medium">{basic.religion}</dd>
              </div>
            )}
            {basic.caste && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Caste / Subcaste</dt>
                <dd className="font-medium">{basic.caste}</dd>
              </div>
            )}
            {basic.motherTongue && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Mother tongue</dt>
                <dd className="font-medium">{basic.motherTongue}</dd>
              </div>
            )}
            {basic.height && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Height</dt>
                <dd className="font-medium">{basic.height}</dd>
              </div>
            )}
            {basic.maritalStatus && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Marital status</dt>
                <dd className="font-medium">{basic.maritalStatus}</dd>
              </div>
            )}
          </dl>
        </div>

        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-800">Professional details</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {career.role && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Occupation</dt>
                <dd className="font-medium">{career.role}</dd>
              </div>
            )}
            {career.location && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Work location</dt>
                <dd className="font-medium">{career.location}</dd>
              </div>
            )}
            {basic.annualIncome && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Annual income</dt>
                <dd className="font-medium">{basic.annualIncome}</dd>
              </div>
            )}
          </dl>
        </div>
      </div>

      {about.summary && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">About</h2>
          <p className="text-sm text-gray-700 whitespace-pre-line">{about.summary}</p>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Photos</h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Gallery photo'}
                  className="h-56 w-full object-cover sm:h-64"
                />
                {photo.caption && (
                  <p className="px-3 py-2 text-xs text-gray-700 border-t border-gray-100 bg-white">
                    {photo.caption}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {videos.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Videos</h2>
          <div className="mt-3 space-y-4">
            {videos.map((video) => {
              const embedUrl = getYouTubeEmbedUrl(video.youtubeUrl);
              return (
                <div key={video.id} className="space-y-1">
                  {video.title && (
                    <p className="text-xs font-medium text-gray-800">{video.title}</p>
                  )}
                  {embedUrl ? (
                    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-gray-100 bg-black">
                      <iframe
                        src={embedUrl}
                        title={video.title || 'YouTube video'}
                        className="h-full w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <a
                      href={video.youtubeUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-amber-700 hover:text-amber-800 break-all"
                    >
                      {video.youtubeUrl}
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(kundli.manglikStatus || kundli.birthCity || kundli.birthState) && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Religion details</h2>
          <dl className="space-y-1 text-sm text-gray-700">
            {kundli.manglikStatus && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Manglik</dt>
                <dd className="font-medium">{kundli.manglikStatus}</dd>
              </div>
            )}
            {kundli.birthState && kundli.birthCity && (
              <div className="flex justify-between gap-4">
                <dt className="text-gray-500">Place of birth</dt>
                <dd className="font-medium">
                  {kundli.birthCity}, {kundli.birthState}
                </dd>
              </div>
            )}
          </dl>
        </div>
      )}
    </motion.section>
  );
};
