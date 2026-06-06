import fs from "fs";
import path from "path";

const outPath = path.join(process.cwd(), "eval-report-kashish-ai-persona.pdf");

function escapePdfText(text) {
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLines(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }

  if (current) lines.push(current);
  return lines;
}

function textBlock(x, y, lines, opts = {}) {
  const size = opts.size ?? 10;
  const leading = opts.leading ?? size + 3;
  const font = opts.font ?? "F1";
  const color = opts.color ?? "0 0 0";
  const out = [`BT`, `/${font} ${size} Tf`, `${color} rg`, `${x} ${y} Td`];
  lines.forEach((line, index) => {
    if (index > 0) out.push(`0 -${leading} Td`);
    out.push(`(${escapePdfText(line)}) Tj`);
  });
  out.push(`ET`);
  return out.join("\n");
}

function rect(x, y, w, h, stroke = "0 0 0", fill = null) {
  const parts = [`${stroke} RG`];
  if (fill) parts.push(`${fill} rg`);
  parts.push(`${x} ${y} ${w} ${h} re`);
  parts.push(fill ? `B` : `S`);
  return parts.join("\n");
}

function line(x1, y1, x2, y2, color = "0 0 0", width = 1) {
  return `${color} RG\n${width} w\n${x1} ${y1} m\n${x2} ${y2} l\nS`;
}

const title = "Kashish AI Persona - Evals Report";
const subtitle = "1-page evaluation summary for the Scaler AI Engineer Screening Assignment";
const dateLine = "Probe set: 12 live voice calls plus chat-grounding review on the current corpus";

const voiceMetrics = [
  ["Average first-response latency", "~1.15 s", "From Vapi dashboard"],
  ["Average cost", "~$0.10/min", "From Vapi dashboard"],
  ["Transcriber latency", "100 ms", "Dashboard component split"],
  ["Model latency", "700 ms", "Dashboard component split"],
  ["Voice latency", "250 ms", "Dashboard component split"],
  ["Usable transcript rate", "12/12 = 100%", "Manual proxy; no WER run"],
  ["Booking success", "6/12 = 50%", "Confirmed Cal.com bookings"],
];

const groundednessRows = [
  ["Grounded answer + booking success", "6", "50%"],
  ["Correct refusal / no answer", "6", "50%"],
  ["Hallucinated unsupported answer", "0", "0%"],
];

const failureModes = [
  [
    "Booking requests were initially answered as chat.",
    "The intent path let booking phrases continue through the LLM route.",
    "Short-circuit booking intents before chat send and open the booking panel only.",
  ],
  [
    "The welcome hero reappeared after chat started.",
    "The empty state was tied only to message count.",
    "Track a one-way chat-start flag so the UI stays in conversation mode.",
  ],
  [
    "Booking/availability responses could be malformed or empty.",
    "External API payloads were not normalized and error handling was thin.",
    "Normalize Cal.com responses and surface explicit errors in the UI.",
  ],
];

const twoWeekPlan = [
  "Improve the call assistant so it asks for availability more naturally and handles booking follow-ups with fewer turns.",
  "Improve voice understanding/interpretation for interruptions, accents, and off-script recruiter questions.",
  "Refine the UI polish and reduce clutter in the booking flow.",
];

const tradeoff =
  "I chose groundedness over coverage: when the corpus does not support an answer, the persona refuses rather than guessing. That keeps the assistant honest under adversarial probing, even though it reduces answer coverage on off-domain questions.";

let y = 760;
const content = [];

content.push(textBlock(36, y, [title], { size: 18, leading: 20, font: "F2" }));
y -= 24;
content.push(textBlock(36, y, [subtitle], { size: 9, color: "0.25 0.25 0.25" }));
y -= 16;
content.push(textBlock(36, y, [dateLine], { size: 9, color: "0.25 0.25 0.25" }));
y -= 20;

content.push(rect(34, y - 130, 544, 122, "0.85 0.85 0.85", "0.98 0.98 0.98"));
content.push(textBlock(44, y - 20, ["Voice quality"], { size: 12, leading: 14, font: "F2" }));
const voiceLines = [];
voiceMetrics.forEach(([label, value, note]) => {
  voiceLines.push(`${label}: ${value} (${note})`);
});
content.push(textBlock(44, y - 38, voiceLines.slice(0, 4), { size: 9, leading: 12 }));
content.push(textBlock(300, y - 38, voiceLines.slice(4), { size: 9, leading: 12 }));
y -= 144;

content.push(rect(34, y - 138, 544, 130, "0.85 0.85 0.85", "0.98 0.98 0.98"));
content.push(textBlock(44, y - 20, ["Chat groundedness"], { size: 12, leading: 14, font: "F2" }));
content.push(textBlock(44, y - 40, [
  "Probe matrix:",
  "Grounded answer + booking success: 6/12",
  "Correct refusal / no answer: 6/12",
  "Hallucinated unsupported answer: 0/12",
], { size: 9, leading: 12 }));
content.push(textBlock(278, y - 40, [
  "Metrics from the 12-call probe:",
  "Grounded precision: 100%",
  "Grounded recall / coverage: 50%",
  "Hallucination rate: 0%",
], { size: 9, leading: 12 }));

// small bar chart
content.push(rect(444, y - 110, 110, 72, "0.82 0.82 0.82", "1 1 1"));
content.push(textBlock(452, y - 46, ["Probe outcomes"], { size: 8, leading: 10 }));
content.push(rect(452, y - 80, 84, 10, "0.85 0.85 0.85", "0.95 0.95 0.95"));
content.push(rect(452, y - 80, 42, 10, "0.18 0.68 0.63", "0.18 0.68 0.63"));
content.push(textBlock(452, y - 94, ["Grounded 50%"], { size: 7, leading: 9, color: "0.2 0.2 0.2" }));
content.push(rect(452, y - 98, 84, 10, "0.85 0.85 0.85", "0.95 0.95 0.95"));
content.push(rect(452, y - 98, 0, 10, "0.95 0.53 0.12", "0.95 0.53 0.12"));
content.push(textBlock(452, y - 112, ["Hallucination 0%"], { size: 7, leading: 9, color: "0.2 0.2 0.2" }));
y -= 146;

content.push(rect(34, y - 150, 544, 142, "0.85 0.85 0.85", "0.98 0.98 0.98"));
content.push(textBlock(44, y - 20, ["3 failure modes, root cause, and fix"], { size: 12, leading: 14, font: "F2" }));
const fmLines = [];
failureModes.forEach((row, idx) => {
  fmLines.push(`${idx + 1}. ${row[0]}`);
  fmLines.push(`   Root cause: ${row[1]}`);
  fmLines.push(`   Fix: ${row[2]}`);
});
content.push(textBlock(44, y - 40, fmLines, { size: 8.3, leading: 10.5 }));
y -= 156;

content.push(rect(34, y - 86, 544, 78, "0.85 0.85 0.85", "0.98 0.98 0.98"));
content.push(textBlock(44, y - 20, ["Tradeoff"], { size: 12, leading: 14, font: "F2" }));
content.push(textBlock(44, y - 38, wrapLines(tradeoff, 104), { size: 8.6, leading: 10.5 }));

content.push(rect(34, y - 176, 544, 82, "0.85 0.85 0.85", "0.98 0.98 0.98"));
content.push(textBlock(44, y - 20, ["What I'd build with 2 more weeks"], { size: 12, leading: 14, font: "F2" }));
content.push(textBlock(44, y - 38, twoWeekPlan.flatMap((item, idx) => wrapLines(`${idx + 1}. ${item}`, 108)), { size: 8.6, leading: 10.5 }));

content.push(textBlock(372, 34, ["Note: transcription accuracy was not separately labeled with WER/CER in this pass; the report uses a practical usable-transcript proxy from the 12 live calls."], { size: 7.3, leading: 9, color: "0.3 0.3 0.3" }));

const stream = content.join("\n");
const objects = [];
objects.push(`<< /Type /Catalog /Pages 2 0 R >>`);
objects.push(`<< /Type /Pages /Kids [3 0 R] /Count 1 >>`);
objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>`);
objects.push(`<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`);
objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`);
objects.push(`<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>`);

let pdf = "%PDF-1.4\n";
const offsets = [0];
for (let i = 0; i < objects.length; i++) {
  offsets.push(Buffer.byteLength(pdf, "utf8"));
  pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
}
const xrefStart = Buffer.byteLength(pdf, "utf8");
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += `0000000000 65535 f \n`;
for (let i = 1; i < offsets.length; i++) {
  pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

fs.writeFileSync(outPath, pdf);
console.log(outPath);
