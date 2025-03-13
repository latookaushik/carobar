import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/app/lib/logging';
import { getAuthUser, withUser } from '@/app/lib/auth';
import fs from 'fs';
import path from 'path';

/**
 * GET handler for /api/vehicles/images
 * Retrieves a list of existing images for a specific chassis number
 */
const handler = async (request: NextRequest) => {
  try {
    // Get company info from auth context
    const user = getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const companyId = user.companyId;

    // Get the chassis number from query params
    const searchParams = request.nextUrl.searchParams;
    const chassisNo = searchParams.get('chassisNo');

    if (!chassisNo) {
      return NextResponse.json({ error: 'Chassis number is required' }, { status: 400 });
    }

    // The directory would be organized by company ID and chassis number
    const imagesDir = path.join(
      process.cwd(),
      'public',
      'uploads',
      'vehicles',
      companyId.toString(),
      chassisNo
    );

    // Check if directory exists
    if (!fs.existsSync(imagesDir)) {
      // Return empty array if directory doesn't exist (no images yet)
      return NextResponse.json({ images: [] }, { status: 200 });
    }

    // Read directory contents and filter for image files
    const files = fs.readdirSync(imagesDir);
    const imageFiles = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    });

    // Convert filenames to URLs
    const imageUrls = imageFiles.map(
      (file) => `/uploads/vehicles/${companyId}/${chassisNo}/${file}`
    );

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Error retrieving vehicle images: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to retrieve images' }, { status: 500 });
  }
};

// Apply the authentication middleware
export const GET = withUser(handler);
