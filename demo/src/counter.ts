import {
    backgroundColor,
    fade,
    fontSize,
    rotate,
    translate,
} from "../../lib/animation/commands";
import { createScene } from "../../lib/animation/engine";

export function createAnimation(element: HTMLElement) {
    return (
        createScene(element)
            .together([
                fontSize([10, 20, 50, 30], {
                    duration: 300,
                    easing: "ease-out",
                }),
                backgroundColor("#a9029e"),
                backgroundColor("lightpink"),
                translate("0, -30%", {
                    duration: 300,
                    easing: "ease-out",
                }),
            ])
            // возможно надо сразу запомнить первоначальные стили, чтобы было проще инитить
            // например, запомнить первый translate, первый rotate, брать значения первого кейфрейма, если есть, или прямо из элемента если нет
            // при .init() применять их
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
            ])
    );
}
