import { useReviewSessionContext } from "../providers/ReviewSessionProvider";

export const useReviewSession = () => {
  return useReviewSessionContext();
};
