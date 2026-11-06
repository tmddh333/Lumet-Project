import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { ReviewDraft } from "../domain/review";
import {
  consentKey,
  emptyProgress,
  parseProgress,
  progressKey,
  type Progress,
} from "../domain/progress";
import { readPreference } from "../lib/storage";

function useLearningState() {
  const [initial] = useState(() => {
    const enabled = readPreference(consentKey) === "true";
    return {
      enabled,
      progress: enabled
        ? parseProgress(readPreference(progressKey))
        : emptyProgress(),
    };
  });
  const [progress, setProgress] = useState(initial.progress);
  const [enabled, setEnabled] = useState(initial.enabled);
  const [storageError, setStorageError] = useState(false);
  const [attempts, setAttempts] = useState<Record<string, ReviewDraft>>({});
  const current = useRef(initial.progress);
  const saving = useRef(initial.enabled);

  const update = useCallback((transform: (previous: Progress) => Progress) => {
    const next = transform(current.current);
    if (next === current.current) return;
    current.current = next;
    setProgress(next);
    if (saving.current) {
      try {
        localStorage.setItem(progressKey, JSON.stringify(next));
        setStorageError(false);
      } catch {
        setStorageError(true);
      }
    }
  }, []);
  const visit = useCallback(
    (id: string, page: "trace" | "review") =>
      update((previous) => {
        if (previous.last?.id === id && previous.last.page === page)
          return previous;
        return { ...previous, last: { id, page } };
      }),
    [update],
  );
  const recordStep = useCallback(
    (id: string, step: number) =>
      update((previous) => {
        const entry = previous.lessons[id] ?? {
          step: 0,
          reviewed: false,
          needsPractice: false,
        };
        if (previous.lessons[id] && entry.step === step) return previous;
        return {
          ...previous,
          lessons: { ...previous.lessons, [id]: { ...entry, step } },
        };
      }),
    [update],
  );
  const recordReview = useCallback(
    (id: string, needsPractice: boolean) =>
      update((previous) => ({
        ...previous,
        lessons: {
          ...previous.lessons,
          [id]: {
            step: previous.lessons[id]?.step ?? 0,
            reviewed: true,
            needsPractice,
          },
        },
      })),
    [update],
  );
  const submitReview = useCallback(
    (id: string, draft: ReviewDraft, needsPractice: boolean) => {
      setAttempts((previous) => ({ ...previous, [id]: { ...draft } }));
      recordReview(id, needsPractice);
    },
    [recordReview],
  );
  function chooseSaving(next: boolean) {
    saving.current = next;
    setEnabled(next);
    try {
      if (next) {
        localStorage.setItem(progressKey, JSON.stringify(current.current));
        localStorage.setItem(consentKey, "true");
      } else {
        localStorage.removeItem(consentKey);
        localStorage.removeItem(progressKey);
      }
      setStorageError(false);
    } catch {
      setStorageError(true);
    }
  }
  function clearProgress() {
    setAttempts({});
    update(() => emptyProgress());
  }
  return {
    progress,
    attempts,
    enabled,
    storageError,
    visit,
    recordStep,
    recordReview,
    submitReview,
    chooseSaving,
    clearProgress,
  };
}
const LearningContext = createContext<ReturnType<
  typeof useLearningState
> | null>(null);
export function LearningProvider({ children }: { children: ReactNode }) {
  const learning = useLearningState();
  return (
    <LearningContext.Provider value={learning}>
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const value = useContext(LearningContext);
  if (!value) throw new Error("LearningProvider is required");
  return value;
}
