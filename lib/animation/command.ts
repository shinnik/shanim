import { kebabize } from "../utils/kebabize";
import { retrieveValueFromTemplate } from "../utils/templateToRegexp";
import { AllowedEffectTiming, Keyword } from "./types";

// Keywords that should be combined (e.g transform: "translateX(10px) rotate(20deg)")
const COMBINE_KEYWORDS = ["transform"];

export class AnimationCommand {
    private keyword: Keyword;
    private template: string;

    private keyframes: Keyframe[] = [];

    static defaultEffectTiming: AllowedEffectTiming = {
        delay: 0,
        duration: 300,
        iterations: 1,
        easing: "ease-in",
    };

    static requiredEffectTiming: EffectTiming = {
        // It's required, because we rely on previously committed styles
        // If "fill" would be none or auto, then there would be two potential issues:
        // 1. Problem with animation removing
        // 2. Styles can not be committed on animation finish
        fill: "both",
    };

    values: string[];
    options: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(
        values: string | number | (string | number)[],
        keyword: Keyword,
        template: string,
        options?: AllowedEffectTiming
    ) {
        this.options = options;
        this.keyword = keyword;
        this.template = template;
        this.values = Array.isArray(values)
            ? values.map((v) => v.toString())
            : [values.toString()];
    }

    private findInitialCSSValue(element: HTMLElement): string {
        return (
            element.style[this.keyword].toString() ||
            window
                .getComputedStyle(element)
                .getPropertyValue(kebabize(this.keyword))
        );
    }

    private getNextKeyframeForCombinedStyles(
        element: HTMLElement,
        source: string
    ) {
        const styleString = element.style[this.keyword].toString();
        console.log(this.template, source, styleString);

        if (source === "") {
            return styleString;
        }

        if (styleString === "") {
            return this.template.replace("$", source);
        }

        const valueForThisTemplate = retrieveValueFromTemplate(
            styleString,
            this.template
        );
        console.log(valueForThisTemplate, "valueForThisTemplate");

        if (valueForThisTemplate === "") {
            return `${styleString} ${this.template.replace("$", source)}`;
        } else {
            return styleString.replace(valueForThisTemplate, source);
        }
    }

    private getKeyframe(element: HTMLElement, source: string) {
        if (COMBINE_KEYWORDS.includes(this.keyword)) {
            return this.getNextKeyframeForCombinedStyles(element, source);
        }

        return this.template.replace("$", source);
    }

    private createKeyframes(element: HTMLElement) {
        // const startValue = retrieveValueFromTemplate(
        //     this.findInitialCSSValue(element),
        //     this.template
        // );

        // console.log(startValue, "startValue");

        let keyframes = [];

        // add current style value as first keyframe
        // if (startValue !== this.values[0]) {
        //     keyframes.push({
        //         [this.keyword]: this.getKeyframe(element, startValue),
        //     });
        // }

        keyframes = [
            // ...keyframes,
            ...this.values.map((val) => ({
                [this.keyword]: this.getKeyframe(element, val),
            })),
        ];

        return keyframes;
    }

    private getKeyframes(element: HTMLElement): Keyframe[] {
        if (this.keyframes.length === 0) {
            this.keyframes = this.createKeyframes(element);
        }

        console.log(this.keyframes, this.template);
        return this.keyframes;
    }

    execute(element: HTMLElement, overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        return element.animate(this.getKeyframes(element), {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
            ...AnimationCommand.requiredEffectTiming,
        });
    }
}
