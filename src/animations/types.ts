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
