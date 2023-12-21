export abstract class AnimationCommand {
    abstract keyframes: Keyframe[];

    static defaultEffectTiming: EffectTiming = {
        delay: 0,
        duration: 300,
        iterations: 1,
        fill: "both",
        easing: "ease-in",
    };

    fromTo: { from: string | number; to: string | number };
    options: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(
        fromTo: { from: string | number; to: string | number },
        options?: EffectTiming
    ) {
        this.options = options;
        this.fromTo = fromTo;
    }

    execute(element: HTMLElement, overrideOptions?: EffectTiming): Animation {
        /** animation's own options prevail over common options
         * and both of them prevail over default settings */
        return element.animate(this.keyframes, {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
        });
    }
}

export class Fade extends AnimationCommand {
    keyframes: Keyframe[] = [
        { opacity: this.fromTo.from },
        { opacity: this.fromTo.to },
    ];
}

export class Rotate extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `rotate(${this.fromTo.from}deg)` },
        { transform: `rotate(${this.fromTo.to}deg)` },
    ];
}

export class ChangeFont extends AnimationCommand {
    keyframes: Keyframe[] = [
        { fontSize: `${this.fromTo.from}px` },
        { fontSize: `${this.fromTo.to}px` },
    ];
}

export class BackgroundColorChange extends AnimationCommand {
    keyframes: Keyframe[] = [
        { backgroundColor: this.fromTo.from },
        { backgroundColor: this.fromTo.to },
    ];
}

export class TranslateX extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translateX(${this.fromTo.from})` },
        { transform: `translateX(${this.fromTo.to})` },
    ];
}

export class TranslateY extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translateY(${this.fromTo.from})` },
        { transform: `translateY(${this.fromTo.to})` },
    ];
}

export class Translate extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translate(${this.fromTo.from})` },
        { transform: `translate(${this.fromTo.to})` },
    ];
}
