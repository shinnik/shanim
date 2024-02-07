import { expect, it, describe } from "vitest";

import {
    retrieveValueFromTemplate,
    templateToRegexp,
} from "../../lib/utils/templateToRegexp";

describe("templateToRegexp util", () => {
    it("works as expected", () => {
        expect(templateToRegexp("translate($)").source).toBe(
            "translate\\((?<dollar>.*?)\\)"
        );
    });

    it("extracts dollar sign as a group", () => {
        const regex = templateToRegexp("translate($)");
        const example = "translate(0px, -80%)";

        const { dollar } = regex.exec(example)?.groups || {};

        expect(dollar).toBe("0px, -80%");
    });

    it("extracts from combined properly", () => {
        const regex = templateToRegexp("translate($)");
        const example = "translate(0px, -80%) rotate(360deg)";

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

describe("retrieveValueFromTemplate", () => {
    it("retrieves value", () => {
        expect(
            retrieveValueFromTemplate(
                "translate(0px, -80%) rotate(360deg)",
                "translate($)"
            )
        ).toBe("0px, -80%");
    });

    it("returns empty string if a template doesn't have a match", () => {
        expect(retrieveValueFromTemplate("bad example", "translate($)")).toBe(
            ""
        );
    });
});
