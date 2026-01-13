export default function CheckoutPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-4">
          Checkout
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mb-6">
          Review your stay details and guest information before proceeding to
          secure payment.
        </p>
        <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
          <div className="card p-6 space-y-4">
            <h2 className="serif text-xl font-semibold text-[var(--ink)]">
              Stay summary
            </h2>
            <p className="text-sm text-[var(--muted)]">
              This area can show room type, dates, and guest details.
            </p>
          </div>
          <div className="card p-6 space-y-4">
            <h2 className="serif text-xl font-semibold text-[var(--ink)]">
              Total
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Taxes, fees, and nightly rates can be summarized here.
            </p>
            <a
              href="/payment"
              className="block text-center bg-black text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition"
            >
              Proceed to payment
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}

