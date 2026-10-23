/* eslint-disable no-console */
import { Request } from "express";
import { cloudinary } from "../config/cloudinary";
import { appError } from "../errors/appError";

// "https://res.cloudinary.com/x/image/upload/v123/folder/abc.jpg" -> "folder/abc"
export const getPublicIdFromUrl = (url: string): string | null => {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[^./]+$/);
  return match ? match[1] : null;
};

export const deleteCloudinaryImage = async (url?: string | null) => {
  if (!url) return;
  try {
    const publicId = getPublicIdFromUrl(url);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
    }
  } catch (err) {
    console.error("Cloudinary image deletion failed:", err);
  }
};

export const deleteCloudinaryImages = async (urls: string[]) => {
  await Promise.all(urls.map((u) => deleteCloudinaryImage(u)));
};

// every file uploaded in this request (works with upload.fields)
export const getUploadedPaths = (req: Request): string[] => {
  const files = req.files as
    | { [fieldname: string]: Express.Multer.File[] }
    | undefined;
  return files
    ? Object.values(files)
        .flat()
        .map((f) => f.path)
    : [];
};

// form-data sends arrays as strings, so accept a JSON string
export const parseJson = (value: unknown, fieldName: string) => {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    throw new appError(`${fieldName} must be valid JSON`, 400);
  }
};
