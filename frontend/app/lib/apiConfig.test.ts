import { describe, it, expect } from 'vitest';
import { createApiConfig } from '~/lib/apiConfig';

describe('createApiConfig', () => {
  it('should return configuration with correct basePath', () => {
    const config = createApiConfig();

    expect(config.basePath).toBe('http://localhost:8080');
  });

  it('should set credentials to include for cookie auth', () => {
    const config = createApiConfig();

    expect(config.credentials).toBe('include');
  });
});
