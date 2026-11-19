const {
  PrismaClient,
  Role,
  JobType,
  WorkplaceType,
  ExperienceLevel,
  JobStatus,
} = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const ul = (items) => `<ul>${items.map((i) => `<li>${i}</li>`).join("")}</ul>`;

const commonBenefits = ul([
  "Competitive salary and annual performance bonus",
  "Private health insurance",
  "Flexible working hours and remote days",
  "Learning budget for courses and conferences",
  "25 days of paid annual leave",
]);

const departments = [
  { name: "Engineering", slug: "engineering" },
  { name: "Design", slug: "design" },
  { name: "Marketing", slug: "marketing" },
  { name: "Human Resources", slug: "human-resources" },
  { name: "Sales", slug: "sales" },
  { name: "Operations", slug: "operations" },
];

const jobs = [
  {
    title: "Senior Frontend Engineer",
    slug: "senior-frontend-engineer",
    department: "engineering",
    summary: "Build fast, accessible interfaces used by thousands of people every day.",
    location: "Riyadh",
    type: JobType.FULL_TIME,
    workplace: WorkplaceType.HYBRID,
    experience: ExperienceLevel.SENIOR,
    salaryMin: 5000,
    salaryMax: 8000,
    featured: true,
    responsibilities: [
      "Design and build features with React and Next.js",
      "Review code and mentor junior engineers",
      "Improve performance and accessibility across our products",
    ],
    requirements: [
      "5+ years of professional frontend experience",
      "Strong knowledge of React, Next.js, and modern JavaScript",
      "Experience with testing and CI/CD",
    ],
  },
  {
    title: "Backend Engineer (Node.js)",
    slug: "backend-engineer-nodejs",
    department: "engineering",
    summary: "Design reliable APIs and data pipelines that power our platform.",
    location: "Remote",
    type: JobType.FULL_TIME,
    workplace: WorkplaceType.REMOTE,
    experience: ExperienceLevel.MID,
    salaryMin: 4000,
    salaryMax: 6500,
    featured: true,
    responsibilities: [
      "Build and maintain REST APIs with Node.js and PostgreSQL",
      "Optimize queries and database schemas",
      "Write automated tests and clear documentation",
    ],
    requirements: [
      "3+ years of backend development",
      "Solid SQL and PostgreSQL knowledge",
      "Understanding of authentication and API security",
    ],
  },
  {
    title: "Product Designer",
    slug: "product-designer",
    department: "design",
    summary: "Shape intuitive experiences from research through to final UI.",
    location: "Jeddah",
    type: JobType.FULL_TIME,
    workplace: WorkplaceType.ONSITE,
    experience: ExperienceLevel.MID,
    salaryMin: 3500,
    salaryMax: 5500,
    featured: true,
    responsibilities: [
      "Create wireframes, prototypes, and high-fidelity designs",
      "Run user research and usability testing",
      "Maintain and grow our design system",
    ],
    requirements: [
      "3+ years in product or UX design",
      "Proficiency in Figma",
      "A portfolio showing end-to-end design work",
    ],
  },
  {
    title: "Digital Marketing Specialist",
    slug: "digital-marketing-specialist",
    department: "marketing",
    summary: "Grow our brand and candidate pipeline through data-driven campaigns.",
    location: "Riyadh",
    type: JobType.FULL_TIME,
    workplace: WorkplaceType.HYBRID,
    experience: ExperienceLevel.MID,
    salaryMin: 3000,
    salaryMax: 4800,
    featured: false,
    responsibilities: [
      "Plan and run paid, SEO, and social campaigns",
      "Track performance and report on key metrics",
      "Collaborate with design on creative assets",
    ],
    requirements: [
      "2+ years in digital marketing",
      "Experience with Google Ads and analytics tools",
      "Strong written communication",
    ],
  },
  {
    title: "HR Coordinator",
    slug: "hr-coordinator",
    department: "human-resources",
    summary: "Support hiring, onboarding, and employee experience across the company.",
    location: "Dammam",
    type: JobType.CONTRACT,
    workplace: WorkplaceType.ONSITE,
    experience: ExperienceLevel.ENTRY,
    salaryMin: 2500,
    salaryMax: 3500,
    featured: false,
    responsibilities: [
      "Schedule interviews and coordinate with candidates",
      "Prepare onboarding materials and contracts",
      "Maintain accurate employee records",
    ],
    requirements: [
      "1+ year in HR or administration",
      "Excellent organization and communication",
      "Familiarity with HR software is a plus",
    ],
  },
  {
    title: "Operations Intern",
    slug: "operations-intern",
    department: "operations",
    summary: "Learn how a growing company runs while contributing to real projects.",
    location: "Riyadh",
    type: JobType.INTERNSHIP,
    workplace: WorkplaceType.ONSITE,
    experience: ExperienceLevel.ENTRY,
    salaryMin: null,
    salaryMax: null,
    featured: false,
    responsibilities: [
      "Assist with daily operations and reporting",
      "Support process improvement projects",
      "Prepare documents and presentations",
    ],
    requirements: [
      "Currently studying or recently graduated",
      "Strong attention to detail",
      "Eagerness to learn",
    ],
  },
];

async function main() {
  // 1. Departments
  for (const d of departments) {
    await prisma.department.upsert({
      where: { slug: d.slug },
      update: {},
      create: d,
    });
  }

  // 2. Admin user
  const email = process.env.ADMIN_EMAIL || "admin@company.com";
  const password = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name: "Admin", email, passwordHash, role: Role.ADMIN },
  });

  // 3. Jobs
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  for (const [index, j] of jobs.entries()) {
    const department = await prisma.department.findUniqueOrThrow({
      where: { slug: j.department },
    });

    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - index * 2);

    await prisma.job.upsert({
      where: { slug: j.slug },
      update: {},
      create: {
        title: j.title,
        slug: j.slug,
        summary: j.summary,
        description: `<p>${j.summary} Join a collaborative team that values ownership, learning, and impact.</p>`,
        responsibilities: ul(j.responsibilities),
        requirements: ul(j.requirements),
        benefits: commonBenefits,
        location: j.location,
        type: j.type,
        workplace: j.workplace,
        experience: j.experience,
        salaryMin: j.salaryMin,
        salaryMax: j.salaryMax,
        featured: j.featured,
        status: JobStatus.PUBLISHED,
        publishedAt,
        deadline,
        departmentId: department.id,
        createdById: admin.id,
      },
    });
  }

  console.log("Seed complete.");
  console.log(`Admin login: ${email} / ${password}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });