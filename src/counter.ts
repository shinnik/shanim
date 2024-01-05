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
            new ChangeFont([10, 20, 30], { duration: 300, easing: "ease-out" }),
            new BackgroundColorChange("#a9029e"),
        ])
        .chain([
            new Translate("0, -80%", { duration: 300, easing: "ease-out" }),
            new Translate("0, -160%", {
                duration: 300,
                easing: "ease-out",
            }),
            new Rotate("360deg"),
            new Fade(0, { delay: 0.9 }),
            new Fade(1),
        ]);
}
