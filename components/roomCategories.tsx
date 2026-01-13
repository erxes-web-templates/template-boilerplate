const mockCategories = [
  {
    id: "suites",
    name: "Suites",
    description: "Spacious suites with dedicated living areas and elevated views.",
  },
  {
    id: "rooms",
    name: "Rooms",
    description: "Thoughtfully appointed guest rooms for a refined stay.",
  },
  {
    id: "residences",
    name: "Residences",
    description: "Residential-style accommodations for extended stays.",
  },
];

export default function RoomCategoriesSection() {
  return (
    <section className="section-shell">
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-6">
        Room Categories
      </h2>
      <div className="grid gap-6 md:grid-cols-3">
        {mockCategories.map((category) => (
          <article key={category.id} className="card p-6 space-y-2">
            <h3 className="serif text-xl font-semibold text-[var(--ink)]">
              {category.name}
            </h3>
            <p className="text-sm text-[var(--muted)]">
              {category.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}

