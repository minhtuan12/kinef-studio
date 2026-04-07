import { cloudinary, ensureCloudinaryConfigured } from "@/lib/cloudinary";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type UploadedAsset = {
  secure_url: string;
  public_id: string;
};

function sanitizeFolder(rawFolder: string | null) {
  if (!rawFolder) {
    return "kinef/custom-orders";
  }

  const trimmed = rawFolder.trim().replace(/\\/g, "/");
  if (!trimmed.startsWith("kinef/")) {
    return "kinef/custom-orders";
  }

  return trimmed;
}

function uploadImage(buffer: Buffer, folder: string): Promise<UploadedAsset> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error || !result?.secure_url || !result.public_id) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }

        resolve(result as UploadedAsset);
      },
    );

    stream.end(buffer);
  });
}

export async function POST(request: Request) {
  if (!ensureCloudinaryConfigured()) {
    return NextResponse.json(
      {
        message:
          "Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.",
      },
      { status: 501 },
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = sanitizeFolder(formData.get("folder")?.toString() ?? null);

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "No image file provided." }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "Only image uploads are allowed." }, { status: 400 });
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ message: "Image must be 10MB or less." }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadImage(buffer, folder);

    return NextResponse.json({
      url: uploaded.secure_url,
      publicId: uploaded.public_id,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unexpected image upload failure.";

    return NextResponse.json({ message }, { status: 500 });
  }
}
