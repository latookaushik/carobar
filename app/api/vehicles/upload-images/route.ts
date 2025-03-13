import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/app/lib/logging';
import { getAuthUser, withUser } from '@/app/lib/auth';
import fs from 'fs';
import path from 'path';
import { mkdir } from 'fs/promises';
import { writeFile } from 'fs/promises';

// Set the maximum file size (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Initialize the FormData API based on runtime (Node.js)
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * POST handler for /api/vehicles/upload-images
 * Uploads vehicle images for a specific chassis number
 */
const handler = async (request: NextRequest) => {
  try {
    // Verify authentication
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get form data for multipart/form-data uploads
    const formData = await request.formData();

    // Get chassis number from form data
    const chassisNo = formData.get('chassisNo') as string;
    if (!chassisNo) {
      return NextResponse.json({ error: 'Chassis number is required' }, { status: 400 });
    }

    // Get company ID from form data or auth context
    let companyId = formData.get('companyId') as string;
    if (!companyId) {
      companyId = user.companyId.toString();
    }

    // Create directory for uploads if it doesn't exist
    const uploadDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'vehicles',
      companyId,
      chassisNo
    );

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    // Extract images from form data
    const uploadedFiles = [];
    let fileIndex = 1;

    // Process each file in the form data with the name pattern 'image_X'
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('image_') && value instanceof Blob) {
        // Get image file
        const file = value as File;

        // Validate file size
        if (file.size > MAX_FILE_SIZE) {
          return NextResponse.json(
            {
              error: `File ${key} exceeds the maximum size of 5MB`,
            },
            { status: 400 }
          );
        }

        // Validate file type (mime type)
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          return NextResponse.json(
            {
              error: `File ${key} has an unsupported format. Only JPEG, PNG, and WebP are allowed.`,
            },
            { status: 400 }
          );
        }

        // Generate filename
        const fileName = `${chassisNo}_p${fileIndex}.jpg`;
        const filePath = path.join(uploadDir, fileName);

        // Convert to buffer and save
        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filePath, buffer);

        uploadedFiles.push(fileName);
        fileIndex++;
      }
    }

    if (uploadedFiles.length === 0) {
      return NextResponse.json({ error: 'No images were uploaded' }, { status: 400 });
    }

    // Return success response with the list of uploaded files
    return NextResponse.json(
      {
        success: true,
        message: `Successfully uploaded ${uploadedFiles.length} image(s)`,
        uploadedFiles,
      },
      { status: 200 }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Error uploading vehicle images: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to upload images' }, { status: 500 });
  }
};

// Apply the authentication middleware
export const POST = withUser(handler);
