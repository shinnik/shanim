import { kebabize } from "../utils/kebabize";

type StringPropertiesOnly<T> = {
    [P in keyof T as P extends string ? P : never]: T[P];
};

type Keyword = keyof StringPropertiesOnly<ElementCSSInlineStyle["style"]>;

type FromTo = { from?: string | number; to: string | number };

export abstract class AnimationCommand {
    abstract keyword: Keyword;
    abstract template: string;

    private keyframes: Keyframe[] = [];
    private initialState: string;

    static defaultEffectTiming: EffectTiming = {
        delay: 0,
        duration: 300,
        iterations: 1,
        fill: "both",
        easing: "ease-in",
    };

    fromTo: FromTo;
    options: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(fromTo: FromTo, options?: EffectTiming) {
        this.options = options;
        this.fromTo = fromTo;
    }

    private findInitialCSSValue(element: HTMLElement): string {
        return window
            .getComputedStyle(element)
            .getPropertyValue(kebabize(this.keyword));
    }

    private getFromKeyframe(element: HTMLElement): string {
        if (typeof this.fromTo.from === "undefined") {
            this.fromTo.from = this.findInitialCSSValue(element);
            return this.fromTo.from;
        }

        return this.template.replace("$", this.fromTo.from.toString());
    }

    private getToKeyframe(): string {
        return this.template.replace("$", this.fromTo.to.toString());
    }

    private getKeyframes(element: HTMLElement): Keyframe[] {
        if (this.keyframes.length === 0) {
            this.keyframes = [
                { [this.keyword]: this.getFromKeyframe(element) },
                { [this.keyword]: this.getToKeyframe() },
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
}

export class Translate extends AnimationCommand {
    keyword = "transform" as const;
    template = "translate($)";
}

export class ChangeFont extends AnimationCommand {
    keyword = "fontSize" as const;
    template = "$px";
}

export class BackgroundColorChange extends AnimationCommand {
    keyword = "backgroundColor" as const;
    template = "$";
}

// export class Fade extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { opacity: this.fromTo.from },
//         { opacity: this.fromTo.to },
//     ];
// }

// export class Rotate extends AnimationCommand {
//     keyframes: Keyframe[] = [
//         { transform: `rotate(${this.fromTo.from}deg)` },
//         { transform: `rotate(${this.fromTo.to}deg)` },
//     ];
// }

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
