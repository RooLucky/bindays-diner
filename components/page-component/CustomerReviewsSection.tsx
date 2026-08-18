import { getPublicReviewsPayload } from "@/lib/reviews";

import { CustomerReviewsClient } from "./CustomerReviewsClient";

function createCaptcha() {
  const left = Math.floor(Math.random() * 8) + 2;
  const right = Math.floor(Math.random() * 7) + 1;

  return {
    question: `${left} + ${right}`,
    answer: left + right,
  };
}

export async function CustomerReviewsSection() {
  const payload = await getPublicReviewsPayload();
  const initialCaptcha = createCaptcha();

  return (
    <CustomerReviewsClient
      initialPayload={payload}
      initialCaptcha={initialCaptcha}
    />
  );
}
