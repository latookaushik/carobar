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

    // Read directory contents and filter for image files - using { withFileTypes: true } to get more info
    const dirEntries = fs.readdirSync(imagesDir, { withFileTypes: true });

    // Filter for only files (not directories) and only image files by extension
    const imageFiles = dirEntries
      .filter((dirent) => dirent.isFile())
      .map((dirent) => dirent.name)
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      });

    // Get the current server's address from the request
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || '';
    const baseUrl = `${protocol}://${host}`;

    // Convert filenames to fully qualified URLs with timestamp to bust cache
    const timestamp = Date.now();
    const imageUrls = imageFiles.map(
      (file) => `${baseUrl}/uploads/vehicles/${companyId}/${chassisNo}/${file}?t=${timestamp}`
    );

    // Log the image URLs for debugging
    console.log(`Found ${imageUrls.length} images for chassis ${chassisNo}`);

    return NextResponse.json({ images: imageUrls }, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logError(`Error retrieving vehicle images: ${errorMessage}`);
    return NextResponse.json({ error: 'Failed to retrieve images' }, { status: 500 });
  }
};

// Apply the authentication middleware
export const GET = withUser(handler);
