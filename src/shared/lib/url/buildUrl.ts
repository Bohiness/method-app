// src/shared/lib/url/buildUrl.ts
export function buildUrl(base: string, path?: string | number, params?: Record<string, string>) {
    const url = path ? `${base}${path}/` : base
    const queryParams = params ? `?${new URLSearchParams(params)}` : ''
    return `${url}${queryParams}`
}