import { Logger } from 'typescript-template-language-service-decorator';

let instance: KVStore;

// TODO: Could we configure the cache size?

/**
 * Simple key-value store for caching data.
 * @example
 * Caching the completions of global attributes which are the same for evert element
 * and therefore do not need to be calculated every time.
 */
class KVStore {
  constructor(private logger: Logger) {
    this.logger.log('Setting up KVStore');
  }

  private store = new Map<string, unknown>();

  /**
   * Clear the cache.
   * @remarks Call this if any of the underlying data which is cached is now out of sync.
   */
  clearCache(): void {
    this.logger.log('Clearing KVStore cache');
    this.store.clear();
  }

  /**
   * Type-safe getOrAdd method.
   * @param key The key to get or add.
   * @param factory The factory function to create the value if it does not exist.
   * @returns the value for the key.
   */
  getOrAdd(key: string, factory: () => unknown): unknown {
    if (!this.store.has(key)) {
      this.store.set(key, factory());
    }
    return this.store.get(key);
  }

  /**
   * Type-unsafe getOrAdd method.
   * @remarks
   * Will break type checking if you use the same key for a function with a different return type.
   * This method is still runtime safe as it still has a factory function to generate a missing cache entry.
   * @param key The key to get or add.
   * @param factory The factory function to create the value if it does not exist.
   * @returns the value for the key.
   */
  TSUnsafeGetOrAdd<T>(key: string, factory: () => T): T {
    return this.getOrAdd(key, factory) as T;
  }
}

export const getStore = (logger: Logger) =>
  instance ?? ((instance = new KVStore(logger)), instance);
