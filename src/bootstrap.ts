import { Container, ContainerInstance } from 'typedi';
import { WINDOW } from './shared/dependency-injection/InjectionTokens';

if (!Container.has(WINDOW)) {
  Container.set(WINDOW, window);
}

if (!Container.has(ContainerInstance)) {
  Container.set(ContainerInstance, Container.of(undefined));
}
