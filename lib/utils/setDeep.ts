// Appends deeply-nested values into object
export function setDeep(
    obj: Record<string, unknown>,
    path: string[],
    value: string
) {
    path.reduce((acc, next, index) => {
        if (typeof acc[next] === "undefined") {
            acc[next] = {};
        }

        if (index === path.length - 1) {
            acc[next] = value;
        }

        return acc[next];
    }, obj);

    return obj;
}
