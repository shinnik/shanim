import { AnimationCommand } from "./command";
import { AllowedEffectTiming, CommandObject } from "./types";

export function fade(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
): CommandObject {
    return {
        values,
        options,
        keyword: "opacity",
        template: "$",
    };
}

export function translate(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
): CommandObject {
    return {
        values,
        options,
        keyword: "transform",
        template: "translate($)",
    };
}

export function fontSize(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
): CommandObject {
    return {
        values,
        options,
        keyword: "fontSize",
        template: "$px",
    };
}

export function backgroundColor(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
): CommandObject {
    return {
        values,
        options,
        keyword: "backgroundColor",
        template: "$",
    };
}

export function rotate(
    values: string | number | (string | number)[],
    options?: AllowedEffectTiming
): CommandObject {
    return {
        values,
        options,
        keyword: "transform",
        template: "rotate($)",
    };
}
