export default function CheckoutSection() {
  return (
    <section className="section-shell">
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
        Checkout
      </h2>
      <p className="text-[var(--muted)] max-w-2xl mb-6">
        Review your stay details and guest information before proceeding to
        secure payment.
      </p>
      <div className="grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="card p-6 space-y-4">
          <h3 className="serif text-xl font-semibold text-[var(--ink)]">
            Stay summary
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Room type, dates, and guest details can be summarized here.
          </p>
        </div>
        <div className="card p-6 space-y-4">
          <h3 className="serif text-xl font-semibold text-[var(--ink)]">
            Total
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Taxes, fees, and nightly rates can be displayed here.
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
  );
}

