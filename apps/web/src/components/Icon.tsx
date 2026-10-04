const paths = {
  home: "m3 10 9-7 9 7v10H3Zm6 10v-7h6v7",
  stacks: "m12 3 9 5-9 5-9-5Zm-9 9 9 5 9-5M3 16l9 5 9-5",
  trace: "m7 4 13 8-13 8Z",
  review: "M9 5h11v16H4V5h3m2-2h6v4H9Zm-1 12 3 3 5-6",
  arrow: "M4 12h16m-6-6 6 6-6 6",
  sun: "M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11Z",
  search: "M20 20l-5-5m2-6a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
} as const;
export type IconName = keyof typeof paths;
export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}
