import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-4">Wholesale Pricing</h1>
      <p className="text-gray-500 mb-8">
        Volume-based discounts applied automatically at checkout.
        The more you order, the more you save.
      </p>

      {/* Tier cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tier 1</p>
          <p className="text-5xl font-bold text-gray-900 mt-2">40%</p>
          <p className="text-gray-500 mt-1">off retail</p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">Minimum order <strong>$400</strong></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-blue-500 p-6 text-center relative">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
            Most Popular
          </span>
          <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">Tier 2</p>
          <p className="text-5xl font-bold text-gray-900 mt-2">50%</p>
          <p className="text-gray-500 mt-1">off retail</p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">Minimum order <strong>$800</strong></p>
          </div>
        </div>

        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 text-center">
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Tier 3</p>
          <p className="text-5xl font-bold text-gray-900 mt-2">55%</p>
          <p className="text-gray-500 mt-1">off retail</p>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-gray-600">Minimum order <strong>$1,200</strong></p>
          </div>
        </div>
      </div>

      {/* Product pricing */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">Retail Prices by Category</h2>
      <div className="bg-white rounded-lg border overflow-hidden mb-12">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-6 py-3 font-medium text-gray-500">Category</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Retail</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Tier 1 (40%)</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Tier 2 (50%)</th>
              <th className="text-right px-6 py-3 font-medium text-gray-500">Tier 3 (55%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {[
              { name: 'Glass Ornaments', retail: 35 },
              { name: 'Glass Sun Catchers (6")', retail: 72 },
              { name: 'Glass Sun Catchers (10")', retail: 98 },
              { name: 'Glass Sun Catchers (12")', retail: 119 },
              { name: 'Glass Sun Catchers (15")', retail: 153 },
              { name: 'Paper Cut Ornaments', retail: 15 },
              { name: 'Wooden Ornaments', retail: 35 },
            ].map(item => (
              <tr key={item.name}>
                <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                <td className="px-6 py-3 text-right">${item.retail.toFixed(2)}</td>
                <td className="px-6 py-3 text-right">${(item.retail * 0.6).toFixed(2)}</td>
                <td className="px-6 py-3 text-right">${(item.retail * 0.5).toFixed(2)}</td>
                <td className="px-6 py-3 text-right text-green-700 font-medium">${(item.retail * 0.45).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-center">
        <Link
          href="/register"
          className="inline-flex items-center px-8 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Wholesale Account
        </Link>
      </div>
    </div>
  );
}
