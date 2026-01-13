interface PostDetailProps {
  title: string;
  body?: string;
}

export default function PostDetailSection({
  title,
  body,
}: PostDetailProps) {
  return (
    <section className="section-shell">
      <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
        Journal
      </p>
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
        {title}
      </h2>
      <p className="text-[var(--muted)] max-w-2xl">
        {body ??
          "This is a placeholder detail view for the selected post. Replace this with rich content, imagery, and storytelling for your brand."}
      </p>
    </section>
  );
}

