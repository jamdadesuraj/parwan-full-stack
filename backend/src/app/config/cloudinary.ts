import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";
import { Request } from "express";

dotenv.config();

// =====================================================
// CLOUDINARY CONFIG
// =====================================================

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// =====================================================
// GET UPLOAD FOLDER
// =====================================================

const getUploadFolder = (req: Request): string => {
  const url = req.originalUrl.toLowerCase();

  if (url.includes("/home-banner")) return "homeBanner";
  if (url.includes("/about-us")) return "aboutUs";
  if (url.includes("/founder-info")) return "founderInfo";
  if (url.includes("/lunching-products")) return "launchingProducts";
  if (url.includes("/drone-products")) return "droneProducts";
  if (url.includes("/digital-experience")) return "digitalExperience";
  if (url.includes("/we-offer")) return "weOffer";
  if (url.includes("/life")) return "life";
  if (url.includes("/drone-catlouge")) return "droneCatlouge";
  if (url.includes("/awards")) return "awards";
  if (url.includes("/certificates")) return "certificates";
  if (url.includes("/media-coverage")) return "media-coverage";
  if (url.includes("/services")) return "services";
  if (url.includes("/enquiries-careers")) return "enquiries-careers";
  if (url.includes("/testimonials")) return "testimonials";
  if (url.includes("/gallery")) return "gallery";
  if (url.includes("/products")) return "products";
  if (url.includes("/seo-pages")) return "seo-pages";

  return "uploads";
};

// =====================================================
// SANITIZE FILE NAME
// =====================================================

const sanitizeFileName = (fileName: string): string => {
  return fileName
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
};

// =====================================================
// GET FILE EXTENSION (for raw/pdf delivery)
// =====================================================

const getFileExtension = (fileName: string): string => {
  const match = fileName.match(/\.([^/.]+)$/);
  return match ? match[1].toLowerCase() : "";
};

// =====================================================
// CLOUDINARY STORAGE
// =====================================================

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req: Request, file: Express.Multer.File) => {
    const folder = getUploadFolder(req);

    const isVideo = file.mimetype.startsWith("video/");
    const isPdf = file.mimetype === "application/pdf";
    const isImage = file.mimetype.startsWith("image/");

    const fileName = sanitizeFileName(file.originalname);
    const ext = getFileExtension(file.originalname);

    const publicId = `${Date.now()}-${fileName}`;

    // =================================================
    // PDF
    // =================================================
    // IMPORTANT:
    // - Use resource_type "raw" so PDFs deliver reliably even if
    //   "Allow delivery of PDF/ZIP" is disabled on the Cloudinary account
    //   for the "image" resource type.
    // - The extension MUST be included in the public_id for "raw" files,
    //   otherwise Cloudinary/browsers can't determine the content type
    //   and the PDF viewer fails with "Failed to load PDF document."

    if (isPdf) {
      return {
        folder,
        resource_type: "raw",
        type: "upload",
        public_id: `${publicId}.${ext || "pdf"}`,
        format: "pdf",
      } as any;
    }

    // =================================================
    // VIDEO
    // =================================================

    if (isVideo) {
      return {
        folder,
        resource_type: "video",
        type: "upload",
        public_id: publicId,
      } as any;
    }

    // =================================================
    // IMAGE
    // =================================================

    if (isImage) {
      return {
        folder,
        resource_type: "image",
        type: "upload",
        public_id: publicId,

        transformation: [
          {
            width: 1200,
            height: 600,
            crop: "limit",
          },
        ],
      } as any;
    }

    // =================================================
    // FALLBACK
    // =================================================

    return {
      folder,
      resource_type: "raw",
      type: "upload",
      public_id: `${publicId}${ext ? "." + ext : ""}`,
    } as any;
  },
});

// =====================================================
// MULTER UPLOAD
// =====================================================

export const upload = multer({
  storage,

  limits: {
    fileSize: 500 * 1024 * 1024,
  },

  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      // ============================
      // IMAGES
      // ============================

      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/avif",
      "image/gif",

      // ============================
      // VIDEOS
      // ============================

      "video/mp4",
      "video/mpeg",
      "video/quicktime",
      "video/x-msvideo",
      "video/webm",

      // ============================
      // PDF
      // ============================

      "application/pdf",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error("Only image, video and PDF files are allowed") as any,
        false,
      );
    }
  },
});

// =====================================================
// EXPORT CLOUDINARY
// =====================================================

export { cloudinary };
