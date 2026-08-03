"use client";

import InfraMindEnrollment from "@/components/InfraMindEnrollment";
import HeroCta from "@/components/HeroCta";
import { dispatchStartEnrollment } from "@/lib/enrollmentEvents";

export default function EnrollPage() {
  return (
    <main className="min-h-screen bg-surface">
      <section className="mx-auto flex max-w-xl flex-col items-center gap-4 px-5 pt-16 text-center sm:px-8">
        <p className="text-[11px] uppercase tracking-[0.35em] text-accent">Practical AI Starter Program</p>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
          InfraMind777 Practical AI Starter Program
        </h1>
        <p className="max-w-md text-xs leading-relaxed text-ink/55 sm:text-sm">
          Free enrollment is open to applicants ready to build practical AI skills.
        </p>
        <div className="mt-2">
          <HeroCta href="#enroll" onClick={dispatchStartEnrollment}>
            Apply for My Free AI Starter Slot
          </HeroCta>
        </div>
      </section>
      <div id="enroll">
        <InfraMindEnrollment />
      </div>
      <footer className="flex items-center justify-center gap-2 pb-10 opacity-60">
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink/50">
          Built with AM777 as practical automation partner
        </span>
      </footer>
    </main>
  );
}
