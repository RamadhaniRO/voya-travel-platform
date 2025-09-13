import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

class StorageService {
  constructor() {
    this.buckets = {
      avatars: 'avatars',
      propertyImages: 'property-images',
      documents: 'documents',
      reviews: 'review-images'
    };
  }

  // Initialize storage buckets
  async initializeBuckets() {
    try {
      const buckets = Object.values(this.buckets);
      
      for (const bucketName of buckets) {
        const { data, error } = await supabase.storage.getBucket(bucketName);
        
        if (error && error.message.includes('not found')) {
          // Create bucket if it doesn't exist
          const { error: createError } = await supabase.storage.createBucket(bucketName, {
            public: true,
            allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'],
            fileSizeLimit: 10485760 // 10MB
          });

          if (createError) {
            console.error(`Error creating bucket ${bucketName}:`, createError);
          } else {
            console.log(`Bucket ${bucketName} created successfully`);
          }
        }
      }
    } catch (error) {
      console.error('Error initializing buckets:', error);
    }
  }

  // Upload file with progress tracking
  async uploadFile(bucket, file, path, onProgress = null) {
    try {
      // Validate file
      const validation = this.validateFile(file);
      if (!validation.valid) {
        toast.error(validation.error);
        return { error: validation.error };
      }

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        toast.error(`Upload failed: ${error.message}`);
        return { error };
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(path);

      toast.success('File uploaded successfully!');
      return { data: { ...data, publicUrl } };
    } catch (error) {
      toast.error('Upload failed');
      return { error };
    }
  }

  // Upload multiple files
  async uploadMultipleFiles(bucket, files, basePath, onProgress = null) {
    try {
      const uploadPromises = files.map((file, index) => {
        const path = `${basePath}/${Date.now()}-${index}-${file.name}`;
        return this.uploadFile(bucket, file, path, onProgress);
      });

      const results = await Promise.all(uploadPromises);
      const successful = results.filter(result => !result.error);
      const failed = results.filter(result => result.error);

      if (failed.length > 0) {
        toast.error(`${failed.length} files failed to upload`);
      }

      if (successful.length > 0) {
        toast.success(`${successful.length} files uploaded successfully!`);
      }

      return { successful, failed };
    } catch (error) {
      toast.error('Multiple upload failed');
      return { error };
    }
  }

  // Upload avatar image
  async uploadAvatar(userId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const path = `avatars/${fileName}`;

      return await this.uploadFile(this.buckets.avatars, file, path);
    } catch (error) {
      return { error };
    }
  }

  // Upload property images
  async uploadPropertyImages(propertyId, files) {
    try {
      const basePath = `properties/${propertyId}`;
      return await this.uploadMultipleFiles(
        this.buckets.propertyImages,
        files,
        basePath
      );
    } catch (error) {
      return { error };
    }
  }

  // Upload document
  async uploadDocument(userId, file, documentType) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${documentType}-${Date.now()}.${fileExt}`;
      const path = `documents/${userId}/${fileName}`;

      return await this.uploadFile(this.buckets.documents, file, path);
    } catch (error) {
      return { error };
    }
  }

  // Upload review image
  async uploadReviewImage(reviewId, file) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${reviewId}-${Date.now()}.${fileExt}`;
      const path = `reviews/${fileName}`;

      return await this.uploadFile(this.buckets.reviews, file, path);
    } catch (error) {
      return { error };
    }
  }

  // Get file URL
  getFileUrl(bucket, path) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return publicUrl;
  }

  // Get signed URL for private files
  async getSignedUrl(bucket, path, expiresIn = 3600) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return { error };
    }
  }

  // List files in bucket
  async listFiles(bucket, path = '', limit = 100) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path, {
          limit,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error listing files:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error listing files:', error);
      return { error };
    }
  }

  // Delete file
  async deleteFile(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) {
        toast.error(`Delete failed: ${error.message}`);
        return { error };
      }

      toast.success('File deleted successfully!');
      return { data };
    } catch (error) {
      toast.error('Delete failed');
      return { error };
    }
  }

  // Delete multiple files
  async deleteMultipleFiles(bucket, paths) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .remove(paths);

      if (error) {
        toast.error(`Delete failed: ${error.message}`);
        return { error };
      }

      toast.success(`${paths.length} files deleted successfully!`);
      return { data };
    } catch (error) {
      toast.error('Delete failed');
      return { error };
    }
  }

  // Move file
  async moveFile(bucket, fromPath, toPath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .move(fromPath, toPath);

      if (error) {
        toast.error(`Move failed: ${error.message}`);
        return { error };
      }

      toast.success('File moved successfully!');
      return { data };
    } catch (error) {
      toast.error('Move failed');
      return { error };
    }
  }

  // Copy file
  async copyFile(bucket, fromPath, toPath) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .copy(fromPath, toPath);

      if (error) {
        toast.error(`Copy failed: ${error.message}`);
        return { error };
      }

      toast.success('File copied successfully!');
      return { data };
    } catch (error) {
      toast.error('Copy failed');
      return { error };
    }
  }

  // Get file info
  async getFileInfo(bucket, path) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(path.split('/').slice(0, -1).join('/'), {
          search: path.split('/').pop()
        });

      if (error) {
        console.error('Error getting file info:', error);
        return { error };
      }

      return { data: data[0] };
    } catch (error) {
      console.error('Error getting file info:', error);
      return { error };
    }
  }

  // Validate file
  validateFile(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ];

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not supported' };
    }

    return { valid: true };
  }

  // Get storage usage
  async getStorageUsage() {
    try {
      const buckets = Object.values(this.buckets);
      let totalSize = 0;
      let totalFiles = 0;

      for (const bucket of buckets) {
        const { data, error } = await this.listFiles(bucket);
        if (!error && data) {
          totalFiles += data.length;
          // Note: Supabase doesn't provide file sizes in list response
          // This would need to be tracked separately in the database
        }
      }

      return {
        totalFiles,
        totalSize, // Would need custom tracking
        buckets: buckets.length
      };
    } catch (error) {
      console.error('Error getting storage usage:', error);
      return { error };
    }
  }

  // Create image transformation URL
  getTransformedImageUrl(bucket, path, transformations = {}) {
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    // Note: Image transformations would require Supabase Pro or custom solution
    // For now, return the public URL
    return publicUrl;
  }

  // Download file
  async downloadFile(bucket, path, filename) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .download(path);

      if (error) {
        console.error('Error downloading file:', error);
        return { error };
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || path.split('/').pop();
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { data };
    } catch (error) {
      console.error('Error downloading file:', error);
      return { error };
    }
  }
}

// Create singleton instance
const storageService = new StorageService();

export default storageService;
