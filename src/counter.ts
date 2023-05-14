import { TranslateX, TranslateY } from "./animations/commands";
import { AnimationEngine } from "./animations/engine";

export function startAnimation(element: HTMLElement) {
    const animation = new AnimationEngine(element);

    animation.apply(new TranslateX({ from: 0, to: 100 }));
}
