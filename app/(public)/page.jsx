import { Hero } from "@/components/home/hero";
import { Pillars } from "@/components/home/pillars";
import { LatestJobs } from "@/components/home/latest-jobs";
import { Perks } from "@/components/home/perks";
import { CtaBanner } from "@/components/home/cta-banner";
import { getHomeData } from "@/lib/data/jobs";
import { siteConfig } from "@/lib/site";

export const metadata = {
  title: { absolute: `Careers at ${siteConfig.name}` },
  description: siteConfig.hero.text,
};

export default async function HomePage({ searchParams }) {
  const params = await searchParams;
  const team = typeof params?.team === "string" ? params.team : undefined;

  const { totalOpen, departments, jobs } = await getHomeData(team);

  return (
    <>
      <Hero openCount={totalOpen} teamCount={departments.length} />
      <Pillars />
      <LatestJobs
        jobs={jobs}
        departments={departments}
        activeTeam={team}
        totalOpen={totalOpen}
      />
      <Perks />
      <CtaBanner openCount={totalOpen} />
    </>
  );
}