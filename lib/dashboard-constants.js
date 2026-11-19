export const APPLICATION_STATUSES = ["NEW", "REVIEWED", "SHORTLISTED", "INTERVIEW", "REJECTED", "HIRED"];

export const APPLICATION_STATUS_LABEL = {
  NEW: "New",
  REVIEWED: "Reviewed",
  SHORTLISTED: "Shortlisted",
  INTERVIEW: "Interview",
  REJECTED: "Rejected",
  HIRED: "Hired",
};

export const JOB_STATUSES = ["DRAFT", "PUBLISHED", "CLOSED"];

export const JOB_STATUS_LABEL = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
};

export const ROLES = ["ADMIN", "HR"];

export const ROLE_LABEL = { ADMIN: "Admin", HR: "HR" };

export function formatDateTime(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(new Date(value)) + " UTC";
}

export function formatDay(value) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(new Date(value));
}