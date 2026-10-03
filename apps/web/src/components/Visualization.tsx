import type { ComponentType } from "react";
import type {
  TraceStep,
  Visualization as VisualizationSpec,
} from "../domain/scenario";

interface RendererProps {
  spec: VisualizationSpec;
  step: TraceStep;
  previous?: TraceStep;
}

function Variables({ spec, step, previous }: RendererProps) {
  return (
    <dl className="variables">
      {spec.fields.map((field) => {
        const value = step.state[field.name];
        const changed =
          value !== undefined && value !== previous?.state[field.name];
        return (
          <div
            key={field.name}
            className={changed ? "variable changed" : "variable"}
          >
            <dt>
              <code>{field.name}</code>
              <small>{field.type}</small>
            </dt>
            <dd>
              <code>{value ?? "아직 선언 전"}</code>
              {changed && <span className="change-label">변경</span>}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

// Add renderers explicitly; unsupported formats never silently become variables.
const renderers: Record<
  VisualizationSpec["type"],
  ComponentType<RendererProps>
> = { variables: Variables };
export function Visualization(props: RendererProps) {
  const Renderer = renderers[props.spec.type];
  if (!Renderer || props.spec.schemaVersion !== 1)
    return <p role="alert">지원하지 않는 시각화 버전입니다.</p>;
  return <Renderer {...props} />;
}
