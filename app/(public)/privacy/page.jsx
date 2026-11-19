import { LegalPage } from "@/components/shared/legal-page";
import { siteConfig } from "@/lib/site";

export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalPage
      title="Privacy Policy"
      updated="January 2025"
      sections={[
        {
          heading: "What we collect",
          body: "When you apply for a role we collect your name, email, phone number, location, CV, and any optional information you provide, such as a cover letter or profile links.",
        },
        {
          heading: "How we use it",
          body: `${siteConfig.legalName} uses this information only to evaluate your application, contact you about the role, and manage our recruitment process.`,
        },
        {
          heading: "Who can see it",
          body: "Only authorized members of our hiring team can access your application. We do not sell your data.",
        },
        {
          heading: "How long we keep it",
          body: "We keep applications for 12 months after the role is filled, then delete them unless you ask us to keep your profile for future roles.",
        },
        {
          heading: "Your rights",
          body: `You can ask to access, correct, or delete your data at any time by emailing ${siteConfig.email}.`,
        },
      ]}
    />
  );
}