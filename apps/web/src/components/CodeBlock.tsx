export function CodeBlock({
  code,
  line,
  language,
}: {
  code: string;
  line: number | null;
  language: string;
}) {
  // Keyboard focus lets readers scroll long code independently of the page.
  return (
    <div
      className="code-scroll"
      role="region"
      aria-label={`${language} 코드`}
      tabIndex={0}
    >
      <pre>
        <code>
          {code.split("\n").map((text, index) => (
            <span
              key={index}
              className={`code-line ${line === index + 1 ? "active-line" : ""}`}
              aria-current={line === index + 1 ? "step" : undefined}
            >
              <span className="line-number" aria-hidden="true">
                {index + 1}
              </span>
              <span className="line-marker" aria-hidden="true">
                {line === index + 1 ? "›" : " "}
              </span>
              {text}
              {"\n"}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
