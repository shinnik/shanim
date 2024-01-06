import { beforeAll, expect, it, describe } from "vitest";

import { createScene, Scene } from "../../src/animations/engine";

describe("Scene", () => {
    let div: HTMLDivElement;
    beforeAll(() => {
        div = document.createElement("div");
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });
});
