import Link from "next/link";
import { notFound } from "next/navigation";
import { getMeeting } from "@/lib/data/meetings";
import { TranscriptUpload } from "@/components/transcript-upload";
import { DeleteMeetingButton } from "@/components/delete-meeting-button";

// Same reasoning as the rest of the app's data pages — read D1 live.
export const dynamic = "force-dynamic";

export default async function MeetingDetailPage(props: PageProps<"/meetings/[meetingId]">) {
  const { meetingId } = await props.params;
  const meeting = await getMeeting(meetingId);
  if (!meeting) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-12">
      <Link href="/meetings" className="text-sm text-foreground-muted hover:text-accent-strong">
        ← Meetings
      </Link>

      <div className="mt-2 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">{meeting.title}</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            {new Date(meeting.occurredAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}{" "}
            · {meeting.participants.join(", ")}
          </p>
        </div>
        <DeleteMeetingButton meetingId={meeting.id} meetingTitle={meeting.title} />
      </div>

      <div className="mt-8">
        <TranscriptUpload meetingId={meeting.id} transcriptKey={meeting.transcriptKey} />
      </div>
    </div>
  );
}
