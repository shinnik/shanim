export const templateToRegexp = (template: string) => {
    let dollarCount = 0;

    return new RegExp(
        template
            .split("")
            .reduce((acc, char) => {
                if (char === ")") {
                    acc.push("\\)");
                } else if (char === "(") {
                    acc.push("\\(");
                } else if (char === "$") {
                    acc.push(
                        `(?<dollar${dollarCount > 0 ? dollarCount : ""}>.*?)`
                    );
                    dollarCount++;
                } else {
                    acc.push(char);
                }

                return acc;
            }, [])
            .join(""),
        "gm"
    );
};

export const retrieveValueFromTemplate = (target: string, template: string) => {
    const { dollar } = templateToRegexp(template).exec(target)?.groups || {};
    return dollar || "";
};
