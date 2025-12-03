import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef,
} from "react";
import { Save, Camera, Edit3, Plus, Trash2, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";

import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { v4 as uuidv4 } from "uuid";
import {
  getMyMatrimonyProfile,
  saveMatrimonyProfileOnServer,
} from "../lib/matrimonyApi";

const HABIT_OPTIONS = [
  { value: "I don't Drink", label: "I don't drink" },
  { value: "I am a Vegetarian", label: "I am a Vegetarian" },
  { value: "I don't Smoke", label: "I don't smoke" },
];

const ASSET_OPTIONS = [
  { value: "Own a House", label: "Own a House" },
  { value: "Own a Car", label: "Own a Car" },
];

const createDefaultProfile = () => ({
  headline: "",
  completion: 0,
  basicDetails: {
    height: "",
    religion: "",
    caste: "",
    motherTongue: "",
    location: "",
    annualIncome: "",
    birthDate: "",
    maritalStatus: "",
    gothra: "",
  },
  about: {
    summary: "",
    profileManagedBy: "",
    disability: "",
  },
  education: {
    degrees: [] as Array<{
      level: string;
      degree: string;
      institution: string;
    }>,
    description: "",
  },
  career: {
    role: "",
    company: "",
    industry: "",
    description: "",
    notSettlingAbroad: false,
  },
  family: {
    familyBackground: "",
    parents: "",
    siblings: "",
    description: "",
    livingWithParents: false,
  },
  contact: {
    email: "",
    phone: "",
    alternateEmail: "",
    alternatePhone: "",
  },
  kundli: {
    manglikStatus: "",
    nakshatra: "",
    birthDate: "",
    birthTime: "",
    birthPlace: "",
    horoscopePreference: "",
  },
  lifestyle: {
    habits: [] as string[],
    assets: [] as string[],
    favourites: {
      hobbies: "",
      interests: "",
      cuisine: "",
      music: "",
      clothingStyle: "",
      sports: "",
      canCook: "",
      travel: "",
      shows: "",
      books: "",
      movies: "",
      outdoor: "",
      indoor: "",
      bucketList: "",
      values: "",
      quirks: "",
      weekend: "",
    },
  },
  interests: [] as Array<{ label: string; value: string }>,
  gallery: [] as Array<{
    id: string;
    url: string;
    caption: string;
    isProfilePhoto: boolean;
    storageKey: string;
    uploadedAt: string;
  }>,
  additionalNotes: "",
  partnerPreferences: {
    summary: "",
    description: "",
    basicDetails: {
      heightRange: "",
      ageRange: "",
      maritalStatus: "",
      kundliAstro: "",
      caste: "",
      disability: "",
      religion: "",
      motherTongue: "",
      city: "",
      country: "",
    },
    education: {
      level: "",
      profession: "",
      earning: "",
    },
    lifestyle: {
      diet: "",
      smoke: "",
      drink: "",
    },
  },
});

type MatrimonialProfileData = ReturnType<typeof createDefaultProfile>;

const deepMerge = (target: any, source: any): any => {
  if (!source) return target;
  const output = Array.isArray(target) ? [...target] : { ...target };
  Object.keys(source).forEach((key) => {
    const value = source[key];
    if (value === undefined) {
      return;
    }
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      !(value instanceof Date)
    ) {
      output[key] = deepMerge(target[key] || {}, value);
    } else if (Array.isArray(value)) {
      output[key] = [...value];
    } else {
      output[key] = value;
    }
  });
  return output;
};

type SectionCardProps = {
  title: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
};

const SectionCard = React.forwardRef<HTMLDivElement, SectionCardProps>(
  ({ title, description, children, action }, ref) => (
    <div
      ref={ref}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          {description && (
            <p className="text-gray-600 mt-1 text-sm">{description}</p>
          )}
        </div>
        {action}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  ),
);
SectionCard.displayName = "SectionCard";

const MAX_GALLERY_ITEMS = 5;

const MatrimonialProfile: React.FC = () => {
  const { uploadMatrimonialImage, deleteMatrimonialImage } =
    useAuth() as any;

  const defaultProfile = useMemo<MatrimonialProfileData>(
    () => createDefaultProfile(),
    [],
  );
  const [profile, setProfile] = useState<MatrimonialProfileData>(defaultProfile);
  const [profileId, setProfileId] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [hasExistingServerProfile, setHasExistingServerProfile] =
    useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const basicDetailsRef = useRef<HTMLDivElement | null>(null);
  const photoUploadRef = useRef<HTMLInputElement | null>(null);

  const completionSummary = useMemo(() => {
    const weights = {
      basicDetails: 12,
      about: 10,
      education: 8,
      career: 12,
      family: 10,
      contact: 12,
      kundli: 8,
      lifestyle: 10,
      interests: 8,
      gallery: 8,
      partnerPreferences: 10,
    };

    const totalWeight = Object.values(weights).reduce(
      (sum, weight) => sum + weight,
      0,
    );
    let scoreWeight = 0;
    const suggestions: string[] = [];

    const requireSection = (
      fulfilled: boolean,
      weight: number,
      suggestion?: string,
    ) => {
      if (fulfilled) {
        scoreWeight += weight;
      } else if (suggestion) {
        suggestions.push(suggestion);
      }
    };

    const hasBasicDetails = Boolean(
      profile.basicDetails?.height &&
        profile.basicDetails?.religion &&
        profile.basicDetails?.maritalStatus &&
        profile.basicDetails?.location,
    );
    requireSection(
      hasBasicDetails,
      weights.basicDetails,
      "Add your basic details (height, religion, marital status, location)",
    );

    const hasAbout = Boolean(profile.about?.summary?.trim());
    requireSection(
      hasAbout,
      weights.about,
      "Write a short summary about yourself",
    );

    const hasEducation = Boolean(profile.education?.degrees?.length);
    requireSection(
      hasEducation,
      weights.education,
      "Add at least one education detail",
    );

    const hasCareer = Boolean(profile.career?.role && profile.career?.company);
    requireSection(
      hasCareer,
      weights.career,
      "Share your current role and company",
    );

    const hasFamily = Boolean(
      profile.family?.familyBackground || profile.family?.parents,
    );
    requireSection(
      hasFamily,
      weights.family,
      "Describe your family background or parents",
    );

    const hasContact = Boolean(
      profile.contact?.email && profile.contact?.phone,
    );
    requireSection(
      hasContact,
      weights.contact,
      "Add primary email and phone number",
    );

    const hasKundli = Boolean(
      profile.kundli?.birthDate && profile.kundli?.birthPlace,
    );
    requireSection(
      hasKundli,
      weights.kundli,
      "Share your birth date and place for horoscope",
    );

    const hasLifestyle = Boolean(
      (profile.lifestyle?.habits?.length ||
        profile.lifestyle?.assets?.length) &&
        profile.lifestyle?.favourites?.hobbies,
    );
    requireSection(
      hasLifestyle,
      weights.lifestyle,
      "Select lifestyle habits and mention your hobbies",
    );

    const hasInterests = Boolean(profile.interests?.length);
    requireSection(
      hasInterests,
      weights.interests,
      "Add at least one interest (languages, cuisine, etc.)",
    );

    const hasGallery = Boolean(
      (profile.gallery || []).some((photo) => photo?.url),
    );
    requireSection(
      hasGallery,
      weights.gallery,
      "Upload at least one photo",
    );

    const hasPartnerPrefs = Boolean(
      profile.partnerPreferences?.basicDetails?.heightRange ||
        profile.partnerPreferences?.basicDetails?.ageRange ||
        profile.partnerPreferences?.summary,
    );
    requireSection(
      hasPartnerPrefs,
      weights.partnerPreferences,
      "Share what you are looking for in a partner",
    );

    const score = Math.min(100, Math.round((scoreWeight / totalWeight) * 100));
    return {
      score,
      suggestions,
    };
  }, [profile]);

  const setProfileField = useCallback(
    (path: string | string[], value: any) => {
      setProfile((prev) => {
        const segments = Array.isArray(path) ? path : path.split(".");
        const updated: any = JSON.parse(JSON.stringify(prev));
        let cursor: any = updated;
        for (let i = 0; i < segments.length - 1; i += 1) {
          const key = segments[i];
          if (cursor[key] === undefined) {
            cursor[key] = {};
          }
          cursor = cursor[key];
        }
        cursor[segments[segments.length - 1]] = value;
        return updated;
      });
    },
    [],
  );

  const handleInput =
    (sectionPath: string) =>
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ): void => {
      const { name, value } = event.target;
      setProfileField(`${sectionPath}.${name}`, value);
    };

  const toggleCollectionValue = (path: string, option: string) => {
    setProfile((prev) => {
      const merged: any = JSON.parse(JSON.stringify(prev));
      const segments = path.split(".");
      let cursor: any = merged;
      for (let i = 0; i < segments.length - 1; i += 1) {
        cursor = cursor[segments[i]];
      }
      const key = segments[segments.length - 1];
      const collection = new Set<string>(cursor[key] || []);
      if (collection.has(option)) {
        collection.delete(option);
      } else {
        collection.add(option);
      }
      cursor[key] = Array.from(collection);
      return merged;
    });
  };

  const handleInterestChange = (
    index: number,
    field: "label" | "value",
    value: string,
  ) => {
    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      if (!Array.isArray(next.interests)) {
        next.interests = [];
      }
      next.interests[index] = {
        ...(next.interests[index] || { label: "", value: "" }),
        [field]: value,
      };
      return next;
    });
  };

  const addInterest = () => {
    setProfile((prev) => ({
      ...prev,
      interests: [...(prev.interests || []), { label: "", value: "" }],
    }));
  };

  const removeInterest = (index: number) => {
    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next.interests.splice(index, 1);
      return next;
    });
  };

  const handleDegreeChange = (
    index: number,
    field: "level" | "degree" | "institution",
    value: string,
  ) => {
    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      if (!Array.isArray(next.education.degrees)) {
        next.education.degrees = [];
      }
      next.education.degrees[index] = {
        ...(next.education.degrees[index] || {
          level: "",
          degree: "",
          institution: "",
        }),
        [field]: value,
      };
      return next;
    });
  };

  const addDegree = () => {
    setProfile((prev) => ({
      ...prev,
      education: {
        ...prev.education,
        degrees: [
          ...(prev.education?.degrees || []),
          { level: "", degree: "", institution: "" },
        ],
      },
    }));
  };

  const removeDegree = (index: number) => {
    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next.education.degrees.splice(index, 1);
      return next;
    });
  };

  const handleGalleryChange = (index: number, field: string, value: any) => {
    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      if (!Array.isArray(next.gallery)) {
        next.gallery = [];
      }

      const current = {
        ...(next.gallery[index] || {
          id: uuidv4(),
          url: "",
          caption: "",
          isProfilePhoto: false,
          storageKey: "",
          uploadedAt: new Date().toISOString(),
        }),
      };

      if (field === "isProfilePhoto") {
        const checked = Boolean(value);
        next.gallery = next.gallery.map((photo: any, photoIndex: number) => {
          if (photoIndex === index) {
            return {
              ...current,
              isProfilePhoto: checked,
            };
          }
          if (checked) {
            return {
              ...photo,
              isProfilePhoto: false,
            };
          }
          return photo;
        });
        if (index >= next.gallery.length) {
          next.gallery[index] = {
            ...current,
            isProfilePhoto: checked,
          };
        }
        if (checked) {
          next.profilePhoto = current.url;
          next.profilePhotoStorageKey = current.storageKey || "";
        } else if (
          next.profilePhotoStorageKey === current.storageKey ||
          (!current.storageKey && next.profilePhoto === current.url)
        ) {
          next.profilePhoto = "";
          next.profilePhotoStorageKey = "";
        }
        return next;
      }

      (current as any)[field] = value;
      next.gallery[index] = current;
      if (current.isProfilePhoto) {
        next.profilePhoto = current.url;
        next.profilePhotoStorageKey = current.storageKey || "";
      }
      return next;
    });
  };

  const removeGalleryItem = async (
    index: number,
    photoMeta: {
      isProfilePhoto?: boolean;
      storageKey?: string;
      url?: string;
    } = {},
  ) => {
    const entry = profile.gallery[index];

    setProfile((prev) => {
      const next: any = JSON.parse(JSON.stringify(prev));
      next.gallery.splice(index, 1);
      if (
        photoMeta?.isProfilePhoto &&
        (next.profilePhotoStorageKey === photoMeta.storageKey ||
          (!photoMeta.storageKey && next.profilePhoto === photoMeta.url))
      ) {
        next.profilePhoto = "";
        next.profilePhotoStorageKey = "";
      }
      return next;
    });

    if (photoMeta?.storageKey) {
      try {
        const result = await deleteMatrimonialImage({
          storageKey: photoMeta.storageKey,
        });
        if (!result.success) {
          const message = result.error || "Unable to delete gallery item";
          if (/not found/i.test(message)) {
            toast.success("Photo removed from gallery");
            return;
          }
          throw new Error(message);
        }
        toast.success("Photo removed from gallery");
      } catch (error: any) {
        console.error("Failed to delete gallery item", error);
        toast.error(
          error?.message || "Failed to delete photo. Please try again.",
        );
        setProfile((prev) => {
          const next: any = JSON.parse(JSON.stringify(prev));
          next.gallery.splice(index, 0, entry);
          return next;
        });
      }
    }
  };

  const uploadImageFile = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if ((profile.gallery || []).length >= MAX_GALLERY_ITEMS) {
      toast.error(`You can upload up to ${MAX_GALLERY_ITEMS} photos`);
      event.target.value = "";
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be less than 2 MB");
      return;
    }

    const tempId = uuidv4();
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const result = await uploadMatrimonialImage(formData);
      if (!result.success || !result.item) {
        throw new Error(result.error || "Upload failed");
      }

      const newEntry = {
        id: result.item._id || tempId,
        url: result.item.url,
        caption: result.item.title || "",
        isProfilePhoto: false,
        storageKey: result.item.storageKey || "",
        uploadedAt: result.item.createdAt || new Date().toISOString(),
      };

      setProfile((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), newEntry],
      }));

      toast.success("Photo uploaded to gallery");
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to upload photo");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      try {
        const result = await getMyMatrimonyProfile();

        if (!isMounted) return;

        if (result.ok && result.profile?.fullProfile) {
          if (result.profile.id) {
            setProfileId(result.profile.id);
          }
          const merged = deepMerge(
            defaultProfile,
            result.profile.fullProfile || {},
          );
          setProfile(merged);
          setHasExistingServerProfile(true);
          return;
        }

        if (result.notFound) {
          setProfile(createDefaultProfile());
          setHasExistingServerProfile(false);
          return;
        }

        if (result.authError) {
          if (typeof window !== "undefined") {
            window.location.href = "/#login";
          }
          return;
        }

        setProfile(createDefaultProfile());
      } catch (error: any) {
        console.error("Failed to load matrimony profile", error);
        toast.error(
          error?.message || "Failed to load your matrimony profile.",
        );
        setProfile(createDefaultProfile());
      } finally {
        if (isMounted) {
          setIsLoadingProfile(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, [defaultProfile]);

  const publicProfileUrl = useMemo(() => {
    if (typeof window === "undefined" || !profileId) return "";
    return `${window.location.origin}/public-matrimony/${profileId}`;
  }, [profileId]);

  useEffect(() => {
    setProfile((prev) => {
      if (prev.completion === completionSummary.score) {
        return prev;
      }
      return {
        ...prev,
        completion: completionSummary.score,
      };
    });
  }, [completionSummary.score]);

  const pruneEmpty = (value: any): any => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "string") {
      const trimmed = value.trim();
      return trimmed ? trimmed : undefined;
    }
    if (Array.isArray(value)) {
      const next = value
        .map((item) => pruneEmpty(item))
        .filter((item) => item !== undefined);
      return next.length ? next : undefined;
    }
    if (typeof value === "object") {
      const next: any = {};
      Object.keys(value).forEach((key) => {
        const pruned = pruneEmpty((value as any)[key]);
        if (pruned !== undefined) {
          next[key] = pruned;
        }
      });
      return Object.keys(next).length ? next : undefined;
    }
    return value;
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    try {
      const fullProfile =
        pruneEmpty({ ...profile, completion: completionSummary.score }) || {};
      const result = await saveMatrimonyProfileOnServer(fullProfile, {
        hasExisting: hasExistingServerProfile,
      });

      if (!result.ok) {
        if (result.status === 401) {
          toast.error("Please login again to save your profile.");
          if (typeof window !== "undefined") {
            window.location.href = "/#login";
          }
          return;
        }
        if (result.status === 403) {
          toast.error("You are not allowed to save this profile. Please login again.");
          if (typeof window !== "undefined") {
            window.location.href = "/#login";
          }
          return;
        }
        throw new Error(result.error || "Failed to save profile");
      }

      if ((result as any).profile?.id) {
        setProfileId((result as any).profile.id as string);
      }

      setHasExistingServerProfile(true);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Something went wrong while saving");
    } finally {
      setSaving(false);
    }
  };

  const scrollToRef = useCallback(
    (ref: React.RefObject<HTMLElement | null>) => {
      if (ref?.current) {
        ref.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    },
    [],
  );

  const handleEditBasicDetails = useCallback(() => {
    scrollToRef(basicDetailsRef);
  }, [scrollToRef]);

  const handleAddImageClick = useCallback(() => {
    if ((profile.gallery || []).length >= MAX_GALLERY_ITEMS) {
      toast.error(`You can upload up to ${MAX_GALLERY_ITEMS} photos`);
      return;
    }
    if (photoUploadRef.current) {
      photoUploadRef.current.click();
    }
  }, [profile.gallery]);

  void Save;
  void Camera;
  void Edit3;
  void Plus;
  void Trash2;
  void HABIT_OPTIONS;
  void ASSET_OPTIONS;
  void saving;
  void uploading;
  void handleInput;
  void toggleCollectionValue;
  void handleInterestChange;
  void addInterest;
  void removeInterest;
  void handleDegreeChange;
  void addDegree;
  void removeDegree;
  void handleGalleryChange;
  void removeGalleryItem;
  void uploadImageFile;
  void handleSubmit;
  void handleEditBasicDetails;
  void handleAddImageClick;

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {saved && (
        <div className="fixed top-4 right-4 z-50">
          <div className="px-4 py-3 rounded-lg shadow-md bg-green-600 text-white text-sm">
            Matrimonial details updated successfully
          </div>
        </div>
      )}

      {publicProfileUrl && (
        <div className="bg-rose-50/70 border border-rose-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-xl border border-rose-100 p-2">
              <QRCode value={publicProfileUrl} size={88} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-800">Public profile QR</p>
              <p className="text-[11px] text-gray-600 mt-1">
                Scan the QR or share the link below so family and matchmakers can view this profile.
              </p>
            </div>
          </div>
          <div className="w-full sm:w-auto">
            <p className="text-[11px] font-medium text-gray-700 mb-1">Shareable link</p>
            <div className="text-[11px] text-gray-600 break-all bg-white border border-rose-100 rounded-xl px-3 py-2">
              {publicProfileUrl}
            </div>
          </div>
        </div>
      )}

      {/* Header / completion summary */}
      {/* ... keep your existing JSX here unchanged ... */}
      {/* Below this point, your markup is identical to what you pasted,
          just using the typed helpers above. */}
    </div>
  );
};

export default MatrimonialProfile;