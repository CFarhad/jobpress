import { cache } from "react";
import { prisma } from "@/lib/prisma";
import {
  JOB_TYPE_LABEL,
  WORKPLACE_LABEL,
  EXPERIENCE_LABEL,
  SORT_LABEL,
} from "@/lib/format";

export const PAGE_SIZE = 8;

// "Open" = published and the deadline has not passed
export function openJobsWhere() {
  return {
    status: "PUBLISHED",
    OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
  };
}

const JOB_CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  summary: true,
  location: true,
  type: true,
  workplace: true,
  salaryMin: true,
  salaryMax: true,
  salaryCurrency: true,
  department: { select: { name: true, slug: true } },
};

export const getOpenJobsCount = cache(async () => {
  return prisma.job.count({ where: openJobsWhere() });
});

/* ---------------- Home ---------------- */

export async function getHomeData(teamSlug) {
  const where = openJobsWhere();

  const [totalOpen, departments, jobs] = await Promise.all([
    getOpenJobsCount(),
    prisma.department.findMany({
      where: { jobs: { some: where } },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { jobs: { where } } },
      },
      orderBy: { name: "asc" },
    }),
    prisma.job.findMany({
      where: {
        ...where,
        ...(teamSlug ? { department: { slug: teamSlug } } : {}),
      },
      orderBy: [{ featured: "desc" }, { publishedAt: "desc" }],
      take: 6,
      select: JOB_CARD_SELECT,
    }),
  ]);

  return { totalOpen, departments, jobs };
}

/* ---------------- Jobs listing ---------------- */

// Validates URL params. Invalid enum values would make Prisma throw, so they are dropped.
export function parseJobFilters(params = {}) {
  const str = (v) => (typeof v === "string" ? v.trim().slice(0, 100) : "");
  const oneOf = (v, allowed) => (allowed.includes(v) ? v : "");
  const page = Number.parseInt(str(params.page), 10);

  return {
    q: str(params.q),
    department: str(params.department),
    location: str(params.location),
    type: oneOf(str(params.type), Object.keys(JOB_TYPE_LABEL)),
    workplace: oneOf(str(params.workplace), Object.keys(WORKPLACE_LABEL)),
    experience: oneOf(str(params.experience), Object.keys(EXPERIENCE_LABEL)),
    sort: oneOf(str(params.sort), Object.keys(SORT_LABEL)) || "newest",
    page: Number.isFinite(page) && page > 0 ? page : 1,
  };
}

const ORDER_BY = {
  newest: [{ publishedAt: { sort: "desc", nulls: "last" } }],
  oldest: [{ publishedAt: { sort: "asc", nulls: "last" } }],
  salary: [
    { salaryMax: { sort: "desc", nulls: "last" } },
    { publishedAt: { sort: "desc", nulls: "last" } },
  ],
};

export async function getJobs(filters) {
  const { q, department, location, type, workplace, experience, sort } =
    filters;

  const and = [openJobsWhere()];

  if (q) {
    const contains = { contains: q, mode: "insensitive" };
    and.push({
      OR: [
        { title: contains },
        { summary: contains },
        { location: contains },
        { department: { name: contains } },
      ],
    });
  }
  if (department) and.push({ department: { slug: department } });
  if (location) and.push({ location });
  if (type) and.push({ type });
  if (workplace) and.push({ workplace });
  if (experience) and.push({ experience });

  const where = { AND: and };

  const total = await prisma.job.count({ where });
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(filters.page, totalPages);

  const jobs = await prisma.job.findMany({
    where,
    orderBy: ORDER_BY[sort] ?? ORDER_BY.newest,
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: JOB_CARD_SELECT,
  });

  return { jobs, total, totalPages, page };
}

export async function getFilterOptions() {
  const where = openJobsWhere();

  const [departments, locations] = await Promise.all([
    prisma.department.findMany({
      where: { jobs: { some: where } },
      select: { name: true, slug: true },
      orderBy: { name: "asc" },
    }),
    prisma.job.findMany({
      where,
      distinct: ["location"],
      select: { location: true },
      orderBy: { location: "asc" },
    }),
  ]);

  return { departments, locations: locations.map((l) => l.location) };
}

/* ---------------- Job detail ---------------- */

// cache() lets generateMetadata and the page share one query
export const getJobBySlug = cache(async (slug) => {
  return prisma.job.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { department: true },
  });
});

export async function getSimilarJobs(job, take = 3) {
  return prisma.job.findMany({
    where: {
      AND: [
        openJobsWhere(),
        { id: { not: job.id } },
        { departmentId: job.departmentId },
      ],
    },
    orderBy: { publishedAt: "desc" },
    take,
    select: JOB_CARD_SELECT,
  });
}