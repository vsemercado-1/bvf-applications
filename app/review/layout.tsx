import { currentReviewer } from "@/lib/session";
import { ReviewNav } from "@/components/review/ReviewNav";

export default async function ReviewLayout({ children }: { children: React.ReactNode }) {
  const reviewer = await currentReviewer();
  // The login page renders inside this layout too; show chrome only when signed in.
  if (!reviewer) return <>{children}</>;
  return (
    <>
      <ReviewNav reviewer={reviewer} />
      <main className="wrap rv-main">{children}</main>
    </>
  );
}
