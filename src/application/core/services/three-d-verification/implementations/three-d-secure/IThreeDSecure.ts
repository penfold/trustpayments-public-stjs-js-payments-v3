import { LoggingLevel, ChallengeDisplayMode } from '3ds-sdk-js';

export const threeDSecureConfigName = 'threeDSecure';

export interface IThreeDSecureConfig {
  loggingLevel: LoggingLevel;
  challengeDisplayMode: ChallengeDisplayMode;
  challengeDisplayInlineTargetElementId?: string;
}
