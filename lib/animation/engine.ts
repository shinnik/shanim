import { setDeep } from "../utils/setDeep";
import { AnimationCommand } from "./command";
import { CommandObject } from "./types";

type StepMeta = {
    type: "simple" | "chain" | "together" | "init";
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
                    data.keyframes,
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
    private element: HTMLElement;
    private history: BasicStep[];
    private initSteps: BasicStep[];
    private steps: StepMeta[];
    private currentStep: BasicStep = null;
    private initialInlineElementStyles: string = null;

    constructor(
        element: HTMLElement,
        history: BasicStep[] = [],
        steps: StepMeta[] = []
    ) {
        this.element = element;
        this.steps = steps;
        this.history = history.filter(
            (_, index) => steps[index].type !== "init"
        );
        this.initSteps = history.filter(
            (_, index) => steps[index].type === "init"
        );
        this.initialInlineElementStyles = element.getAttribute("style");

        this.playInit();
    }

    private createHistory(steps: StepMeta[]) {
        return steps.map(({ type, cms, options }) => {
            switch (type) {
                case "chain":
                    return new ChainStep(this.element, cms, options);
                case "together":
                case "init":
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

    private async playInit() {
        this.reset();
        this.initSteps.forEach((step) => step.play());
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

    private getNextKeyframeForCombinedStyles(
        keyword: string,
        template: string,
        value: string,
        map: Record<string, Record<string, string>>
    ) {
        const styleString = Object.entries(map[keyword] || {}).reduce(
            (acc, [templ, val]) => {
                if (templ === template || val === "") {
                    return acc;
                }
                return `${acc} ${templ.replace("$", val)}`;
            },
            ""
        );

        return `${styleString} ${template.replace("$", value)}`.trim();
    }

    private createKeyframe(
        keyword: string,
        template: string,
        value: string,
        map: Record<string, Record<string, string>>
    ) {
        if (["transform"].includes(keyword)) {
            return this.getNextKeyframeForCombinedStyles(
                keyword,
                template,
                value,
                map
            );
        }

        return template.replace("$", value);
    }

    private getCombinedValuesMap(steps: StepMeta[]) {
        const map: Record<string, Record<string, string>> = {}; // store last values for each keyword_template key

        steps
            .flatMap((step) => step.cms)
            .filter((cm) => ["transform"].includes(cm.keyword))
            .forEach(({ keyword, template, values }) => {
                setDeep(map, [keyword, template], values[0]);
            });

        return map;
    }

    // UPD: just calculate keyframes
    private justifyStep(step: StepMeta, steps: StepMeta[]) {
        const state = this.getCombinedValuesMap(steps);
        const currentState = { ...state };

        return {
            ...step,
            cms: step.cms.map(({ keyword, template, values, ...rest }) => {
                const keyframes = values.map((val) => {
                    const keyframe = this.createKeyframe(
                        keyword,
                        template,
                        val,
                        currentState
                    );
                    setDeep(currentState, [keyword, template], val);
                    return { [keyword]: keyframe };
                });

                return {
                    keyword,
                    template,
                    values,
                    keyframes,
                    ...rest,
                };
            }),
        };
    }

    private addStep(nextStep: StepMeta, steps: StepMeta[]) {
        const copySteps = [...steps];

        if (nextStep.type === "init") {
            let result = [];

            if (copySteps[0].type === "init") {
                // merge init steps
                result.push(
                    this.justifyStep(
                        {
                            ...nextStep,
                            cms: [...nextStep.cms, ...copySteps[0].cms],
                        },
                        []
                    )
                );
                // remove init step, because we don't need it anymore
                copySteps.shift();
            } else {
                result.push(this.justifyStep(nextStep, []));
            }

            for (let i = 0; i < copySteps.length; i++) {
                result = [...result, this.justifyStep(copySteps[i], result)];
            }

            return result;
        }

        return [...steps, this.justifyStep(nextStep, steps)];
    }

    private createNextScene(nextStep: StepMeta) {
        const steps = this.addStep(nextStep, this.steps);
        console.log(this.addStep(nextStep, this.steps));
        const history = this.createHistory(steps);
        return new Scene(this.element, history, steps);
    }

    run(nextStep: StepMeta): Scene {
        return this.createNextScene(nextStep);
    }

    apply(cm: CommandObject): Scene {
        return this.run({
            type: "simple",
            cms: [cm],
        });
    }

    chain(cms: CommandObject[]): Scene {
        return this.run({
            type: "chain",
            cms,
        });
    }

    together(cms: CommandObject[]): Scene {
        return this.run({
            type: "together",
            cms,
        });
    }

    init(cms: CommandObject[]): Scene {
        return this.run({
            type: "init",
            cms,
            options: { duration: 0 }, // apply immediately
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
