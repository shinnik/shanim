import { beforeAll, expect, it, describe, vi } from "vitest";

import { createScene, Scene } from "../../lib/animation/engine";

describe("Scene", () => {
    let div: HTMLDivElement;
    beforeAll(() => {
        div = document.createElement("div");
        div.getAnimations = vi.fn(() => []);
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });
});
