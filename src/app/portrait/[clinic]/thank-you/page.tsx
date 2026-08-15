import Link from 'next/link';
import { Suspense } from 'react';
import PhotoUpload from './PhotoUpload';
import ThankYouBeacon from './ThankYouBeacon';

export default function ThankYouPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <ThankYouBeacon />
      <div className="text-5xl mb-6">&#10003;</div>
      <h1 className="text-3xl font-semibold text-gray-900 mb-4">
        Thank you for your order!
      </h1>
      <p className="text-lg text-gray-500 leading-relaxed mb-8">
        One thing left: we need the photo your portrait will be designed from. Upload it below,
        or if you prefer, we will email you for it within one business day.
      </p>

      <Suspense fallback={null}>
        <PhotoUpload />
      </Suspense>

      <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 text-left mb-8">
        <h2 className="font-semibold text-gray-900 mb-3">What happens next</h2>
        <ol className="space-y-2 text-sm text-gray-600">
          <li><span className="font-medium text-gray-800">1.</span> We get your favorite photo — uploaded above, or by email.</li>
          <li><span className="font-medium text-gray-800">2.</span> We design your portrait and send a digital proof for your approval.</li>
          <li><span className="font-medium text-gray-800">3.</span> Once you approve, we print it on glass and ship it to you (1&ndash;2 weeks).</li>
        </ol>
      </div>

      <p className="text-sm text-gray-400 mb-6">
        Questions? Email us at{' '}
        <a href="mailto:erin@banwelldesigns.com" className="text-blue-600 hover:underline">
          erin@banwelldesigns.com
        </a>
      </p>

      <Link
        href="/"
        className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
      >
        Return to Banwell Designs
      </Link>
    </div>
  );
}
