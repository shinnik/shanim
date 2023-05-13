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
    options?: EffectTiming = AnimationCommand.defaultEffectTiming;

    constructor(
        fromTo: { from: string | number; to: string | number },
        options?: EffectTiming
    ) {
        this.options = options;
        this.fromTo = fromTo;
    }

    execute(element: HTMLElement, overrideOptions?: EffectTiming): Animation {
        /** animations own options prevail over common options
         * and both of them prevail over default settings */
        return element.animate(this.keyframes, {
            ...AnimationCommand.defaultEffectTiming,
            ...overrideOptions,
            ...this.options,
        });
    }
}

/**
 * It's desirable to describe animations as commands
 * and be able to make chains of several ones. Also, it would be great
 * to have a choice between sequential and simultaneous applying.
 */
export class AnimationEngine {
    constructor(private element: HTMLElement) {
        this.element = element;
    }

    apply(animation: AnimationCommand, commonSettings?: EffectTiming) {
        return animation.execute(this.element, commonSettings);
    }

    chain(animations: AnimationCommand[], commonSettings?: EffectTiming) {
        return animations.reduce((acc, nextAnimationCommand) => {
            return acc.then(
                () =>
                    nextAnimationCommand.execute(this.element, commonSettings)
                        .finished
            );
        }, Promise.resolve());
    }

    together(animations: AnimationCommand[], commonSettings?: EffectTiming) {
        return Promise.all(
            animations.map(
                (animationCommand) =>
                    animationCommand.execute(this.element, commonSettings)
                        .finished
            )
        );
    }
}
