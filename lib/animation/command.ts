import { kebabize } from "../utils/kebabize";
import { retrieveValueFromTemplate } from "../utils/templateToRegexp";
import { AllowedEffectTiming, Keyword } from "./types";

// Keywords that should be combined (e.g transform: "translateX(10px) rotate(20deg)")
const COMBINE_KEYWORDS = ["transform"];

export class AnimationCommand {
    private keyword: Keyword;
    private template: string;
    private element: HTMLElement;

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
        element: HTMLElement,
        options?: AllowedEffectTiming
    ) {
        this.options = options;
        this.keyword = keyword;
        this.template = template;
        this.element = element;
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

        if (valueForThisTemplate === "") {
            return `${styleString} ${this.template.replace("$", source)}`;
        } else {
            return styleString.replace(valueForThisTemplate, source);
        }
    }

    private getKeyframe(source: string) {
        if (COMBINE_KEYWORDS.includes(this.keyword)) {
            return this.getNextKeyframeForCombinedStyles(this.element, source);
        }

        return this.template.replace("$", source);
    }

    private createKeyframes() {
        // to replay animation correctly
        // const startValue = retrieveValueFromTemplate(
        //     this.findInitialCSSValue(this.element),
        //     this.template
        // );

        // console.log(
        //     `START VALUE FOR ${this.keyword}_${this.template}: ${startValue}`
        // );

        let keyframes = [];

        // add current style value as first keyframe
        // if (startValue !== this.values[0]) {
        //     keyframes.push({
        //         [this.keyword]: this.getKeyframe(startValue),
        //     });
        // }

        keyframes = [
            // ...keyframes,
            ...this.values.map((val) => ({
                [this.keyword]: this.getKeyframe(val),
            })),
        ];

        console.log(keyframes, "keyframes");

        return keyframes;
    }

    private getKeyframes(): Keyframe[] {
        if (this.keyframes.length === 0) {
            this.keyframes = this.createKeyframes();
        }

        return this.keyframes;
    }

    getInfo(): { keyword: Keyword; template: string; keyframes: Keyframe[] } {
        return {
            keyword: this.keyword,
            keyframes: this.keyframes,
            template: this.template,
        };
    }

    execute(overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        return this.element.animate(this.getKeyframes(), {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
            ...AnimationCommand.requiredEffectTiming,
        });
    }
}
