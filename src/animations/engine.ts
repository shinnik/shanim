import { AnimationCommand } from "./commands";

abstract class BasicStep {
    protected commands: AnimationCommand[];
    protected element: HTMLElement;
    protected animationsInPlay: Set<Animation> = new Set();

    static CLEANUP_EVENTS = ["finish", "remove", "cancel"];

    constructor(element: HTMLElement) {
        this.element = element;
    }

    abstract play(): Promise<void>;

    private release(animation: Animation) {
        this.animationsInPlay.delete(animation);
        BasicStep.CLEANUP_EVENTS.forEach((eventName) =>
            animation.removeEventListener(
                eventName,
                this.release.bind(this, animation)
            )
        );
    }

    execute(
        command: AnimationCommand,
        element: HTMLElement,
        options?: EffectTiming
    ): Animation {
        const animation = command.execute(element, options);
        this.animationsInPlay.add(animation);

        BasicStep.CLEANUP_EVENTS.forEach((eventName) =>
            animation.addEventListener(
                eventName,
                this.release.bind(this, animation)
            )
        );

        animation.finished.then((a) => {
            a.commitStyles();
        });

        return animation;
    }

    pause() {
        if (!this.animationsInPlay.size) {
            return;
        }

        this.animationsInPlay.forEach((animation) => animation.pause());
    }

    resume() {
        if (!this.animationsInPlay.size) {
            return;
        }

        this.animationsInPlay.forEach((animation) => animation.play());
    }
}

// class Player {}

/** View for client code */
export class Scene {
    protected element: HTMLElement;
    private history: BasicStep[];
    private currentStep: BasicStep = null;

    constructor(element: HTMLElement, history: BasicStep[] = []) {
        this.element = element;
        this.history = history;
    }

    run(transform: (el: HTMLElement) => BasicStep): Scene {
        const nextStep = transform(this.element);
        return new Scene(this.element, [...this.history, nextStep]);
    }

    async play(): Promise<void> {
        for (let step of this.history) {
            this.currentStep = step;
            await step.play();
        }
    }

    async pause(): Promise<void> {
        this.currentStep.pause();
    }

    async resume(): Promise<void> {
        this.currentStep.resume();
    }

    apply(cm: AnimationCommand, options?: EffectTiming): Scene {
        return this.run((el) => new SimpleStep(el, cm));
    }

    chain(cms: AnimationCommand[], options?: EffectTiming): Scene {
        return this.run((el) => new ChainStep(el, cms));
    }

    together(cms: AnimationCommand[], options?: EffectTiming): Scene {
        return this.run((el) => new TogetherStep(el, cms));
    }
}

class ChainStep extends BasicStep {
    constructor(element: HTMLElement, cms: AnimationCommand[]) {
        super(element);
        this.commands = cms;
    }

    async play(): Promise<void> {
        this.commands.reduce((acc, nextCommand) => {
            return acc.then(
                () => this.execute(nextCommand, this.element).finished
            );
        }, Promise.resolve());
    }
}

class TogetherStep extends BasicStep {
    constructor(element: HTMLElement, cms: AnimationCommand[]) {
        super(element);
        this.commands = cms;
    }

    async play(): Promise<void> {
        await Promise.all(
            this.commands.map(
                (command) =>
                    this.execute(command, this.element /*commonSettings*/)
                        .finished
            )
        );
    }
}

class SimpleStep extends BasicStep {
    constructor(element: HTMLElement, cm: AnimationCommand) {
        super(element);
        this.commands = [cm];
    }

    async play(): Promise<void> {
        await this.execute(this.commands[0], this.element).finished;
    }
}

export function createScene(element: HTMLElement) {
    return new Scene(element);
}
