import {
  APPLICATION_STATUS_LABEL,
  JOB_STATUS_LABEL,
  ROLE_LABEL,
} from "@/lib/dashboard-constants";

const base = "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold";

const APP_STYLES = {
  NEW: "bg-sky-100 text-sky-900",
  REVIEWED: "bg-slate-100 text-slate-800",
  SHORTLISTED: "bg-violet-100 text-violet-900",
  INTERVIEW: "bg-amber-100 text-amber-900",
  REJECTED: "bg-red-100 text-red-900",
  HIRED: "bg-emerald-100 text-emerald-900",
};

const JOB_STYLES = {
  DRAFT: "bg-slate-100 text-slate-800",
  PUBLISHED: "bg-emerald-100 text-emerald-900",
  CLOSED: "bg-stone-200 text-stone-800",
};

export function ApplicationStatusBadge({ status }) {
  return <span className={`${base} ${APP_STYLES[status]}`}>{APPLICATION_STATUS_LABEL[status]}</span>;
}

export function JobStatusBadge({ status }) {
  return <span className={`${base} ${JOB_STYLES[status]}`}>{JOB_STATUS_LABEL[status]}</span>;
}

export function RoleBadge({ role }) {
  return (
    <span className={`${base} ${role === "ADMIN" ? "bg-teal-100 text-teal-900" : "bg-slate-100 text-slate-800"}`}>
      {ROLE_LABEL[role]}
    </span>
  );
}