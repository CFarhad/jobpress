export const siteConfig = {
  name: "Verve",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  countryCode: "SA",
  tagline: "Careers",
  legalName: "Verve Technologies Inc.",
  description:
    "Building deliberate, authentic technology for high-agency teams. We empower individuals to do their lifetime-defining work in an environment of calm architectural velocity.",
  email: "founders@verve.internal",
  regionNote: "Distributed Across Americas & EMEA",
  offices: [
    { city: "San Francisco", address: "540 Howard St, SOMA" },
    { city: "London", address: "Shoreditch Exchange" },
    { city: "Remote Global", address: "Async first in 14 countries" },
  ],
  hero: {
    badge: "Series B Funded • Expanding Globally",
    titleBefore: "Build the future of distributed systems at",
    text: "We are engineering the high-throughput coordination layer for next-generation intelligence. Autonomous squads, zero micro-management, and uncompromised architectural craft.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDhpcwGY0528cVpsz8EJF0gFR9jTezS9vY4Gg3O1borbMPajHIfJxvss5l8WFc86-TGK_SVNpaztOprM3J5skwAzUnDij9Xr8eGiPuuWKWbtY1TKCC9jbyo5DJ1X0bRQdCiOk6BqNHfBNVz7B2NhKB8B_mNmn-H6OINc372ZSndmeKoLHjx12fi3hZJ4Xj1kybr2N3z-lty3Hx-MmqI_wJ2leikrvD_HkhVowoqEDLJ",
    imageAlt:
      "A diverse team of engineers collaborating around a table in a sunlit studio",
    stats: [
      { value: "100%", label: "Distributed by Design" },
      { value: "Top 1%", label: "Tier Equity Pools" },
      { value: "98.4%", label: "Annual Retention" },
    ],
  },
};