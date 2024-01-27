// Retrieves deeply-nested values from object
export function getDeep(
    obj: Record<string, unknown>,
    path: string[]
): string | undefined {
    return path.reduce((acc, next) => {
        if (typeof acc === "undefined" || typeof acc[next] === "undefined") {
            return undefined;
        }

        return acc[next];
    }, obj) as string | undefined;
}
