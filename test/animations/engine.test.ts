import { beforeAll, expect, it, describe } from "vitest";

import { createScene, Scene } from "../../lib/animation/engine";

describe("Scene class", () => {
    let div: HTMLDivElement;
    beforeAll(() => {
        div = document.createElement("div");
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });
});
