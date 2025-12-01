import axios from 'axios';

export type MatrimonyFullProfile = any;

export type MatrimonyProfileResponse = {
  id: string;
  userId: string;
  profileFor: string;
  gender: string;
  age: string;
  religion: string;
  motherTongue: string;
  city: string;
  bio: string;
  education: string;
  profession: string;
  familyDetails: string;
  photos: string[];
  fullProfile: MatrimonyFullProfile | null;
  createdAt: string;
  updatedAt: string;
};

const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem('qrAuthToken');
};

const authHeaders = () => {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const getMyMatrimonyProfile = async () => {
  try {
    const response = await axios.get<{ profile: MatrimonyProfileResponse }>(
      '/api/matrimony/profile/me',
      {
        headers: authHeaders(),
      },
    );

    return {
      ok: true as const,
      status: response.status,
      profile: response.data.profile,
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    if (status === 404) {
      return {
        ok: false as const,
        status,
        notFound: true as const,
      };
    }

    if (status === 401 || status === 403) {
      return {
        ok: false as const,
        status,
        authError: true as const,
        message:
          error?.response?.data?.message || 'Authentication required to view profile.',
      };
    }

    return {
      ok: false as const,
      status: status ?? 0,
      error: error?.message || 'Failed to fetch matrimony profile.',
    };
  }
};

export const createMatrimonyProfileOnServer = async (
  fullProfile: MatrimonyFullProfile,
) => {
  try {
    const response = await axios.post<{
      profile: MatrimonyProfileResponse;
      message?: string;
    }>(
      '/api/matrimony/profile/create',
      {
        fullProfile,
      },
      {
        headers: authHeaders(),
      },
    );

    return {
      ok: true as const,
      status: response.status,
      profile: response.data.profile,
      message: response.data.message || 'Matrimony profile created successfully.',
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create matrimony profile.',
    };
  }
};

export const updateMatrimonyProfileOnServer = async (
  fullProfile: MatrimonyFullProfile,
) => {
  try {
    const response = await axios.put<{
      profile: MatrimonyProfileResponse;
      message?: string;
    }>(
      '/api/matrimony/profile/edit',
      {
        fullProfile,
      },
      {
        headers: authHeaders(),
      },
    );

    return {
      ok: true as const,
      status: response.status,
      profile: response.data.profile,
      message: response.data.message || 'Matrimony profile updated successfully.',
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update matrimony profile.',
    };
  }
};

export const saveMatrimonyProfileOnServer = async (
  fullProfile: MatrimonyFullProfile,
  options: { hasExisting: boolean },
) => {
  if (options.hasExisting) {
    return updateMatrimonyProfileOnServer(fullProfile);
  }
  return createMatrimonyProfileOnServer(fullProfile);
};
