import PageHeader from "@/components/dashboard/page-header";
import FormBuilder from "@/components/dashboard/form-builder";
import { DEFAULT_FIELDS } from "@/lib/forms/fields";

export const metadata = { title: "New form" };

export default function NewFormPage() {
  return (
    <>
      <PageHeader title="New form" description="Start from the standard fields, then add your own questions." />
      <FormBuilder form={{ name: "", description: "", isDefault: false, fields: DEFAULT_FIELDS }} />
    </>
  );
}