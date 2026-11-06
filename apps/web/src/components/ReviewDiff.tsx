import { createDiff } from "../domain/diff";

export function ReviewDiff({
  before,
  after,
  selectedLine,
  onSelect,
}: {
  before: string;
  after: string;
  selectedLine: number | null;
  onSelect: (line: number) => void;
}) {
  return (
    <div
      className="diff-scroll"
      role="region"
      aria-label="변경 코드 diff"
      tabIndex={0}
    >
      <div className="diff-lines">
        {createDiff(before, after).map((line, index) => {
          const marker =
            line.kind === "added" ? "+" : line.kind === "removed" ? "−" : " ";
          const content = (
            <>
              <span className="diff-old" aria-hidden="true">
                {line.oldLine ?? ""}
              </span>
              <span className="diff-new" aria-hidden="true">
                {line.newLine ?? ""}
              </span>
              <span className="diff-marker" aria-hidden="true">
                {marker}
              </span>
              <code>{line.text || " "}</code>
            </>
          );
          return line.newLine !== null ? (
            <button
              key={index}
              type="button"
              className={`diff-line ${line.kind} ${selectedLine === line.newLine ? "selected-line" : ""}`}
              aria-label={`새 코드 ${line.newLine}행${line.kind === "added" ? " 추가" : ""}: ${line.text}`}
              aria-pressed={selectedLine === line.newLine}
              onClick={() => onSelect(line.newLine!)}
            >
              {content}
            </button>
          ) : (
            <div key={index} className="diff-line removed">
              <span className="sr-only">삭제된 코드: </span>
              {content}
            </div>
          );
        })}
      </div>
    </div>
  );
}
