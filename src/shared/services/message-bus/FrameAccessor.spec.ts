import { FrameIdentifier } from './FrameIdentifier';
import { FrameAccessor } from './FrameAccessor';
import { instance, mock, when } from 'ts-mockito';
import { FrameCollection } from './interfaces/FrameCollection';
import { FrameNotFound } from './errors/FrameNotFound';

describe('FrameAccessor', () => {
  let identifierMock: FrameIdentifier;
  let windowMock: Window;
  let windowInstance: Window;
  let accessor: FrameAccessor;

  beforeEach(() => {
    identifierMock = mock(FrameIdentifier);
    windowMock = mock<Window>();
    windowInstance = instance(windowMock);
    accessor = new FrameAccessor(instance(identifierMock), windowInstance);
  });

  describe('getParentFrame', () => {
    it('returns current window if the current window is the parent frame', () => {
      when(identifierMock.isParentFrame()).thenReturn(true);

      expect(accessor.getParentFrame()).toBe(windowInstance);
    });

    it('returns parent frame if the current window is not the parent frame', () => {
      const parentFrame: Window = instance(mock(Window));
      when(windowMock.parent).thenReturn(parentFrame);
      when(identifierMock.isParentFrame()).thenReturn(false);

      expect(accessor.getParentFrame()).toBe(parentFrame);
    });
  });

  describe('hasFrame() and getFrame()', () => {
    let parentFrameMock: Window;
    let parentFrameInstance: Window;
    let foobarFrameMock: Window;
    let foobarFrameInstance: Window;
    let frameCollection: FrameCollection;

    beforeEach(() => {
      parentFrameMock = mock<Window>();
      parentFrameInstance = instance(parentFrameMock);
      foobarFrameMock = mock<Window>();
      foobarFrameInstance = instance(foobarFrameMock);
      frameCollection = ([foobarFrameInstance] as unknown) as FrameCollection;
      frameCollection.foobar = foobarFrameInstance;

      when(parentFrameMock.frames).thenReturn(frameCollection);
      when(windowMock.parent).thenReturn(parentFrameInstance);
      when(identifierMock.isParentFrame()).thenReturn(false);
    });

    it('tells if the frame with given name exists', () => {
      expect(accessor.hasFrame('foobar')).toBe(true);
      expect(accessor.hasFrame('nonexistingframe')).toBe(false);
    });

    it('returns the frame with given name', () => {
      expect(accessor.getFrame('foobar')).toBe(foobarFrameInstance);
    });

    it('throws an error if the frame with given name doesnt exist', () => {
      expect(() => accessor.getFrame('nonexistingframe')).toThrow(
        new FrameNotFound('Target frame "nonexistingframe" not found.')
      );
    });
  });
});
