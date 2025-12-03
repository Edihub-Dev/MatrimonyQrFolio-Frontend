import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  getMyMatrimonyProfile,
  saveMatrimonyProfileOnServer,
} from '../lib/matrimonyApi';

const STEPS = ['Basic details', 'Religion details', 'Personal details', 'Professional details', 'About you'];

type WizardFormState = {
  fullName: string;
  dateOfBirth: string;
  religion: string;
  subcaste: string;
  motherTongue: string;
  star: string;
  raashi: string;
  gotra: string;
  manglik: 'yes' | 'no' | "dont_know" | '';
  birthTime: string;
  birthAmPm: 'AM' | 'PM';
  birthCountry: string;
  birthState: string;
  birthCity: string;
  maritalStatus: string;
  height: string;
  familyStatus: string;
  familyType: string;
  physicalStatus: string;
  highestEducation: string;
  employedIn: string;
  occupation: string;
  workLocation: string;
  annualIncome: string;
  residingState: string;
  residingCity: string;
  citizenship: string;
  aboutYou: string;
};

const createEmptyFormState = (): WizardFormState => ({
  fullName: '',
  dateOfBirth: '',
  religion: '',
  subcaste: '',
  motherTongue: '',
  star: '',
  raashi: '',
  gotra: '',
  manglik: '',
  birthTime: '',
  birthAmPm: 'AM',
  birthCountry: '',
  birthState: '',
  birthCity: '',
  maritalStatus: '',
  height: '',
  familyStatus: '',
  familyType: '',
  physicalStatus: '',
  highestEducation: '',
  employedIn: '',
  occupation: '',
  workLocation: '',
  annualIncome: '',
  residingState: '',
  residingCity: '',
  citizenship: 'Indian',
  aboutYou: '',
});

export const MatrimonyOnboardingWizard: React.FC = () => {
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<WizardFormState>(() => createEmptyFormState());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasExistingProfile, setHasExistingProfile] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadExisting = async () => {
      try {
        const result = await getMyMatrimonyProfile();
        if (!isMounted) return;

        if (result.ok && result.profile?.fullProfile) {
          const full = result.profile.fullProfile as any;
          const basic = full.basicDetails || {};
          const about = full.about || {};
          const kundli = full.kundli || {};
          const education = full.education || {};
          const career = full.career || {};

          setForm((prev) => ({
            ...prev,
            fullName: about.profileManagedBy || prev.fullName,
            dateOfBirth:
              basic.birthDate || kundli.birthDate
                ? new Date(basic.birthDate || kundli.birthDate).toISOString().slice(0, 10)
                : prev.dateOfBirth,
            religion: basic.religion || prev.religion,
            subcaste: basic.caste || prev.subcaste,
            motherTongue: basic.motherTongue || prev.motherTongue,
            star: kundli.nakshatra || prev.star,
            raashi: kundli.raashi || prev.raashi,
            gotra: basic.gothra || kundli.gotra || prev.gotra,
            manglik: (kundli.manglikStatus as WizardFormState['manglik']) || prev.manglik,
            birthTime: kundli.birthTime || prev.birthTime,
            birthCountry: kundli.birthCountry || prev.birthCountry,
            birthState: kundli.birthState || prev.birthState,
            birthCity: kundli.birthCity || prev.birthCity,
            maritalStatus: basic.maritalStatus || prev.maritalStatus,
            height: basic.height || prev.height,
            familyStatus: basic.familyStatus || prev.familyStatus,
            familyType: basic.familyType || prev.familyType,
            physicalStatus: basic.physicalStatus || prev.physicalStatus,
            highestEducation: education.description || prev.highestEducation,
            employedIn: career.employedIn || prev.employedIn,
            occupation: career.role || prev.occupation,
            workLocation: career.location || prev.workLocation,
            annualIncome: basic.annualIncome || prev.annualIncome,
            residingState: basic.residingState || prev.residingState,
            residingCity: basic.residingCity || prev.residingCity,
            citizenship: basic.citizenship || prev.citizenship,
            aboutYou: about.summary || prev.aboutYou,
          }));

          setHasExistingProfile(true);
        }
      } catch (error: any) {
        console.error('Failed to prefill onboarding wizard', error);
      }
    };

    void loadExisting();

    return () => {
      isMounted = false;
    };
  }, []);

  const updateField = (field: keyof WizardFormState, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const goNext = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex((idx) => idx + 1);
    }
  };

  const goPrev = () => {
    if (stepIndex > 0) {
      setStepIndex((idx) => idx - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const fullProfile: any = {
        basicDetails: {
          height: form.height,
          religion: form.religion,
          caste: form.subcaste,
          motherTongue: form.motherTongue,
          location: [form.residingCity, form.residingState].filter(Boolean).join(', '),
          annualIncome: form.annualIncome,
          birthDate: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
          maritalStatus: form.maritalStatus,
          gothra: form.gotra,
          familyStatus: form.familyStatus,
          familyType: form.familyType,
          physicalStatus: form.physicalStatus,
          residingState: form.residingState,
          residingCity: form.residingCity,
          citizenship: form.citizenship,
        },
        about: {
          summary: form.aboutYou,
          profileManagedBy: form.fullName,
        },
        education: {
          description: form.highestEducation,
        },
        career: {
          role: form.occupation,
          industry: form.employedIn,
          location: form.workLocation,
        },
        kundli: {
          manglikStatus: form.manglik,
          nakshatra: form.star,
          raashi: form.raashi,
          birthTime: form.birthTime,
          birthDate: form.dateOfBirth ? new Date(form.dateOfBirth).toISOString() : undefined,
          birthCountry: form.birthCountry,
          birthState: form.birthState,
          birthCity: form.birthCity,
        },
      };

      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: hasExistingProfile,
      });

      if (!result.ok) {
        throw new Error(result.error || 'Failed to save matrimony profile');
      }

      toast.success('Matrimony details saved successfully');

      if (typeof window !== 'undefined') {
        window.location.href = '/matrimonial-profile';
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || 'Failed to save details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentStep = stepIndex + 1;

  return (
    <motion.section
      className="max-w-3xl mx-auto bg-white rounded-3xl shadow-sm border border-amber-200/80 px-6 py-8 sm:px-8 sm:py-10 backdrop-blur-sm"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Complete your profile</h1>
        <p className="text-xs text-gray-500">
          Step {currentStep} of {STEPS.length}: {STEPS[stepIndex]}
        </p>
      </div>

      {stepIndex === 0 && (
        <div className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Full name</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Date of birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => updateField('dateOfBirth', e.target.value)}
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Religion</label>
              <input
                type="text"
                value={form.religion}
                onChange={(e) => updateField('religion', e.target.value)}
                placeholder="Select religion"
                className="w-full border border-amber-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Subcaste</label>
              <input
                type="text"
                value={form.subcaste}
                onChange={(e) => updateField('subcaste', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Mother tongue</label>
              <input
                type="text"
                value={form.motherTongue}
                onChange={(e) => updateField('motherTongue', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {stepIndex === 1 && (
        <div className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Star</label>
              <input
                type="text"
                value={form.star}
                onChange={(e) => updateField('star', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Raashi</label>
              <input
                type="text"
                value={form.raashi}
                onChange={(e) => updateField('raashi', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Gotra</label>
              <input
                type="text"
                value={form.gotra}
                onChange={(e) => updateField('gotra', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <span className="block text-xs font-semibold text-gray-600 mb-1">Manglik</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                  { value: 'dont_know', label: "Don't know" },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => updateField('manglik', opt.value as WizardFormState['manglik'])}
                    className={`px-3 py-2 text-xs rounded-full border transition ${
                      form.manglik === opt.value
                        ? 'border-rose-500 bg-rose-50 text-rose-700'
                        : 'border-rose-100 bg-white text-gray-700'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)] gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Time of birth</label>
              <div className="flex gap-2">
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => updateField('birthTime', e.target.value)}
                  className="flex-1 border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Country of birth</label>
              <input
                type="text"
                value={form.birthCountry}
                onChange={(e) => updateField('birthCountry', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">State of birth</label>
              <input
                type="text"
                value={form.birthState}
                onChange={(e) => updateField('birthState', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">City of birth</label>
              <input
                type="text"
                value={form.birthCity}
                onChange={(e) => updateField('birthCity', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {stepIndex === 2 && (
        <div className="space-y-4">
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Marital status</span>
            <div className="flex flex-wrap gap-2">
              {['Unmarried', 'Widower', 'Divorced', 'Separated'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('maritalStatus', value)}
                  className={`px-3 py-2 text-xs rounded-full border transition ${
                    form.maritalStatus === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-rose-100 bg-white text-gray-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Height (in feet/inches)</label>
            <input
              type="text"
              value={form.height}
              onChange={(e) => updateField('height', e.target.value)}
              className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Family status</span>
            <div className="flex flex-wrap gap-2">
              {['Middle class', 'Upper middle class', 'Rich/Affluent'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('familyStatus', value)}
                  className={`px-3 py-2 text-xs rounded-full border transition ${
                    form.familyStatus === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-rose-100 bg-white text-gray-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Family type</span>
            <div className="flex flex-wrap gap-2">
              {['Joint Family', 'Nuclear Family'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('familyType', value)}
                  className={`px-3 py-2 text-xs rounded-full border transition ${
                    form.familyType === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-rose-100 bg-white text-gray-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Physical status</span>
            <div className="flex flex-wrap gap-2">
              {['Normal', 'Physically challenged'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('physicalStatus', value)}
                  className={`px-3 py-2 text-xs rounded-full border transition ${
                    form.physicalStatus === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-rose-100 bg-white text-gray-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {stepIndex === 3 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Highest education</label>
            <input
              type="text"
              value={form.highestEducation}
              onChange={(e) => updateField('highestEducation', e.target.value)}
              className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
            />
          </div>
          <div>
            <span className="block text-xs font-semibold text-gray-600 mb-1">Employed in</span>
            <div className="flex flex-wrap gap-2">
              {['Government', 'Defence', 'Private', 'Business', 'Self-Employed', 'Not working'].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => updateField('employedIn', value)}
                  className={`px-3 py-2 text-xs rounded-full border transition ${
                    form.employedIn === value
                      ? 'border-rose-500 bg-rose-50 text-rose-700'
                      : 'border-rose-100 bg-white text-gray-700'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Occupation</label>
              <input
                type="text"
                value={form.occupation}
                onChange={(e) => updateField('occupation', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Work location</label>
              <input
                type="text"
                value={form.workLocation}
                onChange={(e) => updateField('workLocation', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Annual income (in Rs.)</label>
              <input
                type="text"
                value={form.annualIncome}
                onChange={(e) => updateField('annualIncome', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Citizenship</label>
              <input
                type="text"
                value={form.citizenship}
                onChange={(e) => updateField('citizenship', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Residing state</label>
              <input
                type="text"
                value={form.residingState}
                onChange={(e) => updateField('residingState', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Residing city</label>
              <input
                type="text"
                value={form.residingCity}
                onChange={(e) => updateField('residingCity', e.target.value)}
                className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500"
              />
            </div>
          </div>
        </div>
      )}

      {stepIndex === 4 && (
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">About you</label>
            <textarea
              value={form.aboutYou}
              onChange={(e) => updateField('aboutYou', e.target.value)}
              rows={6}
              className="w-full border border-rose-100 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-rose-500 resize-none"
              placeholder="Write a brief description about yourself (min. 50 characters)"
            />
            <p className="mt-1 text-[11px] text-gray-500">Minimum 50 characters recommended</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <button
          type="button"
          onClick={goPrev}
          disabled={stepIndex === 0 || isSubmitting}
          className="px-4 py-2.5 rounded-full text-xs font-semibold border border-gray-200 text-gray-700 disabled:opacity-60 bg-gray-50"
        >
          Previous
        </button>
        {stepIndex < STEPS.length - 1 ? (
          <button
            type="button"
            onClick={goNext}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm disabled:opacity-60"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-rose-600 text-white shadow-sm disabled:opacity-60"
          >
            {isSubmitting ? 'Saving…' : 'Complete registration'}
          </button>
        )}
      </div>
    </motion.section>
  );
};
