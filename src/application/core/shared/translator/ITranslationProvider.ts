import { Service } from 'typedi';
import { IResources } from '../../models/ITranslationResources';

@Service()
export abstract class ITranslationProvider {
  abstract getResources(): IResources;
}
