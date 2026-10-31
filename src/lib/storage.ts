/** Normaliza valores persistidos no navegador sem permitir que um formato inválido derrube a aplicação. */
export function normalizeStoredValue<T>(
  value: unknown,
  initial: T,
  normalize?: (value: any) => T
): T {
  try {
    const candidate: unknown = normalize ? normalize(value) : value;
    if (candidate === undefined || candidate === null) return initial;

    if (Array.isArray(initial)) {
      return (Array.isArray(candidate)
        ? candidate.filter((item) => item !== undefined && item !== null)
        : initial) as T;
    }

    if (typeof initial === 'object' && initial !== null) {
      return (typeof candidate === 'object' && !Array.isArray(candidate)
        ? candidate
        : initial) as T;
    }

    return (typeof candidate === typeof initial ? candidate : initial) as T;
  } catch {
    return initial;
  }
}
