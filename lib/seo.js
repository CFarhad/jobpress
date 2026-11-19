import { cleanHtml } from "@/lib/sanitize";
import { siteConfig } from "@/lib/site";

const EMPLOYMENT_TYPE = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACTOR",
  INTERNSHIP: "INTERN",
};

// Google Jobs structured data
export function buildJobPostingJsonLd(job, url) {
  const description = cleanHtml(
    `${job.description}<h3>Responsibilities</h3>${job.responsibilities}<h3>Requirements</h3>${job.requirements}${
      job.benefits ? `<h3>Benefits</h3>${job.benefits}` : ""
    }`
  );

  const data = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title: job.title,
    description,
    datePosted: (job.publishedAt ?? job.createdAt).toISOString(),
    employmentType: EMPLOYMENT_TYPE[job.type],
    directApply: true,
    url,
    hiringOrganization: {
      "@type": "Organization",
      name: siteConfig.legalName,
      sameAs: siteConfig.url,
    },
  };

  if (job.deadline) data.validThrough = job.deadline.toISOString();

  if (job.workplace === "REMOTE") {
    data.jobLocationType = "TELECOMMUTE";
    data.applicantLocationRequirements = {
      "@type": "Country",
      name: siteConfig.countryCode,
    };
  } else {
    data.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: job.location,
        addressCountry: siteConfig.countryCode,
      },
    };
  }

  if (job.salaryMin != null || job.salaryMax != null) {
    data.baseSalary = {
      "@type": "MonetaryAmount",
      currency: job.salaryCurrency,
      value: {
        "@type": "QuantitativeValue",
        ...(job.salaryMin != null && { minValue: job.salaryMin }),
        ...(job.salaryMax != null && { maxValue: job.salaryMax }),
        unitText: "MONTH", // assumes monthly salaries; change to YEAR if needed
      },
    };
  }

  return data;
}