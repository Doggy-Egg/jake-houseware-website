import fs from "fs";
import path from "path";
import type { InquirySubmission } from "@/types/inquiry";

const DATA_DIR = path.join(process.cwd(), "data");
const INQUIRIES_FILE = path.join(DATA_DIR, "inquiries.json");

export type StoredInquiry = InquirySubmission & {
  id: string;
  submittedAt: string;
};

function ensureInquiriesFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(INQUIRIES_FILE)) {
    fs.writeFileSync(INQUIRIES_FILE, JSON.stringify([], null, 2));
  }
}

export function readInquiries(): StoredInquiry[] {
  ensureInquiriesFile();
  const raw = fs.readFileSync(INQUIRIES_FILE, "utf-8");
  const parsed = JSON.parse(raw) as StoredInquiry[];
  return Array.isArray(parsed) ? parsed : [];
}

export function saveInquiry(submission: InquirySubmission): StoredInquiry {
  const inquiries = readInquiries();
  const record: StoredInquiry = {
    ...submission,
    id: `inq-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    submittedAt: new Date().toISOString(),
  };
  writeInquiries([record, ...inquiries]);
  return record;
}

function writeInquiries(inquiries: StoredInquiry[]) {
  ensureInquiriesFile();
  fs.writeFileSync(INQUIRIES_FILE, JSON.stringify(inquiries, null, 2));
}
