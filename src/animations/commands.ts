import { kebabize } from "../utils/kebabize";
import { retrieveValueFromTemplate } from "../utils/templateToRegexp";

type StringPropertiesOnly<T> = {
    [P in keyof T as P extends string
        ? T[P] extends string | number
            ? P
            : never
        : never]: T[P];
};

type Keyword = Exclude<
    keyof StringPropertiesOnly<ElementCSSInlineStyle["style"]>,
    "length" | "parentRule"
>;

// Keywords that should be combined (e.g transform: "translateX(10px) rotate(20deg)")
const COMBINE_KEYWORDS = ["transform"];

export abstract class AnimationCommand {
    abstract keyword: Keyword;
    abstract template: string;
    abstract default?: string;

    // need to accept number of keyframes with at least delay and duration
    private keyframes: Keyframe[] = [];

    static defaultEffectTiming: EffectTiming = {
        delay: 0,
        duration: 300,
        iterations: 1,
        fill: "both",
        easing: "ease-in",
    };

    values: string[];
    options: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(
        values: string | number | (string | number)[],
        options?: EffectTiming
    ) {
        this.options = options;
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

    private getKeyframe(element: HTMLElement, source: string) {
        if (COMBINE_KEYWORDS.includes(this.keyword)) {
            return this.getNextKeyframeForCombinedStyles(element, source);
        }

        return this.template.replace("$", source);
    }

    private getKeyframes(element: HTMLElement): Keyframe[] {
        if (this.keyframes.length === 0) {
            const startValue = retrieveValueFromTemplate(
                this.findInitialCSSValue(element),
                this.template
            );

            // add current style value as first keyframe
            if (startValue !== this.values[0]) {
                this.keyframes = [
                    { [this.keyword]: this.getKeyframe(element, startValue) },
                ];
            }

            this.keyframes = [
                ...this.keyframes,
                ...this.values.map((val) => ({
                    [this.keyword]: this.getKeyframe(element, val),
                })),
            ];
        }

        console.log(this.keyframes);
        return this.keyframes;
    }

    execute(element: HTMLElement, overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        return element.animate(this.getKeyframes(element), {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
        });
    }
}

// export function fade(fromTo: FromTo) {
//     return new AnimationCommand()
// }

export class Fade extends AnimationCommand {
    keyword = "opacity" as const;
    template = "$";
    default = "0";
}

export class Translate extends AnimationCommand {
    keyword = "transform" as const;
    template = "translate($)";
    default = "0, 0";
}

export class ChangeFont extends AnimationCommand {
    keyword = "fontSize" as const;
    template = "$px";
    default: "0";
}

export class BackgroundColorChange extends AnimationCommand {
    keyword = "backgroundColor" as const;
    template = "$";
    default = "#ffffff";
}

// export class Fade extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { opacity: this.fromTo.from },
//         { opacity: this.fromTo.to },
//     ];
// }

export class Rotate extends AnimationCommand {
    keyword = "transform" as const;
    template = "rotate($)";
    default = "0deg";
}

// export class ChangeFont extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { fontSize: `${this.fromTo.from}px` },
//         { fontSize: `${this.fromTo.to}px` },
//     ];
// }

// export class BackgroundColorChange extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { backgroundColor: this.fromTo.from },
//         { backgroundColor: this.fromTo.to },
//     ];
// }

// export class TranslateX extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { transform: `translateX(${this.fromTo.from})` },
//         { transform: `translateX(${this.fromTo.to})` },
//     ];
// }

// export class TranslateY extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { transform: `translateY(${this.fromTo.from})` },
//         { transform: `translateY(${this.fromTo.to})` },
//     ];
// }

// export class Translate extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { transform: `translate(${this.fromTo.from})` },
//         { transform: `translate(${this.fromTo.to})` },
//     ];
// }
