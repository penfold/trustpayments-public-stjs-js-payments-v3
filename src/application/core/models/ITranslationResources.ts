interface ISingleTranslation {
  [translation: string]: ResourceKey;
}

type ResourceKey =
  | string
  | {
      [key: string]: any;
    };

export interface IResources {
  [index: string]: ISingleTranslation;
}
