import { beforeAll, expect, it, describe, vi } from "vitest";

import { createScene, Scene } from "../../lib/animation/engine";
import { mockWithDispose } from "../helpers/mockWithDispose";

describe("Scene", () => {
    let div: any;
    beforeAll(() => {
        div = document.createElement("div");
        div.getAnimations = vi.fn(() => []);
    });
    it("can be created", () => {
        expect(createScene(div) instanceof Scene).toBe(true);
    });

    it("plays initialization step", () => {
        using mock = mockWithDispose(Scene, "playInit");

        const scene = createScene(div);
        expect(scene["playInit"]).toBeCalled();
    });
});
