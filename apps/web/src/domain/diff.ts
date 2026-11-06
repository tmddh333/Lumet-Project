export interface DiffLine {
  kind: "context" | "added" | "removed";
  text: string;
  oldLine: number | null;
  newLine: number | null;
}

/** A small LCS diff for bundled teaching snippets; never executes source. */
export function createDiff(before: string, after: string): DiffLine[] {
  const oldLines = before.split("\n");
  const newLines = after.split("\n");
  const lengths = Array.from({ length: oldLines.length + 1 }, () =>
    Array<number>(newLines.length + 1).fill(0),
  );
  for (let i = oldLines.length - 1; i >= 0; i--) {
    for (let j = newLines.length - 1; j >= 0; j--) {
      lengths[i]![j] =
        oldLines[i] === newLines[j]
          ? 1 + lengths[i + 1]![j + 1]!
          : Math.max(lengths[i + 1]![j]!, lengths[i]![j + 1]!);
    }
  }
  const result: DiffLine[] = [];
  let i = 0;
  let j = 0;
  while (i < oldLines.length || j < newLines.length) {
    if (
      i < oldLines.length &&
      j < newLines.length &&
      oldLines[i] === newLines[j]
    ) {
      result.push({
        kind: "context",
        text: newLines[j]!,
        oldLine: ++i,
        newLine: ++j,
      });
    } else if (
      i < oldLines.length &&
      (j === newLines.length || lengths[i + 1]![j]! >= lengths[i]![j + 1]!)
    ) {
      result.push({
        kind: "removed",
        text: oldLines[i]!,
        oldLine: ++i,
        newLine: null,
      });
    } else {
      result.push({
        kind: "added",
        text: newLines[j]!,
        oldLine: null,
        newLine: ++j,
      });
    }
  }
  return result;
}
