interface RoomDetailProps {
  name: string;
  description?: string;
}

export default function RoomDetailSection({
  name,
  description,
}: RoomDetailProps) {
  return (
    <section className="section-shell">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
        Room Detail
      </p>
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
        {name}
      </h2>
      <p className="text-[var(--muted)] max-w-2xl">
        {description ??
          "This is a placeholder detail view for a specific room or suite. Replace this with photography, amenities, and rate information for the selected accommodation."}
      </p>
    </section>
  );
}

