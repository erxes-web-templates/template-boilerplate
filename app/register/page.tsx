export default function RegisterPage() {
  return (
    <main className="bg-[#f7f3ea] min-h-screen flex items-center justify-center">
      <section className="w-full max-w-md px-6">
        <div className="card p-8">
          <h1 className="serif text-3xl md:text-4xl font-semibold text-[var(--ink)] mb-6 text-center">
            Register
          </h1>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--ink)] mb-1">
                Full name
              </label>
              <input
                type="text"
                className="w-full border border-[var(--line)] rounded-md px-3 py-2 bg-white text-sm outline-none focus:ring-2 focus:ring-[var(--accent)]"
                placeholder="Your name"
              />
            </div>
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
                placeholder="Create a password"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white px-4 py-2.5 text-sm font-medium uppercase tracking-wide hover:bg-gray-800 transition"
            >
              Create account
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}

