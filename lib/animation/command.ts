import { AllowedEffectTiming } from "./types";

export class AnimationCommand {
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

    options: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(
        element: HTMLElement,
        keyframes: Keyframe[],
        options?: AllowedEffectTiming
    ) {
        this.options = options;
        this.keyframes = keyframes;
        this.element = element;
    }

    execute(overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        return this.element.animate(this.keyframes, {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
            ...AnimationCommand.requiredEffectTiming,
        });
    }
}
