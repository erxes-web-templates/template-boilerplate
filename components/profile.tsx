export default function ProfileSection() {
  return (
    <section className="section-shell">
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
        Profile
      </h2>
      <p className="text-[var(--muted)] max-w-2xl mb-6">
        View and manage your preferences, upcoming stays, and saved
        experiences.
      </p>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <h3 className="serif text-xl font-semibold text-[var(--ink)] mb-2">
            Guest details
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Placeholder for guest profile information and contact details.
          </p>
        </div>
        <div className="card p-6">
          <h3 className="serif text-xl font-semibold text-[var(--ink)] mb-2">
            Upcoming stays
          </h3>
          <p className="text-sm text-[var(--muted)]">
            Future reservations, exclusive offers, and curated experiences can
            be shown here.
          </p>
        </div>
      </div>
    </section>
  );
}

