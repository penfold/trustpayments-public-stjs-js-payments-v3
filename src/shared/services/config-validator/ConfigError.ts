import { Service } from 'typedi';

@Service()
export class ConfigError extends Error {}
