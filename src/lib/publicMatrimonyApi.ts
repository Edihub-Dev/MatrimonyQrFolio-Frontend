import axios from 'axios';

export type PublicMatrimonyProfile = any;

export const getPublicMatrimonyProfile = async (id: string) => {
  try {
    const response = await axios.get<{ profile: PublicMatrimonyProfile }>(
      `/api/public-matrimony/${id}`,
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

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch public matrimony profile.',
    };
  }
};
