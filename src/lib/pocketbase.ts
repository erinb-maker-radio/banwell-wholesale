import PocketBase from 'pocketbase';

// Client-side singleton (for use in React components)
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.banwelldesigns.com');
pb.autoCancellation(false);

export default pb;

// Server-side: Create fresh instance per request (for API routes)
export function createServerPB() {
  const serverPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'https://pb.banwelldesigns.com');
  serverPb.autoCancellation(false);
  return serverPb;
}

// Authenticate as admin (for API routes that need write access)
// Fallbacks match .env.local so missing Vercel env vars don't 500 the route.
export async function authenticateAdmin(pbInstance: PocketBase) {
  await pbInstance.collection('_superusers').authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL || 'admin@banwelldesigns.com',
    process.env.POCKETBASE_ADMIN_PASSWORD || 'changeme123'
  );
}

// Helper to get file URL from PocketBase
export function getFileUrl(collectionName: string, recordId: string, filename: string) {
  return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${collectionName}/${recordId}/${filename}`;
}
