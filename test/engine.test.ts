import { beforeAll, expect, test, it, describe } from "vitest";

import { createScene, Scene } from "../src/animations/engine";

describe("Scene", () => {
    let div: HTMLDivElement;
    beforeAll(() => {
        div = document.createElement("div");
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });

    it("can be chained", () => {
        const scene = createScene(div);
        // scene.chain(fade(0, 0.5, 1), translate("0, -80%"))
    });
});
