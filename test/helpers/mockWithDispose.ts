import { vi } from "vitest";

Symbol["dispose"] ??= Symbol("Symbol.dispose");
Symbol["asyncDispose"] ??= Symbol("Symbol.asyncDispose");

export function mockWithDispose<T extends { prototype: Record<string, any> }>(
    classObj: T,
    key: string
) {
    const implementation = classObj.prototype[key];
    classObj.prototype[key] = vi.fn();

    return {
        mockedClass: classObj.prototype,
        [Symbol["dispose"]]() {
            classObj.prototype[key] = implementation;
        },
    };
}
