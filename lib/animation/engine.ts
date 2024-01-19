import { AnimationCommand } from "./command";
import { CommandObject } from "./types";

abstract class BasicStep {
    protected commands: AnimationCommand[];
    protected element: HTMLElement;
    protected options?: EffectTiming;
    protected initialStyleMap?: Record<string, string>;
    protected animationsInPlay: Set<Animation> = new Set();

    static CLEANUP_EVENTS = ["remove", "cancel"];

    constructor(
        element: HTMLElement,
        commands: CommandObject[],
        options?: EffectTiming
    ) {
        this.element = element;
        this.options = options;
        this.commands = commands.map(
            (data) =>
                new AnimationCommand(
                    data.values,
                    data.keyword,
                    data.template,
                    element,
                    data.options
                )
        );
        this.initialStyleMap = this.createInitialStyleMap();
    }

    private release(animation: Animation) {
        this.animationsInPlay.delete(animation);
        BasicStep.CLEANUP_EVENTS.forEach((eventName) =>
            animation.removeEventListener(
                eventName,
                this.release.bind(this, animation)
            )
        );
    }

    abstract play(): Promise<void>;

    protected execute(
        command: AnimationCommand,
        options?: EffectTiming
    ): Animation {
        const animation = command.execute(options);

        this.animationsInPlay.add(animation);

        BasicStep.CLEANUP_EVENTS.forEach((eventName) =>
            animation.addEventListener(
                eventName,
                this.release.bind(this, animation)
            )
        );

        animation.finished.then((anim) => {
            anim.commitStyles();
        });

        return animation;
    }

    private createInitialStyleMap() {
        return this.commands.reduce<Record<string, string>>((acc, next) => {
            const { keyword, template, keyframes } = next.getInfo();
            const uniqKey = `${keyword}_${template}`;
            console.log(keyframes);
            // acc[uniqKey] = keyframes[0][keyword] as string;
            return acc;
        }, {});
    }

    pause() {
        this.animationsInPlay.forEach((animation) => animation.pause());
    }

    resume() {
        this.animationsInPlay.forEach((animation) => animation.play());
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
        const anims = this.element.getAnimations();
        if (anims.length) {
            anims.forEach((animation) => animation.cancel());
        }
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
        console.log(this.currentStep);
        this.currentStep.resume();
    }

    run(transform: (el: HTMLElement) => BasicStep): Scene {
        const nextStep = transform(this.element);
        return new Scene(this.element, [...this.history, nextStep]);
    }

    apply(cm: CommandObject, options?: EffectTiming): Scene {
        return this.run((el) => new SimpleStep(el, cm, options));
    }

    chain(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run((el) => new ChainStep(el, cms, options));
    }

    together(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run((el) => new TogetherStep(el, cms, options));
    }
}

class ChainStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cms: CommandObject[],
        options?: EffectTiming
    ) {
        super(element, cms, options);
        window["animationsInPlay1"] = this.animationsInPlay;
    }

    async play(): Promise<void> {
        await this.commands.reduce((acc, nextCommand) => {
            return acc.then(
                () => this.execute(nextCommand, this.options).finished
            );
        }, Promise.resolve());
    }
}

class TogetherStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cms: CommandObject[],
        options?: EffectTiming
    ) {
        super(element, cms, options);
        window["animationsInPlay2"] = this.animationsInPlay;
    }

    async play(): Promise<void> {
        await Promise.all(
            this.commands.map(
                (command) => this.execute(command, this.options).finished
            )
        );
    }
}

class SimpleStep extends BasicStep {
    constructor(
        element: HTMLElement,
        cm: CommandObject,
        options?: EffectTiming
    ) {
        super(element, [cm], options);
    }

    async play(): Promise<void> {
        await this.execute(this.commands[0], this.options).finished;
    }
}

export function createScene(element: HTMLElement) {
    return new Scene(element);
}
