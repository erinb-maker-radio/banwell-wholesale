import type { Metadata } from 'next';
import { Suspense } from 'react';
import PhotoUpload from '../../portrait/[clinic]/thank-you/PhotoUpload';

// GIFT-RECIPIENT PHOTO PAGE — /photo/<order id>
// The gift flow's shareable link. A giver buys the portrait, then sends this
// link to the recipient (or a family member with photo access) so THEY can
// upload the design photo — solving "the giver doesn't have the photo," which
// is exactly how gift orders stall. No prices, no order details shown: the
// recipient only sees the photo ask.

export const metadata: Metadata = {
  title: 'Send Us Your Photo | Banwell Designs',
  robots: { index: false, follow: false },
};

export default async function GiftPhotoPage({
  params,
}: {
  params: Promise<{ order: string }>;
}) {
  const { order } = await params;
  const valid = /^[a-z0-9]{15}$/i.test(order);

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-semibold text-gray-900 mb-4">
          A custom glass portrait is being made for you
        </h1>
        <p className="text-lg text-gray-500 leading-relaxed mb-8">
          Someone ordered a custom stained glass style portrait as a gift &mdash; designed from a
          photo of your choice, printed on real glass, and hand-finished by my wife and I in
          Chico, California. All we need is the photo you&apos;d like us to work from.
        </p>

        {valid ? (
          <Suspense fallback={null}>
            <PhotoUpload order={order} />
          </Suspense>
        ) : (
          <p className="text-sm text-red-600 mb-8">
            This link looks incomplete. Please ask the person who sent it to copy the full link,
            or email us at erin@banwelldesigns.com.
          </p>
        )}

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-8">
          <h2 className="font-semibold text-gray-900 mb-3">What happens next</h2>
          <ol className="space-y-2 text-sm text-gray-600">
            <li><span className="font-medium text-gray-800">1.</span> You upload your favorite photo above.</li>
            <li><span className="font-medium text-gray-800">2.</span> We design the portrait and send a digital proof for approval before anything is made.</li>
            <li><span className="font-medium text-gray-800">3.</span> We print it on real glass, hand-finish it, and ship it.</li>
          </ol>
        </div>

        <p className="text-sm text-gray-400">
          Questions? Email{' '}
          <a href="mailto:erin@banwelldesigns.com" className="text-blue-600 hover:underline">
            erin@banwelldesigns.com
          </a>{' '}
          &mdash; you&apos;ll get a real person.
        </p>
      </div>
    </div>
  );
}
