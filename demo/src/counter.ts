import {
    backgroundColor,
    fade,
    fontSize,
    rotate,
    translate,
} from "../../lib/animation/commands";
import { createScene } from "../../lib/animation/engine";

export function createAnimation(element: HTMLElement) {
    return createScene(element)
        .together([
            fontSize([10, 30, 20], {
                duration: 300,
                easing: "ease-out",
            }),
            backgroundColor("#a9029e"),
            translate("0, -80%", {
                duration: 500,
                easing: "ease-out",
            }),
        ])
        .chain([
            translate("0, -160%", {
                duration: 300,
                easing: "ease-out",
            }),
            translate("0, -360%", {
                duration: 300,
                easing: "ease-out",
            }),
            rotate("360deg"),
            fade(0),
            fade(1),
        ]);
}
