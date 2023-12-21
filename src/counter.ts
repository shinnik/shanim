import {
    BackgroundColorChange,
    ChangeFont,
    Fade,
    Translate,
} from "./animations/commands";
import { Scene, createScene } from "./animations/engine";

export function createAnimation(element: HTMLElement) {
    return createScene(element)
        .together([
            new ChangeFont({ from: 16, to: 20 }),
            new BackgroundColorChange({ from: "#1a1a1a", to: "#a9029e" }),
        ])
        .chain([
            new Translate(
                { from: "0, 0", to: "0, -80%" },
                { duration: 700, easing: "ease-out" }
            ),
            new Fade({ from: 1, to: 0 }),
            new Fade({ from: 0, to: 1 }),
        ]);
}

export function startAnimation(scene: Scene) {
    scene.play();
}
