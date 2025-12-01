import axios from 'axios';

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

export type CreatePhonePePaymentSuccess = {
  ok: true;
  status: number;
  merchantTransactionId: string;
  redirectUrl: string;
  message: string;
};

export type CreatePhonePePaymentError = {
  ok: false;
  status: number;
  authError?: true;
  error: string;
};

export type CreatePhonePePaymentResult =
  | CreatePhonePePaymentSuccess
  | CreatePhonePePaymentError;

export const createPhonePePayment = async (): Promise<CreatePhonePePaymentResult> => {
  try {
    const response = await axios.post<{
      message?: string;
      merchantTransactionId: string;
      redirectUrl: string;
    }>(
      '/api/payment/phonepe/create',
      {},
      {
        headers: authHeaders(),
      },
    );

    return {
      ok: true as const,
      status: response.status,
      merchantTransactionId: response.data.merchantTransactionId,
      redirectUrl: response.data.redirectUrl,
      message: response.data.message || 'Payment initiated successfully.',
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    if (status === 401 || status === 403) {
      return {
        ok: false as const,
        status: status ?? 0,
        authError: true as const,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Authentication required to initiate payment.',
      };
    }

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to initiate PhonePe payment.',
    };
  }
};

export type PhonePePaymentStatusSuccess = {
  ok: true;
  status: number;
  state: string | undefined;
  message: string;
  token: string | null;
  user: {
    id: string;
    phone: string | null;
    email: string | null;
    qrfolioPremium: {
      isActive: boolean;
      expiresAt: string | null;
    };
    matrimonyPremium: {
      isActive: boolean;
      expiresAt: string | null;
    };
  } | null;
};

export type PhonePePaymentStatusError = {
  ok: false;
  status: number;
  authError?: true;
  error: string;
};

export type PhonePePaymentStatusResult =
  | PhonePePaymentStatusSuccess
  | PhonePePaymentStatusError;

export const getPhonePePaymentStatus = async (
  merchantTransactionId: string,
): Promise<PhonePePaymentStatusResult> => {
  try {
    const response = await axios.get<{
      message: string;
      state?: string;
      token?: string;
      user?: {
        id: string;
        phone: string | null;
        email: string | null;
        qrfolioPremium: {
          isActive: boolean;
          expiresAt: string | null;
        };
        matrimonyPremium: {
          isActive: boolean;
          expiresAt: string | null;
        };
      };
    }>(`/api/payment/phonepe/status/${encodeURIComponent(merchantTransactionId)}`,
      {
        headers: authHeaders(),
      },
    );

    return {
      ok: true as const,
      status: response.status,
      state: response.data.state,
      message: response.data.message,
      token: response.data.token ?? null,
      user: response.data.user ?? null,
    };
  } catch (error: any) {
    const status = error?.response?.status as number | undefined;

    if (status === 401 || status === 403) {
      return {
        ok: false as const,
        status: status ?? 0,
        authError: true as const,
        error:
          error?.response?.data?.message ||
          error?.message ||
          'Authentication required to check payment status.',
      };
    }

    return {
      ok: false as const,
      status: status ?? 0,
      error:
        error?.response?.data?.message ||
        error?.message ||
        'Failed to fetch PhonePe payment status.',
    };
  }
};
