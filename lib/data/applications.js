import { APPLICATION_STATUSES } from "@/lib/dashboard-constants";

export const APPLICATIONS_PAGE_SIZE = 15;

export function parseApplicationFilters(sp = {}) {
  const get = (key) => (Array.isArray(sp[key]) ? sp[key][0] : sp[key]);
  const q = String(get("q") ?? "").trim().slice(0, 100);
  const status = APPLICATION_STATUSES.includes(get("status")) ? get("status") : "";
  const jobId = String(get("jobId") ?? "").trim().slice(0, 40);
  const page = Math.max(1, parseInt(get("page")) || 1);
  return { q, status, jobId, page };
}

export function buildApplicationWhere({ q, status, jobId }) {
  return {
    ...(status && { status }),
    ...(jobId && { jobId }),
    ...(q && {
      OR: [
        { fullName: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    }),
  };
}