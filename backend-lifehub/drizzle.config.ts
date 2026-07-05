import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

// Load environment variables from your .env file
dotenv.config();

export default defineConfig({
  // 1. Where your TypeScript schema definitions live
  schema: './src/db/schema', 
  
  // 2. Where drizzle-kit will generate your SQL migration files
  out: './drizzle', 
  
  // 3. The database driver you are using
  dialect: 'postgresql', 
  
  // 4. Your database connection credentials
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  
  // 5. Recommended safety feature to prevent accidental updates in production
  verbose: true,
  strict: true,
});