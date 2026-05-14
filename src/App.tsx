function App() {
  return (
    <main className="min-h-screen bg-slate-950 text-white px-5 py-6">
      <section className="mx-auto max-w-md">
        <p className="text-sm text-emerald-400 font-semibold">Stackd</p>

        <h1 className="mt-4 text-4xl font-bold tracking-tight">
          Get stacked.
        </h1>

        <p className="mt-4 text-slate-300">
          Turn your first paycheck into a simple wealth plan.
        </p>

        <div className="mt-8 rounded-3xl bg-slate-900 p-5 shadow-lg">
          <p className="text-sm text-slate-400">Estimated monthly take-home</p>
          <p className="mt-2 text-4xl font-bold">$5,400</p>
          <p className="mt-2 text-sm text-slate-400">
            Based on a $90,000 salary and 6% 401(k) contribution.
          </p>
        </div>

        <button className="mt-6 w-full rounded-2xl bg-emerald-400 py-4 font-bold text-slate-950">
          Build my plan
        </button>
      </section>
    </main>
  )
}

export default App