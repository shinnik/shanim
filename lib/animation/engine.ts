import { kebabize } from "../utils/kebabize";
import { retrieveValueFromTemplate } from "../utils/templateToRegexp";
import { AnimationCommand } from "./command";
import { CommandObject } from "./types";

abstract class BasicStep {
    protected commands: AnimationCommand[];
    protected element: HTMLElement;
    protected options?: EffectTiming;
    // protected initialStyleMap?: Record<string, string>;
    protected animationsInPlay: Set<Animation> = new Set();

    public TESTcmsObjects: CommandObject[];

    static CLEANUP_EVENTS = ["remove", "cancel"];

    constructor(
        element: HTMLElement,
        commands: CommandObject[],
        options?: EffectTiming
    ) {
        this.TESTcmsObjects = commands;
        console.log(commands, "COMMaNDS IN STEP");
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
    private currentStep: BasicStep = null;
    private initialInlineElementStyles: string = null;
    TESTCommandObjects: CommandObject[];

    constructor(element: HTMLElement, history: BasicStep[] = []) {
        this.element = element;
        this.history = history;
        this.initialInlineElementStyles = element.getAttribute("style");
        // this.TESTCommandObjects = this.addStartValue();
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

    addStartValue(targetArr: CommandObject[]) {
        const referenceObjs = this.history.flatMap((s) => s.TESTcmsObjects);

        const createMap = () => {
            const map: Record<string, string | number> = {}; // store last values for each keyword_template key

            referenceObjs.forEach(({ keyword, template, values }) => {
                const key = `${keyword}_${template}`;
                map[key] = values[values.length - 1];
            });

            return map;
        };

        const map = createMap();

        const result = targetArr.map(
            ({ keyword, template, values, ...rest }) => {
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
            }
        );

        this.TESTCommandObjects = result;
        console.log(map);
        console.log(result);
        return result;

        // const result = this.history
        //     .flatMap((s) => s.TESTcmsObjects)
        //     .map(({ keyword, template, values, options }) => {
        //         const key = `${keyword}_${template}`;
        //         const startValue = retrieveValueFromTemplate(
        //             this.element.style[keyword].toString() ||
        //                 window
        //                     .getComputedStyle(this.element)
        //                     .getPropertyValue(kebabize(keyword)),
        //             template
        //         );
        //         console.log(map[key], key);
        //         const initialValue =
        //             typeof map[key] !== "undefined" ? map[key] : startValue;
        //         const newValues = [initialValue, ...values];
        //         map[key] = values[values.length - 1];

        //         return {
        //             keyword,
        //             template,
        //             options,
        //             values: newValues,
        //         } as CommandObject;
        //     });

        // console.log(map);

        // return result;
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

    apply(cm: CommandObject, options?: EffectTiming): Scene {
        return this.run(
            // (el) => new SimpleStep(el, [cm], options)
            (el) => new SimpleStep(el, this.addStartValue([cm]), options)
        );
    }

    chain(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run(
            // (el) => new ChainStep(el, cms, options)
            (el) => new ChainStep(el, this.addStartValue(cms), options)
        );
    }

    together(cms: CommandObject[], options?: EffectTiming): Scene {
        return this.run(
            // (el) => new TogetherStep(el, cms, options)
            (el) => new TogetherStep(el, this.addStartValue(cms), options)
        );
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
