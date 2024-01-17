import { AnimationCommand } from "./command";

abstract class BasicStep {
    protected commands: AnimationCommand[];
    protected element: HTMLElement;
    protected options?: EffectTiming;

    static CLEANUP_EVENTS = ["remove", "cancel"];

    constructor(element: HTMLElement, options?: EffectTiming) {
        this.element = element;
        this.options = options;
    }

    abstract play(): Promise<void>;

    protected execute(
        command: AnimationCommand,
        element: HTMLElement,
        options?: EffectTiming
    ): Animation {
        const animation = command.execute(element, options);

        animation.finished.then((anim) => {
            anim.commitStyles();
        });

        return animation;
    }

    reset() {
        this.element.getAnimations().forEach((animation) => animation.cancel());
    }

    pause() {
        this.element.getAnimations().forEach((animation) => animation.pause());
    }

    resume() {
        this.element.getAnimations().forEach((animation) => animation.play());
    }
}

/** View for client code */
export class Scene {
    protected element: HTMLElement;
    private history: BasicStep[];
    private currentStep: BasicStep = null;
    private initialInlineElementStyles: string = null;

    constructor(element: HTMLElement, history: BasicStep[] = []) {
        this.element = element;
        this.history = history;
        this.initialInlineElementStyles = element.getAttribute("style");
    }

    private reset() {
        // reverse seems reasonable, because we're kind of going back in time when canceling
        [...this.history].reverse().forEach((s) => s.reset());
    }

    private cleanStyles() {
        this.initialInlineElementStyles
            ? this.element.setAttribute(
                  "style",
                  this.initialInlineElementStyles
              )
            : this.element.removeAttribute("style");
    }

    async play(
        options: { shouldCommit?: boolean } = { shouldCommit: false }
    ): Promise<void> {
        this.reset();

        for (let step of this.history) {
            this.currentStep = step;
            await step.play();
        }

        if (!options.shouldCommit) {
            this.cleanStyles();
        }
    }

    async pause(): Promise<void> {
        this.currentStep.pause();
    }

    async resume(): Promise<void> {
        this.currentStep.resume();
    }

    run(transform: (el: HTMLElement) => BasicStep): Scene {
        const nextStep = transform(this.element);
        return new Scene(this.element, [...this.history, nextStep]);
    }

    apply(cm: AnimationCommand, options?: EffectTiming): Scene {
        return this.run((el) => new SimpleStep(el, cm, options));
    }

    chain(cms: AnimationCommand[], options?: EffectTiming): Scene {
        return this.run((el) => new ChainStep(el, cms, options));
    }

    together(cms: AnimationCommand[], options?: EffectTiming): Scene {
        return this.run((el) => new TogetherStep(el, cms, options));
    }
}

class ChainStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cms: AnimationCommand[],
        options?: EffectTiming
    ) {
        super(element, options);
        this.commands = cms;
    }

    async play(): Promise<void> {
        await this.commands.reduce((acc, nextCommand) => {
            return acc.then(
                () =>
                    this.execute(nextCommand, this.element, this.options)
                        .finished
            );
        }, Promise.resolve());
    }
}

class TogetherStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cms: AnimationCommand[],
        options?: EffectTiming
    ) {
        super(element, options);
        this.commands = cms;
    }

    async play(): Promise<void> {
        await Promise.all(
            this.commands.map(
                (command) =>
                    this.execute(command, this.element, this.options).finished
            )
        );
    }
}

class SimpleStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cm: AnimationCommand,
        options?: EffectTiming
    ) {
        super(element, options);
        this.commands = [cm];
    }

    async play(): Promise<void> {
        await this.execute(this.commands[0], this.element, this.options)
            .finished;
    }
}

export function createScene(element: HTMLElement) {
    return new Scene(element);
}
