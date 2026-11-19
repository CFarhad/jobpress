import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getOpenJobsCount } from "@/lib/data/jobs";



export default async function PublicLayout({ children }) {
  const openCount = await getOpenJobsCount();

  return (
    <>
      <Navbar openCount={openCount} />
      <main className="pt-20">{children}</main>
      <Footer />
    </>
  );
}