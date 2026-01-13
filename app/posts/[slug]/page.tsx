interface PostDetailPageProps {
  params: { slug: string };
}

export default function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = params;

  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] mb-2">
          JOURNAL
        </p>
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-4 capitalize">
          {slug.replace(/-/g, " ")}
        </h1>
        <p className="text-[var(--muted)] max-w-2xl">
          This is a placeholder detail view for the selected post. You can
          extend this page with real content, photography, and storytelling that
          reflects your brand&apos;s narrative.
        </p>
      </section>
    </main>
  );
}

