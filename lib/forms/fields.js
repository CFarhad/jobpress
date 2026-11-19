export const FIELD_TYPE_LABEL = {
  text: "Short text",
  textarea: "Long text",
  number: "Number",
  date: "Date",
  url: "Link (URL)",
  email: "Email",
  phone: "Phone",
  select: "Dropdown",
  radio: "Single choice",
  checkboxes: "Multiple choice",
  checkbox: "Yes / No checkbox",
};

export const CHOICE_TYPES = ["select", "radio", "checkboxes"];

/** Standard fields. Each maps to a column on Application. */
export const CORE_FIELDS = {
  fullName: { label: "Full name", type: "text", locked: true, min: 2, max: 100 },
  email: { label: "Email address", type: "email", locked: true },
  phone: { label: "Phone number", type: "phone" },
  country: { label: "Country", type: "text", max: 80 },
  city: { label: "City", type: "text", max: 80 },
  linkedinUrl: { label: "LinkedIn profile", type: "url" },
  portfolioUrl: { label: "Portfolio / website", type: "url" },
  coverLetter: { label: "Cover letter", type: "textarea", max: 5000 },
};

export function coreFieldDefinition(key, overrides = {}) {
  const core = CORE_FIELDS[key];
  return {
    key,
    label: core.label,
    type: core.type,
    required: !!core.locked,
    placeholder: "",
    helpText: "",
    options: [],
    ...overrides,
  };
}

export const DEFAULT_FIELDS = [
  coreFieldDefinition("fullName"),
  coreFieldDefinition("email"),
  coreFieldDefinition("phone", { required: true }),
  coreFieldDefinition("country", { required: true }),
  coreFieldDefinition("city", { required: true }),
  coreFieldDefinition("linkedinUrl", { placeholder: "https://linkedin.com/in/your-name" }),
  coreFieldDefinition("portfolioUrl", { placeholder: "https://" }),
  coreFieldDefinition("coverLetter", { helpText: "Optional. Tell us why you'd be a great fit." }),
];

/** Defensive read of the JSON stored in the database. */
export function normalizeFields(raw) {
  if (!Array.isArray(raw)) return DEFAULT_FIELDS;

  const fields = raw
    .filter((f) => f && typeof f.key === "string" && typeof f.label === "string" && FIELD_TYPE_LABEL[f.type])
    .map((f) => ({
      key: f.key,
      label: f.label,
      type: CORE_FIELDS[f.key]?.type ?? f.type,
      required: !!f.required || !!CORE_FIELDS[f.key]?.locked,
      placeholder: typeof f.placeholder === "string" ? f.placeholder : "",
      helpText: typeof f.helpText === "string" ? f.helpText : "",
      options: Array.isArray(f.options) ? f.options.map(String) : [],
    }));

  for (const key of ["email", "fullName"]) {
    if (!fields.some((f) => f.key === key)) fields.unshift(coreFieldDefinition(key));
  }
  return fields;
}

export function formatAnswer(value) {
  if (Array.isArray(value)) return value.join(", ");
  if (value === true) return "Yes";
  if (value === false) return "No";
  return String(value ?? "");
}