export type CustomerReviewStatus = "draft" | "approved" | "rejected";

export type WebsiteReview = {
  id: string;
  fullName: string;
  rating: number;
  comment: string;
  favoriteItem: string | null;
  status: CustomerReviewStatus;
  imageUrls: string[];
  createdAt: string;
  updatedAt: string;
};

export type GoogleReviewSnippet = {
  authorName: string;
  rating: number;
  text: string;
  relativeTime: string | null;
};

export type GoogleReviewSummary = {
  rating: string | null;
  userRatingCount: number | null;
  googleMapsUrl: string;
  reviews: GoogleReviewSnippet[];
  isConfigured: boolean;
};

export type PublicReviewsPayload = {
  google: GoogleReviewSummary;
  reviews: WebsiteReview[];
  websiteRating: {
    average: string | null;
    count: number;
  };
};
