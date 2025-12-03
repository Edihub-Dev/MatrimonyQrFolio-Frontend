import axios from 'axios';

const QR_BASE_URL: string | undefined = (import.meta as any)?.env?.VITE_API_BASE_URL;

export const qrfolioApi = axios.create({
  baseURL: QR_BASE_URL,
});

export const QR_BASE_API_URL = QR_BASE_URL;
