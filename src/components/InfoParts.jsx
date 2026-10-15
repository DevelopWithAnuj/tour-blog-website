export function PageHero({ eyebrow, title, children }) {
  return (
    <header className="mx-auto max-w-7xl px-4 pt-12 md:px-8">
      {eyebrow && (
        <p className="animate-fade-up text-sm font-semibold uppercase tracking-widest text-amber-400">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 max-w-3xl animate-fade-up font-display text-4xl sm:text-5xl">
        {title}
      </h1>
      {children && (
        <p
          style={{ animationDelay: '100ms' }}
          className="mt-4 max-w-2xl animate-fade-up text-lg text-white/65"
        >
          {children}
        </p>
      )}
    </header>
  );
}
