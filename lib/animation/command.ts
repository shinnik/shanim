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
        values: string[],
        keyword: Keyword,
        template: string,
        element: HTMLElement,
        keyframes: Keyframe[],
        options?: AllowedEffectTiming
    ) {
        this.options = options;
        this.keyword = keyword;
        this.keyframes = keyframes;
        this.template = template;
        this.element = element;
        this.values = values;
    }

    execute(overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        console.log(
            this.keyframes,
            `keyframes for ${this.keyword}_${this.template}`
        );
        return this.element.animate(this.keyframes, {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
            ...AnimationCommand.requiredEffectTiming,
        });
    }
}
