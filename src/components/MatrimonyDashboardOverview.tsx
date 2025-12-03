import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getMyMatrimonyProfile } from '../lib/matrimonyApi';

type Props = {
  onEditProfile?: () => void;
};

export const MatrimonyDashboardOverview: React.FC<Props> = ({ onEditProfile }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        if (!result.ok) {
          if (result.notFound) {
            setError('Please complete your matrimony onboarding first.');
          } else if (result.authError) {
            setError(result.message || 'Please login again to view your profile.');
          } else {
            setError(result.error || 'Failed to load your matrimony profile.');
          }
          setLoading(false);
          return;
        }

        setProfile(result.profile);
        setLoading(false);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load your matrimony profile.');
        setLoading(false);
      }
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, []);

  const { full, basic, about, career } = useMemo(() => {
    const fullProfile = profile?.fullProfile || {};
    return {
      full: fullProfile,
      basic: fullProfile.basicDetails || {},
      about: fullProfile.about || {},
      career: fullProfile.career || {},
    };
  }, [profile]);

  const completion = useMemo(() => {
    const sections: Array<boolean> = [
      !!basic.height,
      !!basic.religion,
      !!basic.maritalStatus,
      !!basic.location,
      !!about.summary,
      !!career.role,
      !!career.location,
      Array.isArray(full.gallery) && full.gallery.length > 0,
    ];
    const filled = sections.filter(Boolean).length;
    if (!sections.length) return 0;
    return Math.min(100, Math.round((filled / sections.length) * 100));
  }, [basic.height, basic.religion, basic.maritalStatus, basic.location, about.summary, career.role, career.location, full.gallery]);

  const publicProfileUrl = useMemo(() => {
    if (typeof window === 'undefined' || !profile?.id) return '';
    return `${window.location.origin}/public-matrimony/${profile.id}`;
  }, [profile?.id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-sm text-gray-500">Loading your dashboard6hellip;</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-100 bg-rose-50/60 px-4 py-6 text-sm text-rose-700">
        {error}
      </div>
    );
  }

  const displayName = about.profileManagedBy || basic.fullName || 'Matrimony profile';

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
    >
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-rose-950/90 via-rose-900/85 to-amber-100/80 px-5 py-5 sm:px-6 sm:py-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-amber-50">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">
            Matrimony dashboard
          </p>
          <h1 className="mt-1 text-xl sm:text-2xl font-semibold text-amber-50">
            Welcome, {displayName}
          </h1>
          {basic.location && (
            <p className="mt-1 text-xs text-amber-100/80">Based in {basic.location}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.18em] text-amber-200/80">
              Profile completeness
            </p>
            <p className="mt-1 text-2xl font-bold text-amber-300">
              {completion}%
            </p>
          </div>
          <div className="w-24 h-2 rounded-full bg-rose-950/40 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
              style={{ width: `${completion}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2">Basic details</p>
          <ul className="space-y-1.5 text-xs text-gray-700">
            {basic.religion && (
              <li>
                <span className="text-gray-500">Religion: </span>
                <span className="font-medium">{basic.religion}</span>
              </li>
            )}
            {basic.maritalStatus && (
              <li>
                <span className="text-gray-500">Marital status: </span>
                <span className="font-medium">{basic.maritalStatus}</span>
              </li>
            )}
            {basic.height && (
              <li>
                <span className="text-gray-500">Height: </span>
                <span className="font-medium">{basic.height}</span>
              </li>
            )}
            {basic.annualIncome && (
              <li>
                <span className="text-gray-500">Income: </span>
                <span className="font-medium">{basic.annualIncome}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 mb-2">Professional</p>
          <ul className="space-y-1.5 text-xs text-gray-700">
            {career.role && (
              <li>
                <span className="text-gray-500">Occupation: </span>
                <span className="font-medium">{career.role}</span>
              </li>
            )}
            {career.company && (
              <li>
                <span className="text-gray-500">Company: </span>
                <span className="font-medium">{career.company}</span>
              </li>
            )}
            {career.location && (
              <li>
                <span className="text-gray-500">Work location: </span>
                <span className="font-medium">{career.location}</span>
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-800 mb-2">Next actions</p>
            <p className="text-xs text-gray-600 mb-3">
              Keep your profile fresh and complete so families and matchmakers can understand you better.
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => {
                if (onEditProfile) {
                  onEditProfile();
                } else if (typeof window !== 'undefined') {
                  window.location.href = '/matrimony-onboarding';
                }
              }}
              className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-rose-800 to-amber-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:from-rose-700 hover:to-amber-400 transition-colors"
            >
              Edit full details
            </button>
            {publicProfileUrl && (
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.open(publicProfileUrl, '_blank', 'noopener,noreferrer');
                  }
                }}
                className="inline-flex items-center justify-center rounded-full border border-amber-200 bg-white px-4 py-2 text-xs font-semibold text-rose-900 hover:bg-amber-50/70 transition-colors"
              >
                View public profile
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
