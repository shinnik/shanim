export type StringPropertiesOnly<T> = {
    [P in keyof T as P extends string
        ? T[P] extends string | number
            ? P
            : never
        : never]: T[P];
};

export type AllowedEffectTiming = Omit<EffectTiming, "fill">;

export type Keyword = Exclude<
    keyof StringPropertiesOnly<ElementCSSInlineStyle["style"]>,
    "length" | "parentRule"
>;

export type ShanimOptions = {
    /** Use to apply first keyframe immediately */
    init: boolean;
};

/** Abstraction for command creation */
export type CommandObject = {
    values: string[];
    /** TEMPORARY FOR TEST */
    keyframes?: Keyframe[];
    keyword: Keyword;
    template: string;
    options?: AllowedEffectTiming;
    shanimOptions?: ShanimOptions;
};
