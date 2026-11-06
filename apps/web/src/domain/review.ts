import type { PullRequestReview, ReviewCategory } from "./scenario";

export const reviewCategories: { id: ReviewCategory; label: string }[] = [
  { id: "logic", label: "조건·결과의 정확성" },
  { id: "state", label: "공유 상태·부작용" },
  { id: "async", label: "비동기 처리 순서" },
  { id: "exception", label: "예외·API 사용 조건" },
  { id: "performance", label: "성능·불필요한 작업" },
  { id: "other", label: "다른 관점" },
];

export interface ReviewDraft {
  line: number | null;
  category: ReviewCategory | "";
  condition: string;
  impact: string;
  testIdea: string;
}
export const emptyReview: ReviewDraft = {
  line: null,
  category: "",
  condition: "",
  impact: "",
  testIdea: "",
};

export function canSubmitReview(draft: ReviewDraft, lines: number): boolean {
  return (
    draft.line !== null &&
    Number.isInteger(draft.line) &&
    draft.line >= 1 &&
    draft.line <= lines &&
    reviewCategories.some((item) => item.id === draft.category) &&
    draft.condition.trim().length > 0 &&
    draft.impact.trim().length > 0
  );
}

// This is a comparison of two structured selections, NOT a grade of free text.
export function compareReview(draft: ReviewDraft, review: PullRequestReview) {
  return {
    lineMatches:
      draft.line !== null && review.finding.lines.includes(draft.line),
    categoryMatches: draft.category === review.finding.category,
  };
}
