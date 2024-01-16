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
            fontSize([10, 20, 50, 30], {
                duration: 3000,
                easing: "ease-out",
            }),
            backgroundColor("#a9029e"),
        ])
        .chain([
            translate("0, -80%", {
                duration: 300,
                easing: "ease-out",
            }),
            translate("0, -360%", {
                duration: 300,
                easing: "ease-out",
            }),
            rotate("360deg"),
            translate("0, -540%", {
                duration: 300,
                easing: "ease-out",
            }),
            fade(0),
            fade(1),
        ]);
}
