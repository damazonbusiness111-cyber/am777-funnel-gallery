import InfraMindEnrollment from "@/components/InfraMindEnrollment";
import HeroCta from "@/components/HeroCta";

export default function EnrollPage() {
  return (
    <main className="min-h-screen bg-midnight">
      <section
        className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 pt-16 text-center font-mono sm:px-8"
      >
        <p className="text-[11px] uppercase tracking-[0.35em] text-gold-hi/70">
          Free AI Starter Program
        </p>
        <h1 className="text-3xl font-bold tracking-[0.02em] text-gold-hi sm:text-4xl">
          InfraMind777 Free AI Starter Program — Founding Batch
        </h1>
        <p className="max-w-md text-xs leading-relaxed text-parchment/55 sm:text-sm">
          Free Founding Batch enrollment is open to applicants ready to build with AI.
        </p>
        <div className="mt-2">
          <HeroCta href="#enroll">Apply for My Free AI Starter Slot</HeroCta>
        </div>
      </section>
      <div id="enroll">
        <InfraMindEnrollment />
      </div>
      <footer className="flex items-center justify-center gap-2 pb-10 opacity-60">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-parchment/50">
          An AM777 ecosystem product
        </span>
      </footer>
    </main>
  );
}
