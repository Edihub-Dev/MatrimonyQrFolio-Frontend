import { useEffect, useState } from 'react';
import axios from 'axios';
import { QrCode } from 'lucide-react';

interface Profile {
  id: string;
  profileFor: string;
  gender: string;
  age: string;
  religion: string;
  motherTongue: string;
  city: string;
  email: string;
  phone?: string;
  plan?: string;
  createdAt: string;
}

export const ProfilesSection = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const response = await axios.get<{ profiles: Profile[] }>('/api/profiles');
        setProfiles(response.data.profiles ?? []);
      } catch (err) {
        setError('Unable to load profiles right now.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfiles();
  }, []);

  return (
    <section id="profiles" className="py-20 bg-gray-50 border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Live QR-backed profiles</h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Recent profiles created with QRfolio Matrimony. Each one is backed by a scannable QR for easy sharing.
          </p>
        </div>

        {isLoading && (
          <p className="text-center text-sm text-gray-500">Loading profiles…</p>
        )}

        {error && !isLoading && (
          <p className="text-center text-sm text-rose-600">{error}</p>
        )}

        {!isLoading && !error && profiles.length === 0 && (
          <p className="text-center text-sm text-gray-500">
            No profiles yet. Be the first to create a QR-backed matrimony profile from the hero form above.
          </p>
        )}

        {!isLoading && !error && profiles.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {profiles.map((profile) => (
              <article
                key={profile.id}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                    {profile.profileFor === 'Self' ? 'Profile' : profile.profileFor}{' '}
                    <span className="text-gray-500 font-normal">({profile.gender})</span>
                  </h3>
                  <p className="text-xs text-gray-500">
                    {profile.age ? `${profile.age} yrs • ` : ''}
                    {profile.religion || 'Religion not set'}
                    {profile.city ? ` • ${profile.city}` : ''}
                  </p>
                  <p className="text-[11px] text-gray-400">{profile.email}</p>
                  {profile.plan && (
                    <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-rose-50 text-[10px] font-medium text-rose-700 border border-rose-100">
                      {profile.plan === 'free' ? 'Free plan' : `${profile.plan} plan`}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-center gap-1">
                  <div className="bg-gray-900 p-2 rounded-lg shadow-md">
                    <QrCode size={24} className="text-white" />
                  </div>
                  <span className="text-[9px] text-gray-400 text-center leading-tight">
                    Example QR placeholder
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
