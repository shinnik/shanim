import { AnimationCommand } from "./engine";

export class Fade extends AnimationCommand {
    keyframes: Keyframe[] = [
        { opacity: this.fromTo.from },
        { opacity: this.fromTo.to },
    ];
}

export class Rotate extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `rotate(${this.fromTo.from}deg)` },
        { transform: `rotate(${this.fromTo.to}deg)` },
    ];
}

export class ChangeFont extends AnimationCommand {
    keyframes: Keyframe[] = [
        { fontSize: `${this.fromTo.from}px` },
        { fontSize: `${this.fromTo.to}px` },
    ];
}

export class BackgroundColorChange extends AnimationCommand {
    keyframes: Keyframe[] = [
        { backgroundColor: this.fromTo.from },
        { backgroundColor: this.fromTo.to },
    ];
}

export class TranslateX extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translateX(${this.fromTo.from}px)` },
        { transform: `translateX(${this.fromTo.to}px)` },
    ];
}

export class TranslateY extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translateY(${this.fromTo.from}px)` },
        { transform: `translateY(${this.fromTo.to}px)` },
    ];
}

export class Translate extends AnimationCommand {
    keyframes: Keyframe[] = [
        { transform: `translate(${this.fromTo.from})` },
        { transform: `translate(${this.fromTo.to})` },
    ];
}
