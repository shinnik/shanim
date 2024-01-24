import { kebabize } from "../utils/kebabize";
import { retrieveValueFromTemplate } from "../utils/templateToRegexp";
import { AnimationCommand } from "./command";
import { CommandObject } from "./types";

type StepMeta = {
    type: "simple" | "chain" | "together";
    cms: CommandObject[];
    options?: EffectTiming;
};

abstract class BasicStep {
    protected commands: AnimationCommand[];
    protected element: HTMLElement;
    protected options?: EffectTiming;
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
    private steps: StepMeta[];
    private currentStep: BasicStep = null;
    private initialInlineElementStyles: string = null;

    constructor(element: HTMLElement, steps: StepMeta[] = []) {
        this.element = element;
        this.steps = steps;
        this.history = this.createHistory(steps);
        this.initialInlineElementStyles = element.getAttribute("style");
    }

    private createHistory(steps: StepMeta[]) {
        return steps.map(({ type, cms, options }) => {
            switch (type) {
                case "chain":
                    return new ChainStep(this.element, cms, options);
                case "together":
                    return new TogetherStep(this.element, cms, options);
                case "simple":
                    return new SimpleStep(this.element, cms, options);
                default:
                    console.warn("Unknown type. Fallback to simple step");
                    return new SimpleStep(this.element, cms, options);
            }
        });
    }

    private reset() {
        const animations = this.element.getAnimations();
        if (animations.length > 0) {
            animations.forEach((animation) => animation.cancel());
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
        this.currentStep.resume();
    }

    /**
     * на основании истории мы создаем полную картину того, как будет работать анимация
     * и вычисляем начальное значение каждого нового CommandObject на основании этой полной картины
     *
     * но прикол в том, что история не нужна тогда в таком виде (как и шаги), так как логика "истории" вынесена на уровень сцены
     */
    private createMapWithLastValues(steps: StepMeta[]) {
        const map: Record<string, string | number> = {}; // store last values for each keyword_template key

        steps
            .flatMap((step) => step.cms)
            .forEach(({ keyword, template, values }) => {
                const key = `${keyword}_${template}`;
                map[key] = values[values.length - 1];
            });

        return map;
    }

    // Add start value to step, based on previous steps
    private justifyStep(step: StepMeta, steps: StepMeta[]) {
        const referenceMap = this.createMapWithLastValues(steps);
        const map = { ...referenceMap };

        return {
            ...step,
            cms: step.cms.map(({ keyword, template, values, ...rest }) => {
                const key = `${keyword}_${template}`;

                const startValue = retrieveValueFromTemplate(
                    this.element.style[keyword].toString() ||
                        window
                            .getComputedStyle(this.element)
                            .getPropertyValue(kebabize(keyword)),
                    template
                );

                const initialValue =
                    typeof map[key] !== "undefined" ? map[key] : startValue;

                map[key] = values[values.length - 1];

                return {
                    keyword,
                    template,
                    values: [initialValue, ...values],
                    ...rest,
                };
            }),
        };
    }

    // Add start value for each command
    private addStep(steps: StepMeta[], stepToAdd: StepMeta): StepMeta[] {
        const adjustedStep = this.justifyStep(stepToAdd, steps);
        return [...steps, adjustedStep];
    }

    run(nextStep: StepMeta): Scene {
        return new Scene(this.element, this.addStep(this.steps, nextStep));
    }

    apply(cm: CommandObject, options?: EffectTiming): Scene {
        return this.run({
            type: "simple",
            cms: [cm],
            options,
        });
    }

    chain(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run({
            type: "chain",
            cms,
            options,
        });
    }

    together(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run({
            type: "together",
            cms,
            options,
        });
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
        cms: CommandObject[],
        options?: EffectTiming
    ) {
        super(element, cms, options);
    }

    async play(): Promise<void> {
        await this.execute(this.commands[0], this.options).finished;
    }
}

export function createScene(element: HTMLElement) {
    return new Scene(element);
}
