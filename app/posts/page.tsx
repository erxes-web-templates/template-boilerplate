const mockPosts = [
  {
    slug: "winter-by-the-sea",
    title: "Winter by the Sea",
    excerpt:
      "Escape to an oceanfront retreat where soft waves meet crisp winter air.",
  },
  {
    slug: "suite-life",
    title: "The Suite Life",
    excerpt:
      "Thoughtfully appointed suites designed for slow mornings and late nights.",
  },
];

export default function PostsPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen">
      <section className="section-shell">
        <h1 className="serif text-4xl md:text-5xl font-semibold text-[var(--ink)] mb-6">
          Stories & Posts
        </h1>
        <div className="grid gap-6 md:grid-cols-2">
          {mockPosts.map((post) => (
            <article key={post.slug} className="card p-6 flex flex-col gap-3">
              <h2 className="serif text-xl font-semibold text-[var(--ink)]">
                {post.title}
              </h2>
              <p className="text-sm text-[var(--muted)]">{post.excerpt}</p>
              <a
                href={`/posts/${post.slug}`}
                className="text-sm font-medium underline hover:no-underline text-[var(--ink)] mt-2"
              >
                Read more
              </a>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

