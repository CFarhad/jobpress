import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms of Service"
      updated="January 2025"
      sections={[
        {
          heading: "Using this site",
          body: `This website is provided by ${siteConfig.legalName} so candidates can learn about and apply for open positions. By using it you agree to provide accurate information.`,
        },
        {
          heading: "Job postings",
          body: "Posting a role does not guarantee an interview or an offer. We may change or close a position at any time.",
        },
        {
          heading: "Your applications",
          body: "You confirm that the information and documents you submit are yours and are truthful. False information may disqualify your application.",
        },
        {
          heading: "Contact",
          body: `Questions about these terms can be sent to ${siteConfig.email}.`,
        },
      ]}
    />
  );
}