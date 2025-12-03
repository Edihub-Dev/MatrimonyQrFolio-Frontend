import React, { createContext, useContext } from "react";
import axios from "axios";

export type MatrimonialGalleryItem = {
  _id?: string;
  id?: string;
  url: string;
  title?: string;
  description?: string;
  storageKey?: string;
  createdAt?: string;
};

export type UploadMatrimonialImageResult = {
  success: boolean;
  item?: MatrimonialGalleryItem;
  error?: string;
};

export type DeleteMatrimonialImageResult = {
  success: boolean;
  error?: string;
};

export type AuthContextValue = {
  uploadMatrimonialImage: (
    formData: FormData,
  ) => Promise<UploadMatrimonialImageResult>;
  deleteMatrimonialImage: (options: {
    storageKey: string;
  }) => Promise<DeleteMatrimonialImageResult>;
};

const getAuthHeaders = () => {
  if (typeof window === "undefined") return {};
  const token = window.localStorage.getItem("qrAuthToken");
  if (!token) return {};
  return {
    Authorization: `Bearer ${token}`,
  };
};

const realValue: AuthContextValue = {
  async uploadMatrimonialImage(formData) {
    try {
      const response = await axios.post(
        "/api/matrimony/gallery/upload",
        formData,
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const data = response.data || {};

      if (!data.success || !data.item) {
        return {
          success: false,
          error: data.error || "Failed to upload image.",
        };
      }

      return {
        success: true,
        item: data.item as MatrimonialGalleryItem,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          "Failed to upload image.",
      };
    }
  },
  async deleteMatrimonialImage({ storageKey }) {
    try {
      const response = await axios.post(
        "/api/matrimony/gallery/delete",
        { storageKey },
        {
          headers: {
            ...getAuthHeaders(),
            "Content-Type": "application/json",
          },
        },
      );

      const data = response.data || {};

      if (!data.success) {
        return {
          success: false,
          error: data.error || "Failed to delete image.",
        };
      }

      return {
        success: true,
      };
    } catch (error: any) {
      return {
        success: false,
        error:
          error?.response?.data?.error ||
          error?.message ||
          "Failed to delete image.",
      };
    }
  },
};

const stubValue: AuthContextValue = realValue;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <AuthContext.Provider value={realValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  return ctx ?? stubValue;
};
