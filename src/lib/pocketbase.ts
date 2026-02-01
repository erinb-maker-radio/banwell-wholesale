import PocketBase from 'pocketbase';

// Client-side singleton (for use in React components)
const pb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8094');
pb.autoCancellation(false);

export default pb;

// Server-side: Create fresh instance per request (for API routes)
export function createServerPB() {
  const serverPb = new PocketBase(process.env.NEXT_PUBLIC_POCKETBASE_URL || 'http://127.0.0.1:8094');
  serverPb.autoCancellation(false);
  return serverPb;
}

// Authenticate as admin (for API routes that need write access)
export async function authenticateAdmin(pbInstance: PocketBase) {
  await pbInstance.collection('_superusers').authWithPassword(
    process.env.POCKETBASE_ADMIN_EMAIL!,
    process.env.POCKETBASE_ADMIN_PASSWORD!
  );
}

// Helper to get file URL from PocketBase
export function getFileUrl(collectionName: string, recordId: string, filename: string) {
  return `${process.env.NEXT_PUBLIC_POCKETBASE_URL}/api/files/${collectionName}/${recordId}/${filename}`;
}
