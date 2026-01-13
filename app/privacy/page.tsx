export default function PrivacyPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-4">
          Privacy Policy
        </h1>
        <p className="text-[var(--muted)] max-w-2xl mb-4">
          Your privacy is important to us. This page explains how we collect,
          use, and safeguard your personal information when you stay with us or
          use our digital services.
        </p>
        <div className="space-y-4 text-sm text-[var(--muted)] max-w-3xl">
          <p>
            We only collect the information necessary to manage reservations,
            personalize your stay, and communicate relevant offers. You may
            request access to, or deletion of, your personal data at any time.
          </p>
        </div>
      </section>
    </main>
  );
}

