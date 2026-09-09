import Link from "next/link";
import { CreateMeetingForm } from "@/components/create-meeting-form";

export default function NewMeetingPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/meetings" className="text-sm text-foreground-muted hover:text-accent-strong">
        ← Meetings
      </Link>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">Register a meeting</h1>
      <p className="mt-1 text-sm text-foreground-muted">
        Add a meeting so its decisions, commitments, and open threads have somewhere to live.
      </p>

      <div className="mt-8">
        <CreateMeetingForm />
      </div>
    </div>
  );
}
