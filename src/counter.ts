import {
    BackgroundColorChange,
    ChangeFont,
    Fade,
    Rotate,
    Translate,
} from "./animations/commands";
import { Scene, createScene } from "./animations/engine";

export function createAnimation(element: HTMLElement) {
    return createScene(element)
        .together([
            new ChangeFont({ to: 20 }, { duration: 300, easing: "ease-out" }),
            new BackgroundColorChange({ to: "#a9029e" }),
        ])
        .chain([
            new Translate(
                { to: "0, -80%" },
                { duration: 300, easing: "ease-out" }
            ),
            new Translate(
                { to: "0, -160%" },
                { duration: 300, easing: "ease-out" }
            ),
            new Rotate({ to: "360deg" }),
            new Fade({ to: 0 }, { delay: 0.9 }),
            new Fade({ to: 1 }),
        ]);
}
