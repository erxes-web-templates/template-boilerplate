export default function LoginSection() {
  return (
    <section className="section-shell max-w-xl">
      <h2 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-4">
        Login
      </h2>
      <form className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Email
          </label>
          <input
            type="email"
            className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--ink)] mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
            placeholder="••••••••"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-black text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition"
        >
          Sign in
        </button>
      </form>
    </section>
  );
}

