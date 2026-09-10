export interface TranscriptCue {
  start: string;
  end: string;
  speaker: string | null;
  text: string;
}

const TIMESTAMP_LINE = /^(\d{2}:\d{2}:\d{2}\.\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}\.\d{3})/;
const SPEAKER_PREFIX = /^([^:]{1,40}):\s*(.*)$/;

// Deliberately tolerant, not a full spec parser: this only needs to handle
// the cue shape this app itself writes (WEBVTT header, optional numeric
// cue identifiers, a timestamp line, then "Speaker: text").
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

    const speakerMatch = textLines.match(SPEAKER_PREFIX);
    cues.push({
      start: match[1],
      end: match[2],
      speaker: speakerMatch ? speakerMatch[1].trim() : null,
      text: speakerMatch ? speakerMatch[2].trim() : textLines,
    });
  }

  return cues;
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
