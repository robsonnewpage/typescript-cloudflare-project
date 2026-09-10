export interface TranscriptCue {
  start: string;
  end: string;
  speaker: string | null;
  text: string;
}

const TIMESTAMP_LINE = /^(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/;
// The actual W3C WebVTT way to attribute a cue to a speaker: a voice span,
// <v Name>text</v> (the closing tag is optional per spec). Real exports
// from Zoom/Teams/Whisper-based tools often skip voice spans entirely and
// just prefix "Name: text" instead — not standard, but common enough in
// the wild that both need handling.
const VOICE_SPAN = /^<v(?:\.[\w-]+)*\s+([^>]+)>(.*?)(?:<\/v>\s*)?$/;
const SPEAKER_PREFIX = /^([^:]{1,40}):\s*(.*)$/;

// Deliberately tolerant, not a full spec parser: this only needs to handle
// the cue shapes real WebVTT exports actually use, not every corner of
// the format (styling blocks, regions, nested markup beyond voice spans).
export function parseWebVTT(source: string): TranscriptCue[] {
  const blocks = source
    .replace(/\r\n/g, "\n")
    .split(/\n\n+/)
    .map((block) => block.trim())
    .filter(Boolean);

  const cues: TranscriptCue[] = [];

  for (const block of blocks) {
    const lines = block.split("\n");
    const timestampLineIndex = lines.findIndex((line) => TIMESTAMP_LINE.test(line));
    if (timestampLineIndex === -1) continue; // header line, or a stray cue identifier with no timing

    const match = lines[timestampLineIndex].match(TIMESTAMP_LINE);
    if (!match) continue;

    const textLines = lines.slice(timestampLineIndex + 1).join(" ").trim();
    if (!textLines) continue;

    const voiceMatch = textLines.match(VOICE_SPAN);
    const speakerMatch = voiceMatch ? null : textLines.match(SPEAKER_PREFIX);
    cues.push({
      start: match[1],
      end: match[2],
      speaker: voiceMatch ? voiceMatch[1].trim() : speakerMatch ? speakerMatch[1].trim() : null,
      text: voiceMatch ? voiceMatch[2].trim() : speakerMatch ? speakerMatch[2].trim() : textLines,
    });
  }

  return cues;
}

// Unique speakers in first-appearance order — this is what stands in for
// a "participants" field, since WebVTT (the W3C spec) has no such field
// itself: no header metadata for date/title/attendees, nothing beyond
// cues and voice spans. Anything about the meeting other than who spoke
// and what they said has to come from somewhere else.
export function uniqueSpeakers(cues: TranscriptCue[]): string[] {
  const seen: string[] = [];
  for (const cue of cues) {
    if (cue.speaker && !seen.includes(cue.speaker)) seen.push(cue.speaker);
  }
  return seen;
}

// mm:ss for a HH:MM:SS.mmm cue timestamp — this app's transcripts never
// run past an hour, and mm:ss reads better in a tight sidebar than the
// full WebVTT precision.
export function formatCueTime(timestamp: string): string {
  const [h, m, rest] = timestamp.split(":");
  const s = rest?.split(".")[0] ?? "00";
  const totalMinutes = Number(h) * 60 + Number(m);
  return `${String(totalMinutes).padStart(2, "0")}:${s}`;
}
