import { useEffect, useRef } from "react";
import * as d3 from "d3";

/**
 * Runs an imperative D3 render function against a container ref.
 *
 * The `render` callback receives a d3 selection of the container element and
 * should build the chart into it. The container is emptied before each run so
 * re-renders (on dependency change) start from a clean slate.
 *
 * @param {(container: d3.Selection) => void} render
 * @param {Array} deps  dependency list controlling when to re-render
 */
export function useD3(render, deps) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const container = d3.select(el);
    container.selectAll("*").remove();
    const cleanup = render(container);
    return () => {
      if (typeof cleanup === "function") cleanup();
      container.selectAll("*").remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
