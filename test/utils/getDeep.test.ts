import { expect, it, describe } from "vitest";
import { getDeep } from "../../lib/utils/getDeep";

describe("getDeep", () => {
    it("retrieves deeply-nested value from object", () => {
        expect(
            getDeep(
                {
                    transform: { "rotate($)": "360deg" },
                },
                ["transform", "rotate($)"]
            )
        ).toBe("360deg");
    });

    it("returns undefined if there is no such path or value", () => {
        expect(
            getDeep(
                {
                    transform: { "rotate($)": "360deg" },
                },
                ["backgroundColor"]
            )
        ).toBe(undefined);
    });
});
