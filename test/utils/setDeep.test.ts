import { expect, it, describe } from "vitest";
import { setDeep } from "../../lib/utils/setDeep";

describe("setDeep", () => {
    it("creates first-level path in empty object", () => {
        expect(setDeep({}, ["transform", "rotate($)"], "360deg")).toStrictEqual(
            {
                transform: { "rotate($)": "360deg" },
            }
        );
    });

    it("creates random-level path in empty object", () => {
        expect(
            setDeep(
                {},
                ["transform", "rotate($)", "some", "random", "path"],
                "360deg"
            )
        ).toStrictEqual({
            transform: {
                "rotate($)": { some: { random: { path: "360deg" } } },
            },
        });
    });

    it("appends value into existing path", () => {
        expect(
            setDeep(
                { transform: { "translate($)": "0, 0" } },
                ["transform", "rotate($)"],
                "360deg"
            )
        ).toStrictEqual({
            transform: { "rotate($)": "360deg", "translate($)": "0, 0" },
        });
    });

    it("appends value and creates new path", () => {
        expect(
            setDeep(
                { transform: { "translate($)": "0, 0" } },
                ["backgroundColor"],
                "black"
            )
        ).toStrictEqual({
            transform: { "translate($)": "0, 0" },
            backgroundColor: "black",
        });
    });

    it("updates existing value", () => {
        expect(
            setDeep(
                { transform: { "translate($)": "0, 0" } },
                ["transform", "translate($)"],
                "0, -50%"
            )
        ).toStrictEqual({
            transform: { "translate($)": "0, -50%" },
        });
    });
});
