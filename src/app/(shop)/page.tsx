import Link from 'next/link';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-3xl">
            <h1 className="text-5xl font-bold mb-6">
              Wholesale Stained Glass-Style Products
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              Beautiful handcrafted ornaments, sun catchers, and more. Perfect for gift shops,
              boutiques, and retail stores. Tiered wholesale pricing with discounts up to 55%.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/catalog"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg bg-white text-blue-900 hover:bg-blue-50"
              >
                Browse Catalog
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center px-6 py-3 text-base font-medium rounded-lg border-2 border-white text-white hover:bg-white/10"
              >
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Tier pricing overview */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Wholesale Pricing Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { tier: 'Tier 1', spend: '$400+', discount: '40% off', color: 'blue' },
            { tier: 'Tier 2', spend: '$800+', discount: '50% off', color: 'purple' },
            { tier: 'Tier 3', spend: '$1,200+', discount: '55% off', color: 'amber' },
          ].map((t) => (
            <div
              key={t.tier}
              className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center"
            >
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{t.tier}</p>
              <p className="text-4xl font-bold text-gray-900 mt-2">{t.discount}</p>
              <p className="text-gray-500 mt-2">on orders {t.spend}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Product categories */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Our Product Lines
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              { name: 'Glass Ornaments', price: '$35 retail', desc: 'Over 300 unique stained glass-style Christmas ornaments', href: '/catalog/glass-ornaments' },
              { name: 'Glass Sun Catchers', price: '$72-$153 retail', desc: 'Window hangings available in 6", 10", 12", and 15" sizes', href: '/catalog/glass-sun-catchers' },
              { name: 'Paper Cut Ornaments', price: '$15 retail', desc: 'Delicate paper cut style Christmas ornaments', href: '/catalog/paper-cut-ornaments' },
              { name: 'Wooden Ornaments', price: '$35 retail', desc: 'Laser-cut wooden ornaments with stained glass styling', href: '/catalog/wooden-ornaments' },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 hover:shadow-md transition-shadow"
              >
                <h3 className="text-xl font-semibold text-gray-900">{cat.name}</h3>
                <p className="text-blue-600 font-medium mt-1">{cat.price}</p>
                <p className="text-gray-500 mt-2">{cat.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Order?</h2>
        <p className="text-gray-500 mb-8 max-w-2xl mx-auto">
          Register for a wholesale account to access pricing, place orders, and manage your catalog.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center px-8 py-3 text-base font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700"
        >
          Create Wholesale Account
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">Banwell Designs &middot; Wholesale Portal</p>
        </div>
      </footer>
    </div>
  );
}
