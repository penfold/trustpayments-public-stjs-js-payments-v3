interface ISingleTranslation {
  [translation: string]: ResourceKey;
}

type ResourceKey =
  string
  | {
      [key: string]: string;
    };

export interface IResources {
  [index: string]: ISingleTranslation;
}
