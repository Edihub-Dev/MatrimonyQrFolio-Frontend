import React, { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '../context/AuthContext';
import { getMyMatrimonyProfile, saveMatrimonyProfileOnServer } from '../lib/matrimonyApi';

const MAX_GALLERY_ITEMS = 5;

export type MatrimonyGalleryPhoto = {
  id: string;
  url: string;
  caption?: string;
  isProfilePhoto?: boolean;
  storageKey?: string;
  uploadedAt?: string;
};

export type MatrimonyGalleryVideo = {
  id: string;
  youtubeUrl: string;
  title?: string;
  createdAt?: string;
};

const normalizePhoto = (raw: any): MatrimonyGalleryPhoto | null => {
  if (!raw) return null;
  const url = raw.url || raw.src;
  if (!url) return null;
  return {
    id: raw.id || raw._id || uuidv4(),
    url,
    caption: raw.caption || raw.title || '',
    isProfilePhoto: Boolean(raw.isProfilePhoto),
    storageKey: raw.storageKey,
    uploadedAt: raw.uploadedAt || raw.createdAt,
  };
};

const normalizeVideo = (raw: any): MatrimonyGalleryVideo | null => {
  if (!raw) return null;
  const youtubeUrl = raw.youtubeUrl || raw.url;
  if (!youtubeUrl) return null;
  return {
    id: raw.id || raw._id || uuidv4(),
    youtubeUrl,
    title: raw.title || '',
    createdAt: raw.createdAt,
  };
};

export const MatrimonyGallerySection: React.FC = () => {
  const { uploadMatrimonialImage, deleteMatrimonialImage } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fullProfileBase, setFullProfileBase] = useState<any | null>(null);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  const [photos, setPhotos] = useState<MatrimonyGalleryPhoto[]>([]);
  const [videos, setVideos] = useState<MatrimonyGalleryVideo[]>([]);

  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoTitle, setNewVideoTitle] = useState('');

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await getMyMatrimonyProfile();

        if (!isMounted) return;

        if (!result.ok) {
          if (result.notFound) {
            setError('Please complete your matrimony onboarding before adding photos or videos.');
          } else if (result.authError) {
            setError(result.message || 'Please login again to manage your gallery.');
          } else {
            setError(result.error || 'Failed to load gallery data.');
          }
          setLoading(false);
          return;
        }

        const full = (result.profile as any).fullProfile || {};

        const rawGallery = Array.isArray((full as any).gallery)
          ? (full as any).gallery
          : [];
        const rawVideos = Array.isArray((full as any).galleryVideos)
          ? (full as any).galleryVideos
          : Array.isArray((full as any).videos)
          ? (full as any).videos
          : [];

        const normalizedPhotos = rawGallery
          .map((item: any) => normalizePhoto(item))
          .filter(Boolean) as MatrimonyGalleryPhoto[];
        const normalizedVideos = rawVideos
          .map((item: any) => normalizeVideo(item))
          .filter(Boolean) as MatrimonyGalleryVideo[];

        setFullProfileBase(full);
        setHasExistingProfile(true);
        setPhotos(normalizedPhotos);
        setVideos(normalizedVideos);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Failed to load matrimony gallery', err);
        setError(err?.message || 'Failed to load gallery data.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const syncToServer = async (
    nextPhotos: MatrimonyGalleryPhoto[],
    nextVideos: MatrimonyGalleryVideo[],
  ) => {
    if (!fullProfileBase || !hasExistingProfile) {
      toast.error('Please complete your matrimony onboarding first.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const primaryPhoto =
        nextPhotos.find((p) => p.isProfilePhoto) || nextPhotos[0] || null;

      const fullProfile = {
        ...fullProfileBase,
        gallery: nextPhotos,
        galleryVideos: nextVideos,
        ...(primaryPhoto
          ? {
              profilePhoto: primaryPhoto.url,
              profilePhotoStorageKey: primaryPhoto.storageKey || '',
            }
          : {}),
      };

      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: true,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Failed to save gallery.');
      }

      setFullProfileBase(fullProfile);
      setPhotos(nextPhotos);
      setVideos(nextVideos);
      toast.success('Gallery updated successfully');
    } catch (err: any) {
      console.error('Failed to save matrimony gallery', err);
      setError(err?.message || 'Failed to save gallery.');
      toast.error(err?.message || 'Failed to save gallery.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddPhotoClick = () => {
    if (photos.length >= MAX_GALLERY_ITEMS) {
      toast.error(`You can upload up to ${MAX_GALLERY_ITEMS} photos.`);
      return;
    }
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = async (
    event,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file.');
      event.target.value = '';
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be less than 2 MB.');
      event.target.value = '';
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await uploadMatrimonialImage(formData);

      if (!result.success || !result.item) {
        throw new Error(result.error || 'Failed to upload image.');
      }

      const item = result.item;

      const newPhoto: MatrimonyGalleryPhoto = {
        id: item._id || item.id || uuidv4(),
        url: item.url,
        caption: item.title || '',
        isProfilePhoto:
          photos.length === 0 || !photos.some((p) => p.isProfilePhoto),
        storageKey: item.storageKey,
        uploadedAt: item.createdAt || new Date().toISOString(),
      };

      const nextPhotos = [...photos, newPhoto];
      await syncToServer(nextPhotos, videos);
    } catch (err: any) {
      console.error('Upload failed', err);
      toast.error(err?.message || 'Failed to upload image.');
    } finally {
      event.target.value = '';
    }
  };

  const handleDeletePhoto = async (photo: MatrimonyGalleryPhoto) => {
    const prevPhotos = photos;
    const nextPhotos = photos.filter((p) => p.id !== photo.id);

    try {
      if (photo.storageKey) {
        const result = await deleteMatrimonialImage({
          storageKey: photo.storageKey,
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to delete image from storage.');
        }
      }

      await syncToServer(nextPhotos, videos);
    } catch (err: any) {
      console.error('Delete photo failed', err);
      toast.error(err?.message || 'Failed to delete image.');
      setPhotos(prevPhotos);
    }
  };

  const handleCaptionChange = (id: string, caption: string) => {
    const nextPhotos = photos.map((p) =>
      p.id === id
        ? {
            ...p,
            caption,
          }
        : p,
    );
    void syncToServer(nextPhotos, videos);
  };

  const handleSetProfilePhoto = (id: string) => {
    const nextPhotos = photos.map((p) => ({
      ...p,
      isProfilePhoto: p.id === id,
    }));
    void syncToServer(nextPhotos, videos);
  };

  const handleAddVideo = () => {
    const trimmedUrl = newVideoUrl.trim();
    if (!trimmedUrl) {
      toast.error('Please paste a YouTube video URL.');
      return;
    }

    const nextVideos: MatrimonyGalleryVideo[] = [
      ...videos,
      {
        id: uuidv4(),
        youtubeUrl: trimmedUrl,
        title: newVideoTitle.trim(),
        createdAt: new Date().toISOString(),
      },
    ];

    setNewVideoUrl('');
    setNewVideoTitle('');
    void syncToServer(photos, nextVideos);
  };

  const handleRemoveVideo = (id: string) => {
    const nextVideos = videos.filter((v) => v.id !== id);
    void syncToServer(photos, nextVideos);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-slate-300">Loading your gallery…</p>
      </div>
    );
  }

  if (error && !hasExistingProfile) {
    return (
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-50">Gallery</h2>
        <p className="text-sm text-rose-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-50">Gallery</h2>
          <p className="mt-1 text-sm text-slate-300">
            Upload your best photos and add YouTube video links. These will appear on your public
            matrimony page.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            onClick={handleAddPhotoClick}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-800 to-amber-500 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:from-rose-700 hover:to-amber-400 disabled:opacity-60 transition-colors"
            disabled={saving}
          >
            Add photo
          </button>
          <p className="text-[11px] text-slate-400">
            Up to {MAX_GALLERY_ITEMS} photos • Max 2 MB each
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      {error && hasExistingProfile && (
        <p className="text-xs text-rose-300">{error}</p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {photos.map((photo) => (
          <div
            key={photo.id}
            className="group rounded-2xl border border-white/10 bg-slate-900/60 p-3 flex flex-col gap-2 transition-transform transition-shadow duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-500/15"
          >
            <div className="aspect-[3/4] overflow-hidden rounded-xl bg-slate-800">
              <img
                src={photo.url}
                alt={photo.caption || 'Matrimony gallery'}
                className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
              />
            </div>
            <input
              type="text"
              value={photo.caption || ''}
              onChange={(e) => handleCaptionChange(photo.id, e.target.value)}
              placeholder="Add a short caption (optional)"
              className="w-full rounded-full border border-white/15 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <div className="flex items-center justify-between gap-2 text-[11px] text-slate-300">
              <button
                type="button"
                onClick={() => handleSetProfilePhoto(photo.id)}
                className={`rounded-full px-2.5 py-1 border text-[11px] font-medium transition-colors ${
                  photo.isProfilePhoto
                    ? 'border-amber-400 bg-amber-500/15 text-amber-100'
                    : 'border-white/15 bg-slate-900/80 text-slate-200 hover:border-amber-400/70'
                }`}
              >
                {photo.isProfilePhoto ? 'Profile photo' : 'Set as profile photo'}
              </button>
              <button
                type="button"
                onClick={() => handleDeletePhoto(photo)}
                className="text-rose-300 hover:text-rose-200"
              >
                Remove
              </button>
            </div>
          </div>
        ))}

        {photos.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/15 bg-slate-900/50 p-6 text-sm text-slate-300 flex items-center justify-center">
            No photos yet. Click "Add photo" to upload your first picture.
          </div>
        )}
      </div>

      <div className="mt-4 space-y-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
        <p className="text-sm font-medium text-slate-100">YouTube videos</p>
        <p className="text-xs text-slate-400">
          Paste YouTube video links that you want to highlight on your public matrimony page.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            type="url"
            value={newVideoUrl}
            onChange={(e) => setNewVideoUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className="flex-1 rounded-full border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <input
            type="text"
            value={newVideoTitle}
            onChange={(e) => setNewVideoTitle(e.target.value)}
            placeholder="Title (optional)"
            className="flex-1 rounded-full border border-white/15 bg-slate-950/80 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
          />
          <button
            type="button"
            onClick={handleAddVideo}
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-800 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-rose-700 hover:to-amber-400 disabled:opacity-60 transition-colors"
            disabled={saving}
          >
            Add video
          </button>
        </div>

        {videos.length > 0 && (
          <ul className="mt-3 space-y-2 text-xs text-slate-200">
            {videos.map((video) => (
              <li
                key={video.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-slate-950/60 px-3 py-2"
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate font-medium text-slate-50">
                    {video.title || 'YouTube video'}
                  </p>
                  <p className="truncate text-[11px] text-slate-400">{video.youtubeUrl}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveVideo(video.id)}
                  className="text-rose-300 hover:text-rose-200 text-[11px]"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        {videos.length === 0 && (
          <p className="mt-1 text-[11px] text-slate-400">
            No videos added yet.
          </p>
        )}
      </div>

      {saving && (
        <p className="text-[11px] text-slate-400">Saving changes…</p>
      )}
    </div>
  );
};
