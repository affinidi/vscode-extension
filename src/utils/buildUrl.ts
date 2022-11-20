export function buildUrl(
  baseUrl: string,
  path: string,
  qs?: string[][] | Record<string, string | undefined> | string | URLSearchParams,
): string {
  // @ts-ignore
  const search = new URLSearchParams(qs).toString()
  const url = `${baseUrl}${path}${search ? `?${search}` : ''}`

  return new URL(url).toString()
}
