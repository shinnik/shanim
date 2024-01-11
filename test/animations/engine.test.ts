import { beforeAll, expect, it, describe } from "vitest";

import { createScene, Scene } from "../../lib/animation/engine";
import { fade } from "../../lib/animation/commands";

describe("Scene", () => {
    let div: HTMLDivElement;
    beforeAll(() => {
        div = document.createElement("div");
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });
});
