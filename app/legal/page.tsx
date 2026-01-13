export default function LegalPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-4">
          Legal
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mb-4">
          This page outlines the key legal terms that govern the use of our
          website, reservations, and services.
        </p>
        <div className="space-y-4 text-sm text-[var(--muted)] max-w-3xl">
          <p>
            By accessing or using this site, you agree to our terms of use and
            acknowledge that policies may be updated from time to time to
            reflect changes in our services and applicable law.
          </p>
        </div>
      </section>
    </main>
  );
}

