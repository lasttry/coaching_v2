import type { EditorState } from './types';

const METADATA_MARK = 'coaching:drill-editor:v1';

/**
 * Extract an EditorState from a stored SVG string.
 * The state JSON is embedded inside a `<metadata>` element with a marker.
 * Returns null if the SVG doesn't carry our metadata.
 */
export function parseEditorState(svg: string | null | undefined): EditorState | null {
  if (!svg) return null;
  const match = svg.match(
    new RegExp(`<metadata[^>]*data-app="${METADATA_MARK}"[^>]*>([\\s\\S]*?)<\\/metadata>`)
  );
  if (!match) return null;
  try {
    const raw = match[1]
      .replace(/<!\[CDATA\[/, '')
      .replace(/]]>$/, '')
      .trim();
    const parsed = JSON.parse(raw) as EditorState;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.elements)) return null;
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Build a `<metadata>` element with the serialized state, for embedding in the output SVG.
 */
export function buildMetadataTag(state: EditorState): string {
  const json = JSON.stringify(state);
  // CDATA so we don't have to escape contents
  return `<metadata data-app="${METADATA_MARK}"><![CDATA[${json}]]></metadata>`;
}

/**
 * Given an inner SVG markup (already containing <defs>, <g>, ...) and a state to embed,
 * wrap it with the outer `<svg>` tag and attach metadata.
 */
export function wrapSvg(innerSvg: string, viewBox: string, state: EditorState): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${buildMetadataTag(
    state
  )}${innerSvg}</svg>`;
}
