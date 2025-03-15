/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { X, Camera, XCircle, Upload, Loader2 } from 'lucide-react';
import { useCompany } from '@/app/contexts/CompanyContext';
import { toast } from '@/app/components/ui/use-toast';
import { logError } from '@/app/lib/logging';

interface PictureProps {
  chassisNo: string;
  isVisible: boolean;
}

export default function PictureTab({ chassisNo, isVisible }: PictureProps) {
  const { company } = useCompany();
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<{ file: File; preview: string; name: string }[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Maximum number of images allowed
  const MAX_IMAGES = 6;

  // Define loadExistingImages as a useCallback
  const loadExistingImages = useCallback(async () => {
    if (!company || !chassisNo) {
      console.log('Cannot load images: missing company or chassisNo', { company, chassisNo });
      return;
    }

    console.log(`Loading images for chassis: ${chassisNo}, company: ${company?.company_id}`);
    setLoading(true);
    try {
      const apiUrl = `/api/vehicles/images?chassisNo=${chassisNo}`;
      console.log(`Fetching from: ${apiUrl}`);
      const response = await fetch(apiUrl, {
        credentials: 'include',
        // Add cache: 'no-store' to prevent caching
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
      });

      console.log(`API response status: ${response.status}`);

      if (response.ok) {
        const data = await response.json();
        console.log('API response data:', data);
        console.log('Images returned:', data.images ? data.images.length : 0);

        if (data.images && data.images.length > 0) {
          console.log('Image URLs:', data.images);

          // Create absolute URLs if they aren't already
          const absoluteUrls = data.images.map((url: string) => {
            // If URL doesn't start with http or /, add leading /
            if (!url.startsWith('http') && !url.startsWith('/')) {
              return `/${url}`;
            }
            return url;
          });

          console.log('Setting image URLs:', absoluteUrls);
          setExistingImages(absoluteUrls);
        } else {
          console.log('No images returned from API');
          setExistingImages([]);
        }
      } else {
        // Handle 404 silently - just means no images yet
        if (response.status !== 404) {
          throw new Error(`Failed to load images: ${response.status}`);
        } else {
          console.log('404 response - no images found');
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error(`Error loading images: ${errorMessage}`);
      logError(`Error loading images: ${errorMessage}`);

      // Only show toast for non-404 errors
      if (!errorMessage.includes('404')) {
        toast({
          title: 'Error',
          description: 'Failed to load existing images.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
    }
  }, [company, chassisNo]);

  // Load existing images when component mounts
  useEffect(() => {
    if (isVisible && chassisNo) {
      loadExistingImages();
    }
  }, [isVisible, chassisNo, loadExistingImages]);

  // Cleanup previews when component unmounts
  useEffect(() => {
    return () => {
      // Revoke the data URLs to avoid memory leaks
      images.forEach((image) => URL.revokeObjectURL(image.preview));
    };
  }, [images]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;

    // Check if adding new files would exceed the maximum
    if (images.length + event.target.files.length > MAX_IMAGES) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles = Array.from(event.target.files);

    // Validate file types and sizes
    const validFiles = newFiles.filter((file) => {
      // Check file type
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        toast({
          title: 'Invalid file type',
          description: `${file.name} is not a supported image format. Please use JPG, PNG, or WebP.`,
          variant: 'destructive',
        });
        return false;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} exceeds the 5MB limit.`,
          variant: 'destructive',
        });
        return false;
      }

      return true;
    });

    // Create preview and add files to state
    const newImages = validFiles.map((file, index) => {
      const imageNumber = images.length + index + 1;
      const fileName = `chassisno_p${imageNumber}.jpg`;

      return {
        file,
        preview: URL.createObjectURL(file),
        name: fileName,
      };
    });

    setImages((prev) => [...prev, ...newImages]);

    // Reset the input value to allow selecting the same file again
    event.target.value = '';
  };

  // Handle drag and drop
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!event.dataTransfer.files) return;

    // Check if adding new files would exceed the maximum
    if (images.length + event.dataTransfer.files.length > MAX_IMAGES) {
      toast({
        title: 'Too many files',
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: 'destructive',
      });
      return;
    }

    const newFiles = Array.from(event.dataTransfer.files);

    // Filter for only image files
    const imageFiles = newFiles.filter(
      (file) =>
        ['image/jpeg', 'image/png', 'image/webp'].includes(file.type) &&
        file.size <= 5 * 1024 * 1024
    );

    if (imageFiles.length !== newFiles.length) {
      toast({
        title: 'Some files were skipped',
        description: 'Only image files (JPG, PNG, WebP) under 5MB are supported.',
        variant: 'default',
      });
    }

    // Create preview and add files to state
    const newImages = imageFiles.map((file, index) => {
      const imageNumber = images.length + index + 1;
      const fileName = `chassisno_p${imageNumber}.jpg`;

      return {
        file,
        preview: URL.createObjectURL(file),
        name: fileName,
      };
    });

    setImages((prev) => [...prev, ...newImages]);
  };

  // Handle removing an image
  const handleRemoveImage = (index: number) => {
    setImages((prev) => {
      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(prev[index].preview);

      // Remove the image and update the names of the remaining images
      const updatedImages = prev.filter((_, i) => i !== index);

      // Update the file names to ensure sequential numbering
      return updatedImages.map((img, i) => ({
        ...img,
        name: `chassisno_p${i + 1}.jpg`,
      }));
    });
  };

  // Handle clipboard paste
  const handlePaste = useCallback(
    (event: ClipboardEvent) => {
      if (!event.clipboardData?.items) return;

      // Check if we've already reached the max images
      if (images.length >= MAX_IMAGES) {
        toast({
          title: 'Maximum images reached',
          description: `You can only upload up to ${MAX_IMAGES} images.`,
          variant: 'destructive',
        });
        return;
      }

      const imageItems = Array.from(event.clipboardData.items).filter(
        (item) => item.type.indexOf('image') !== -1
      );

      if (imageItems.length === 0) return;

      // Process only the first image if multiple are pasted
      const item = imageItems[0];
      const blob = item.getAsFile();

      if (!blob) return;

      // Check file size
      if (blob.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'The pasted image exceeds the 5MB limit.',
          variant: 'destructive',
        });
        return;
      }

      // Create a preview for the pasted image
      const imageNumber = images.length + 1;
      const fileName = `chassisno_p${imageNumber}.jpg`;
      const preview = URL.createObjectURL(blob);

      setImages((prev) => [
        ...prev,
        {
          file: blob,
          preview,
          name: fileName,
        },
      ]);

      toast({
        title: 'Image added',
        description: 'Pasted image was added to selection.',
      });
    },
    [images, MAX_IMAGES]
  );

  // Add event listener for paste events
  useEffect(() => {
    if (isVisible) {
      window.addEventListener('paste', handlePaste);
    }

    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, [isVisible, handlePaste]);

  // Handle uploading images
  const handleUpload = async () => {
    console.log('Starting image upload...');
    if (!company || !chassisNo) {
      console.error('Missing company or chassisNo for upload', { company, chassisNo });
      toast({
        title: 'Error',
        description: 'Missing company or chassis number information.',
        variant: 'destructive',
      });
      return;
    }

    if (images.length === 0) {
      console.log('No images to upload');
      toast({
        title: 'No images',
        description: 'Please select at least one image to upload.',
        variant: 'destructive',
      });
      return;
    }

    console.log(`Uploading ${images.length} images for chassis ${chassisNo}`);
    setUploading(true);

    try {
      // Create a FormData object
      const formData = new FormData();
      formData.append('chassisNo', chassisNo);
      formData.append('companyId', (company?.company_id || '0').toString());

      // Append each file with its position
      images.forEach((image, index) => {
        console.log(
          `Adding image ${index + 1}: ${image.name} (${image.file.size} bytes, type: ${image.file.type})`
        );
        formData.append(`image_${index + 1}`, image.file, image.name);
      });

      // Send the images to the server
      console.log('Sending upload request to server...');
      const response = await fetch('/api/vehicles/upload-images', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      console.log(`Upload response status: ${response.status}`);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Upload response data:', responseData);

      // After successful upload, manually construct the URLs
      // This is an alternative approach to calling loadExistingImages
      const uploadedFiles = responseData.uploadedFiles || [];
      console.log('Uploaded files from response:', uploadedFiles);

      if (uploadedFiles.length > 0) {
        // Immediately update the UI with the new images
        // Use relative paths consistent with the API
        const newImageUrls = uploadedFiles.map(
          (filename: string) => `/uploads/vehicles/${company?.company_id}/${chassisNo}/${filename}`
        );

        console.log('Constructed image URLs:', newImageUrls);

        // Create URL strings with timestamps to directly display in the UI
        const uploadedImageElements: string[] = [];

        for (let i = 0; i < uploadedFiles.length; i++) {
          // Create URL string with timestamp
          const imageUrl = newImageUrls[i] + '?t=' + Date.now();

          // Log the actual image URL being used
          console.log(`Creating image with src: ${imageUrl}`);
          uploadedImageElements.push(imageUrl);
        }

        // Immediately update the existing images with these newly uploaded images
        setExistingImages((prevImages) => {
          const allImages = [...prevImages, ...uploadedImageElements];
          // Remove duplicates by converting to Set and back to array
          const uniqueImages = Array.from(new Set(allImages));
          console.log('Updated existing images:', uniqueImages);
          return uniqueImages;
        });
      }

      // Also try to reload from the API to stay in sync with the server
      setTimeout(() => {
        console.log('Reloading images from API after upload...');
        loadExistingImages();
      }, 500); // Short delay to allow server to process

      toast({
        title: 'Success',
        description: `Successfully uploaded ${images.length} image${images.length === 1 ? '' : 's'}.`,
      });

      // Clear the uploaded images
      console.log('Clearing temporary image previews...');
      images.forEach((image) => URL.revokeObjectURL(image.preview));
      setImages([]);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      logError(`Error uploading images: ${errorMessage}`);

      toast({
        title: 'Upload failed',
        description: 'Failed to upload images. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  // Handle closing the image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };

  // Handle keyboard events for the modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedImage) {
        closeImageModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedImage]);

  // If not visible, don't render anything
  if (!isVisible) return null;

  // Calculate how many empty slots we need on both sides
  const emptyExistingSlots = Math.max(0, 6 - existingImages.length);
  const emptyNewSlots = Math.max(0, 6 - images.length);

  return (
    <div>
      {/* Two section layout with headers and borders */}
      <div className="flex mb-2 gap-1">
        {/* Left section - Existing images */}
        <div className="w-1/2 border rounded-md p-2">
          <div className="text-xs font-semibold mb-2 text-center border-b pb-1">
            Existing pictures
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="animate-spin mr-2" size={16} />
              <span className="text-xs">Loading...</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {/* Existing images */}
              {existingImages.slice(0, 6).map((src, index) => (
                <div
                  key={`existing-${index}`}
                  className="relative border rounded-md overflow-hidden cursor-pointer"
                  style={{ height: '110px', width: '100%' }}
                  onClick={() => setSelectedImage(src)}
                >
                  <img
                    src={`${src}${src.includes('?') ? '&' : '?'}t=${Date.now()}`}
                    alt={`Vehicle image ${index + 1}`}
                    style={{ width: '100%', height: '110px', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error(`Error loading image: ${src}`);

                      // Try to extract filename and create full path as fallback
                      const imgElement = e.currentTarget as HTMLImageElement;

                      // Get the filename from the URL
                      const filename = src.split('/').pop()?.split('?')[0];
                      if (filename && company && chassisNo) {
                        // Create a direct path that should work
                        const directPath = `/uploads/vehicles/${company.company_id}/${chassisNo}/${filename}?t=${Date.now()}`;
                        console.log(`Trying fallback path: ${directPath}`);
                        imgElement.src = directPath;
                      }
                    }}
                  />
                  {/* Display small indicator that image is loaded */}
                  <div className="absolute bottom-0 right-0 bg-green-500 w-2 h-2 rounded-full opacity-50"></div>
                </div>
              ))}

              {/* Empty slots for existing images */}
              {Array.from({ length: emptyExistingSlots }).map((_, index) => (
                <div
                  key={`empty-existing-${index}`}
                  className="border rounded-md"
                  style={{ height: '110px' }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right section - New images */}
        <div className="w-1/2 border rounded-md p-2">
          <div className="text-xs font-semibold mb-2 text-center border-b pb-1">
            Uploaded Pictures
          </div>
          <div className="grid grid-cols-3 gap-2">
            {/* New images */}
            {images.slice(0, 6).map((image, index) => (
              <div
                key={`new-${index}`}
                className="relative border rounded-md overflow-hidden"
                style={{ height: '110px', width: '100%' }}
              >
                <Image
                  src={image.preview}
                  alt={`Preview ${index + 1}`}
                  width={120}
                  height={110}
                  style={{ objectFit: 'cover' }}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                  title="Remove image"
                >
                  <X size={10} />
                </button>
              </div>
            ))}

            {/* Empty slots for new images - clickable with dashed border */}
            {Array.from({ length: emptyNewSlots }).map((_, index) => (
              <div
                key={`empty-new-${index}`}
                className="border border-dashed rounded-md flex items-center justify-center cursor-pointer"
                style={{ height: '110px' }}
                onClick={() => document.getElementById('file-upload')?.click()}
                title="Click to add image or paste from clipboard"
              >
                <span className="text-xs text-gray-400">+</span>
              </div>
            ))}
          </div>

          {/* Upload button */}
          {images.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex items-center gap-1 bg-maroon-600 hover:bg-maroon-700 text-white px-2 py-0.5 rounded-md text-xs"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={10} />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload size={10} />
                    <span>Upload Images</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Upload area */}
      <div
        className="border border-dashed border-gray-300 rounded-md text-center py-1 flex items-center justify-center"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <div className="flex items-center justify-center space-x-2">
          <Camera className="text-gray-400" size={16} />
          <span className="text-xs">Drag images here or</span>
          <button
            onClick={() => document.getElementById('file-upload')?.click()}
            className="bg-maroon-600 hover:bg-maroon-700 text-white px-2 py-0.5 rounded-md text-xs"
          >
            Browse Files
          </button>
          <input
            id="file-upload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleFileSelect}
          />
          <span className="text-xs text-gray-500">
            Up to 6 images (JPG/PNG/WebP, max 5MB) - You can also paste images
          </span>
        </div>
      </div>

      {/* Full-size image modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center"
          onClick={closeImageModal}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              className="absolute -top-10 right-0 text-white hover:text-gray-300"
              onClick={closeImageModal}
            >
              <XCircle size={24} />
            </button>
            <img
              src={`${selectedImage}${selectedImage?.includes('?') ? '&' : '?'}t=${Date.now()}`}
              alt="Full-size image"
              style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
              onClick={(e) => e.stopPropagation()}
              onError={(e) => {
                console.error(`Error loading full-size image: ${selectedImage}`);

                // Try to extract filename and create full path as fallback
                if (selectedImage && company && chassisNo) {
                  const imgElement = e.currentTarget as HTMLImageElement;

                  // Get the filename from the URL
                  const filename = selectedImage.split('/').pop()?.split('?')[0];
                  if (filename) {
                    // Create a direct path that should work
                    const directPath = `/uploads/vehicles/${company.company_id}/${chassisNo}/${filename}?t=${Date.now()}`;
                    console.log(`Trying fullsize fallback path: ${directPath}`);
                    imgElement.src = directPath;
                  }
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
