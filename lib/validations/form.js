import { z } from "zod";
import { CHOICE_TYPES, CORE_FIELDS, FIELD_TYPE_LABEL } from "@/lib/forms/fields";

const CUSTOM_KEY = /^q_[a-z0-9]{4,20}$/;

const fieldSchema = z
  .object({
    key: z.string().max(40),
    label: z.string().trim().min(1, "Label is required").max(120, "Max 120 characters"),
    type: z.enum(Object.keys(FIELD_TYPE_LABEL)),
    required: z.boolean(),
    placeholder: z.string().trim().max(120).default(""),
    helpText: z.string().trim().max(300).default(""),
    options: z.array(z.string().trim().min(1).max(100)).max(30).default([]),
  })
  .superRefine((f, ctx) => {
    const core = CORE_FIELDS[f.key];
    if (!core && !CUSTOM_KEY.test(f.key)) {
      ctx.addIssue({ code: "custom", path: ["key"], message: "Invalid field key" });
    }
    if (core && core.type !== f.type) {
      ctx.addIssue({ code: "custom", path: ["type"], message: "Standard fields can't change type" });
    }
    if (CHOICE_TYPES.includes(f.type)) {
      if (f.options.length < 2) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Add at least 2 options" });
      } else if (new Set(f.options.map((o) => o.toLowerCase())).size !== f.options.length) {
        ctx.addIssue({ code: "custom", path: ["options"], message: "Options must be unique" });
      }
    }
  });

export const formSchema = z
  .object({
    id: z.string().optional(),
    name: z.string().trim().min(2, "Name is too short").max(80),
    description: z.string().trim().max(500, "Max 500 characters").default(""),
    isDefault: z.boolean(),
    fields: z.array(fieldSchema).max(40, "A form can have at most 40 fields"),
  })
  .superRefine((v, ctx) => {
    const keys = v.fields.map((f) => f.key);
    if (new Set(keys).size !== keys.length) {
      ctx.addIssue({ code: "custom", path: ["fields"], message: "Duplicate fields found" });
    }
    for (const locked of ["fullName", "email"]) {
      if (!keys.includes(locked)) {
        ctx.addIssue({ code: "custom", path: ["fields"], message: "Full name and Email fields are required" });
        break;
      }
    }
    v.fields.forEach((f, i) => {
      if (CORE_FIELDS[f.key]?.locked && !f.required) {
        ctx.addIssue({ code: "custom", path: ["fields", i, "required"], message: "This field must be required" });
      }
    });
  });