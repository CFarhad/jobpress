export const JOB_TYPE_LABEL = {
  FULL_TIME: "Full-time",
  PART_TIME: "Part-time",
  CONTRACT: "Contract",
  INTERNSHIP: "Internship",
};

export const WORKPLACE_LABEL = {
  ONSITE: "On-site",
  HYBRID: "Hybrid",
  REMOTE: "Remote",
};

export const EXPERIENCE_LABEL = {
  ENTRY: "Entry level",
  MID: "Mid level",
  SENIOR: "Senior",
  LEAD: "Lead",
};

export function formatSalary(min, max, currency = "USD") {
  if (min == null && max == null) return null;

  let formatter;
  try {
    formatter = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    });
  } catch {
    formatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
  }

  if (min != null && max != null) {
    return `${formatter.format(min)} – ${formatter.format(max)}`;
  }
  if (min != null) return `From ${formatter.format(min)}`;
  return `Up to ${formatter.format(max)}`;
}

export const SORT_LABEL = {
  newest: "Newest first",
  oldest: "Oldest first",
  salary: "Highest salary",
};

export function formatDate(date) {
  if (!date) return null;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(date));
}