const mockRooms = [
  {
    id: "grand-suite",
    name: "Grand Suite",
    description: "Expansive suite with separate living area and city views.",
  },
  {
    id: "ocean-king",
    name: "Ocean King Room",
    description: "King bed room with sweeping oceanfront vistas.",
  },
];

export default function RoomsSection() {
  return (
    <section className="section-shell">
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-6">
        Rooms &amp; Suites
      </h2>
      <div className="grid gap-6 md:grid-cols-2">
        {mockRooms.map((room) => (
          <article key={room.id} className="card p-6 space-y-2">
            <h3 className="serif text-xl font-semibold text-[var(--ink)]">
              {room.name}
            </h3>
            <p className="text-sm text-[var(--muted)]">{room.description}</p>
            <a
              href={`/rooms/${room.id}`}
              className="text-sm font-medium underline hover:no-underline text-[var(--ink)] mt-2 inline-block"
            >
              View details
            </a>
          </article>
        ))}
      </div>
    </section>
  );
}

