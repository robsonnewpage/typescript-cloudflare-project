import { WaitlistForm } from "@/components/waitlist-form";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col bg-white">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <span className="text-lg font-semibold text-gray-900">Acme</span>
          <a
            href="#waitlist"
            className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            Join waitlist
          </a>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Ship your ideas, not your infrastructure.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Acme gives small teams the tools to launch fast without spending weeks
            wiring up the boring parts. Sign up to be first in line.
          </p>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="grid gap-8 sm:grid-cols-3">
            <Feature
              title="Fast by default"
              description="Every project starts pre-wired for speed, so you spend time on your product instead of your setup."
            />
            <Feature
              title="Typed end to end"
              description="From the API to the UI, your data keeps its shape the whole way through."
            />
            <Feature
              title="Built for small teams"
              description="No unnecessary process. Just the tools you need to move quickly and confidently."
            />
          </div>
        </section>

        <section id="waitlist" className="mx-auto max-w-md px-6 py-16">
          <h2 className="text-center text-2xl font-semibold text-gray-900">Join the waitlist</h2>
          <p className="mt-2 text-center text-gray-600">You will be the first to know when we launch.</p>
          <div className="mt-8">
            <WaitlistForm />
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200">
        <div className="mx-auto max-w-5xl px-6 py-8 text-center text-sm text-gray-500">
          Acme. Built for training purposes only.
        </div>
      </footer>
    </div>
  );
}

function Feature({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-base font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-600">{description}</p>
    </div>
  );
}
