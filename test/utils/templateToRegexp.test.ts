import { beforeAll, expect, test, it, describe } from "vitest";

import { templateToRegexp } from "../../lib/utils/templateToRegexp";

describe("templateToRegexp", () => {
    it("works as expected", () => {
        expect(templateToRegexp("translate($)").source).toBe(
            "translate\\((?<dollar>.*)\\)"
        );
    });

    it("extracts dollar sign as a group", () => {
        const regex = templateToRegexp("translate($)");
        const example = "translate(0px, -80%)";

        const { dollar } = regex.exec(example)?.groups || {};

        expect(dollar).toBe("0px, -80%");
    });

    it("can extract two dollar signs", () => {
        const regex = templateToRegexp("translate($, $)");
        const example = "translate(0px, -80%)";

        const { dollar, dollar1 } = regex.exec(example)?.groups || {};

        expect(dollar).toBe("0px");
        expect(dollar1).toBe("-80%");
    });
});
