import { AnimationCommand } from "./command";
import { AllowedEffectTiming } from "./types";

export function fade(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
) {
    return new AnimationCommand(values, "opacity", "$", options);
}

export function translate(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
) {
    return new AnimationCommand(values, "transform", "translate($)", options);
}

export function fontSize(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
) {
    return new AnimationCommand(values, "fontSize", "$px", options);
}

export function backgroundColor(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
) {
    return new AnimationCommand(values, "backgroundColor", "$", options);
}

export function rotate(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
) {
    return new AnimationCommand(values, "transform", "rotate($)", options);
}
