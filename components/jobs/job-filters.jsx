import Link from "next/link";
import { Search } from "lucide-react";
import {
  JOB_TYPE_LABEL,
  WORKPLACE_LABEL,
  EXPERIENCE_LABEL,
  SORT_LABEL,
} from "@/lib/format";

const toOptions = (labels) =>
  Object.entries(labels).map(([value, label]) => ({ value, label }));

function Select({ id, label, value, options, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-label-md text-on-surface-variant">
        {label}
      </label>
      <select
        id={id}
        name={id}
        defaultValue={value}
        className="field-control px-3 text-body-md"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function JobFilters({ filters, options, hasFilters }) {
  // Changing the key remounts the form so "Clear" really resets the fields
  const formKey = Object.values(filters).join("|");

  return (
    <form
      key={formKey}
      action="/jobs"
      method="get"
      role="search"
      className="surface-card flex flex-col gap-5 p-5 md:p-6"
    >
      <div className="relative">
        <label htmlFor="q" className="sr-only">
          Search roles
        </label>
        <Search
          className="pointer-events-none absolute left-3.5 top-1/2 size-5 -translate-y-1/2 text-outline"
          aria-hidden
        />
        <input
          id="q"
          name="q"
          type="search"
          defaultValue={filters.q}
          placeholder="Search by title, team, or location..."
          className="field-control pl-11 pr-4 text-body-md"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Select
          id="department"
          label="Team"
          value={filters.department}
          placeholder="All teams"
          options={options.departments.map((d) => ({
            value: d.slug,
            label: d.name,
          }))}
        />
        <Select
          id="location"
          label="Location"
          value={filters.location}
          placeholder="All locations"
          options={options.locations.map((l) => ({ value: l, label: l }))}
        />
        <Select
          id="type"
          label="Job type"
          value={filters.type}
          placeholder="All types"
          options={toOptions(JOB_TYPE_LABEL)}
        />
        <Select
          id="workplace"
          label="Workplace"
          value={filters.workplace}
          placeholder="Any workplace"
          options={toOptions(WORKPLACE_LABEL)}
        />
        <Select
          id="experience"
          label="Experience"
          value={filters.experience}
          placeholder="Any level"
          options={toOptions(EXPERIENCE_LABEL)}
        />
        <Select
          id="sort"
          label="Sort by"
          value={filters.sort}
          options={toOptions(SORT_LABEL)}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn btn-primary">
          Apply filters
        </button>
        {hasFilters && (
          <Link href="/jobs" className="btn btn-ghost">
            Clear all
          </Link>
        )}
      </div>
    </form>
  );
}