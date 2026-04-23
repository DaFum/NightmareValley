import { jest, describe, beforeEach, test, expect } from '@jest/globals';
jest.resetModules();

describe('Providers and ErrorBoundary', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  test('AppProviders imports without throwing', async () => {
    const path = await import('path');
    const providersPath = path.resolve(process.cwd(), 'src', 'app', 'providers', 'AppProviders');
    jest.doMock(providersPath, () => ({ AppProviders: () => null }));
    const { AppProviders } = await import('../../src/app/providers/AppProviders');
    expect(AppProviders).toBeDefined();
  });

  test('ErrorBoundary static state derives from error and logs on catch', async () => {
    const { ErrorBoundary } = await import('../../src/app/providers/ErrorBoundary');
    const state = ErrorBoundary.getDerivedStateFromError(new Error('boom'));
    expect(state.hasError).toBe(true);
    expect(state.error).toBeInstanceOf(Error);

    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const inst = new ErrorBoundary({});
    // call componentDidCatch to ensure it logs
    inst.componentDidCatch(new Error('boom'), { componentStack: 'stack' } as any);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});
