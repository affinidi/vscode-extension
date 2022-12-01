/**
 * Formats object, adds indentation to all lines except for the first one.
 * `formatObject({ hello: 'world', nested: { fields: true } }, { indent: 2 })`
 * =>
 * ```
 * {
 *       "hello": "world",
 *       "nested": {
 *         "fields": true
 *       }
 *     }
 * ```
 */
export function formatObject(object: any, options?: { indent?: number; indentFirstLine?: boolean }) {
  const indentation = '  '.repeat(options?.indent ?? 0)
  return JSON.stringify(object, null, 2)
    .split('\n')
    .map((line, i) => (!options?.indentFirstLine && i === 0) ? line : indentation + line)
    .join('\n')
}
