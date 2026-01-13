export default function PaymentPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen flex items-center justify-center">
      <section className="w-full max-w-md px-6">
        <div className="card p-8">
          <h1 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4 text-center">
            Payment
          </h1>
          <p className="text-[var(--muted)] text-sm mb-6 text-center">
            Enter your payment details to securely confirm your stay.
          </p>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Card number
              </label>
              <input
                type="text"
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  Expiry
                </label>
                <input
                  type="text"
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="MM / YY"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                  CVC
                </label>
                <input
                  type="text"
                  className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                  placeholder="CVC"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition"
            >
              Pay now
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

