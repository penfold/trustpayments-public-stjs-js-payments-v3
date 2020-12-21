import { Container } from 'typedi';
import { ConfigProvider } from '../../shared/services/config-provider/ConfigProvider';
import { StoreConfigProvider } from '../core/services/store-config-provider/StoreConfigProvider';
import { IThreeDVerificationService } from '../core/services/three-d-verification/IThreeDVerificationService';
import { CardinalCommerceVerificationService } from '../core/services/three-d-verification/implementations/CardinalCommerceVerificationService';
import '../../shared/dependency-injection/ServiceDefinitions';

Container.set({ id: ConfigProvider, type: StoreConfigProvider });
Container.set({ id: IThreeDVerificationService, type: CardinalCommerceVerificationService });
