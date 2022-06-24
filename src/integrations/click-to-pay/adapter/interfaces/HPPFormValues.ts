import { HPPFormFieldName } from '../hpp-adapter/HPPFormFieldName';
import { NewCardFieldName } from '../../card-list/NewCardFieldName';

export type HPPFormValues = Record<HPPFormFieldName | NewCardFieldName, string>
