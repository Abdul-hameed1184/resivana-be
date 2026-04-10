/**
 * Centralized Environment Configuration
 * This file handles all environment variables and provides safe fallbacks
 * to ensure consistency across the application.
 */

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 3000,
  
  // JWT Configuration
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET || "access-secret",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET || "refresh-secret",
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// Export individual secrets for easier access
export const { 
  ACCESS_TOKEN_SECRET, 
  REFRESH_TOKEN_SECRET 
} = ENV;
