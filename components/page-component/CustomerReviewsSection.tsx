import { getPublicReviewsPayload } from "@/lib/reviews";
import { CustomerReviewsClient } from "./CustomerReviewsClient";

export async function CustomerReviewsSection() {
  const payload = await getPublicReviewsPayload();
  return <CustomerReviewsClient initialPayload={payload} />;
}
