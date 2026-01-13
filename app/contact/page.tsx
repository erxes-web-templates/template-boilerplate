export default function ContactPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-4">
          Contact
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mb-6">
          We are here to help with reservations, special requests, and
          questions about your stay.
        </p>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="card p-6">
            <h2 className="serif text-xl font-semibold text-[var(--ink)] mb-2">
              Reservations
            </h2>
            <p className="text-sm text-[var(--muted)]">
              Call us at{" "}
              <a
                href="tel:+12144147504"
                className="underline hover:text-[var(--ink)]"
              >
                +1 214 414 7504
              </a>{" "}
              or email{" "}
              <a
                href="mailto:reservations@example.com"
                className="underline hover:text-[var(--ink)]"
              >
                reservations@example.com
              </a>
              .
            </p>
          </div>
          <div className="card p-6">
            <h2 className="serif text-xl font-semibold text-[var(--ink)] mb-2">
              General Enquiries
            </h2>
            <p className="text-sm text-[var(--muted)]">
              For events, partnerships, and other enquiries, contact{" "}
              <a
                href="mailto:hello@example.com"
                className="underline hover:text-[var(--ink)]"
              >
                hello@example.com
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

