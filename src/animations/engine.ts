import { AnimationCommand } from "./commands";

abstract class BasicStep {
    protected element: HTMLElement;

    constructor(element: HTMLElement) {
        this.element = element;
    }

    abstract play(): Promise<void>;
}

/** View for client code */
export class Scene {
    protected element: HTMLElement;
    private history: BasicStep[];

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
            await step.play();
        }
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
    isFinished = false;
    error: any = null;
    commands: AnimationCommand[];
    animations: Animation[];
    // effectiveAnimations: Animation[]

    constructor(element: HTMLElement, cms: AnimationCommand[]) {
        super(element);
        this.commands = cms;
    }

    async replay(): Promise<void> {
        this.animations.forEach((animation) => animation.play());
    }

    async play(): Promise<void> {
        if (this.isFinished) {
            return this.replay();
        }

        try {
            await this.commands.reduce((acc, nextCommand) => {
                const animation = nextCommand.execute(
                    this.element /*commonSettings*/
                );
                this.animations.push(animation);
                return acc.then(() => animation.finished);
            }, Promise.resolve());

            this.isFinished = true;
        } catch (error) {
            this.error = error;
        }
    }
}

class TogetherStep extends BasicStep {
    commands: AnimationCommand[];

    constructor(element: HTMLElement, cms: AnimationCommand[]) {
        super(element);
        this.commands = cms;
    }

    async play(): Promise<void> {
        console.log("together started");
        await Promise.all(
            this.commands.map(
                (command) =>
                    command.execute(this.element /*commonSettings*/).finished
            )
        );
        console.log("together finished");
    }
}

class SimpleStep extends BasicStep {
    command: AnimationCommand;

    constructor(element: HTMLElement, cm: AnimationCommand) {
        super(element);
        this.command = cm;
    }

    async play(): Promise<void> {
        await this.command.execute(this.element).finished;
    }
}

export function createScene(element: HTMLElement) {
    return new Scene(element);
}
