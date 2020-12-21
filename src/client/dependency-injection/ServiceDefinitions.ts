import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { ConfigService } from '../../shared/services/config-service/ConfigService';
import { PreventNavigationPopup } from '../message-subscribers/PreventNavigationPopup';
import '../../shared/dependency-injection/ServiceDefinitions';

Container.set({ id: ConfigProvider, factory: () => Container.get(ConfigService) });
Container.import([PreventNavigationPopup]);
