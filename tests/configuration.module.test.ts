import { Injectable } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { ConfigurationError, ConfigurationModule, restoreConfiguration } from '@newtral-tech/nestjs-configuration';
import { expect } from 'chai';
import faker from 'faker';
import { promises as fs } from 'fs';
import path from 'path';

describe('ConfigurationModule', () => {
  const directory = process.cwd();

  beforeEach(restoreEnv);
  afterEach(restoreEnv);
  afterEach(() => process.chdir(directory));
  beforeEach(cleanEnvFiles);
  afterEach(cleanEnvFiles);

  it('should not throw any error when the configuration is not instantiated through nestjs', async () => {
    expect(() => {
      // TEST_CONFIG is required but it is not set
      const { InjectConfiguration } = ConfigurationModule.forEnvironment({
        type: 'object',
        properties: { TEST_CONFIG: { type: 'integer' } },
        required: ['TEST_CONFIG']
      });

      @Injectable()
      class TestService {
        constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
      }

      new TestService('test');
    }).to.not.throw(ConfigurationError);
  });

  it('should throw a configuration error when the configuration is invalid (required configuration)', async () => {
    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'integer' } },
      required: ['TEST_CONFIG']
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    await expect(
      Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile()
    ).to.eventually.be.rejectedWith(ConfigurationError);
  });

  it('should throw a configuration error when the configuration is invalid', async () => {
    // TEST_CONFIG is integer but we pass a string
    process.env.TEST_CONFIG = faker.random.uuid();

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'integer' } },
      required: ['TEST_CONFIG']
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    await expect(
      Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile()
    ).to.eventually.be.rejectedWith(ConfigurationError);
  });

  it('should be able to inject the whole configuration', async () => {
    const testConfig = faker.random.uuid();
    process.env.TEST_CONFIG = testConfig;

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration() readonly testConfig: { TEST_CONFIG: string }) {}
    }

    const moduleRef = await Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile();
    const testService = moduleRef.get(TestService);

    expect(testService.testConfig).to.be.an('object');
    expect(testService.testConfig.TEST_CONFIG).to.be.equal(testConfig);
  });

  it('should be able to inject a single configuration item', async () => {
    const testConfig = faker.random.uuid();
    process.env.TEST_CONFIG = testConfig;

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    const moduleRef = await Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile();
    const testService = moduleRef.get(TestService);

    expect(testService.testConfig).to.be.equal(testConfig);
  });

  it('should load the configuration from a .env file', async () => {
    process.chdir(__dirname);
    const testConfig = faker.random.uuid();
    await fs.writeFile('.env', `TEST_CONFIG=${testConfig}`);

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    const moduleRef = await Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile();
    const testService = moduleRef.get(TestService);

    expect(testService.testConfig).to.be.equal(testConfig);
  });

  it('should load the configuration from a .env.[environment] file', async () => {
    process.env.NODE_ENV = 'test2';
    process.chdir(__dirname);

    const testConfig = faker.random.uuid();
    await fs.writeFile('.env', `TEST_CONFIG=${faker.random.uuid()}`);
    await fs.writeFile('.env.test2', `TEST_CONFIG=${testConfig}`);

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    const moduleRef = await Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile();
    const testService = moduleRef.get(TestService);

    expect(testService.testConfig).to.be.equal(testConfig);
  });

  it('should preserve the specific environment configuration when both are set', async () => {
    process.env.NODE_ENV = 'test2';
    process.chdir(__dirname);

    const testConfig = faker.random.uuid();
    await fs.writeFile('.env.test2', `TEST_CONFIG=${testConfig}`);

    const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    @Injectable()
    class TestService {
      constructor(@InjectConfiguration('TEST_CONFIG') readonly testConfig: string) {}
    }

    const moduleRef = await Test.createTestingModule({ imports: [configurationModule], providers: [TestService] }).compile();
    const testService = moduleRef.get(TestService);

    expect(testService.testConfig).to.be.equal(testConfig);
  });

  it('should generate an object containing the configuration injection tokens', async () => {
    process.env.TEST_CONFIG = faker.random.uuid();

    const { tokens } = ConfigurationModule.forEnvironment({
      type: 'object',
      properties: { TEST_CONFIG: { type: 'string' } }
    });

    expect(tokens.TEST_CONFIG).to.be.a('symbol');
  });
});

function cleanEnvFiles() {
  return Promise.all(['.env', '.env.test2'].map(file => path.join(__dirname, file)).map(file => fs.writeFile(file, '')));
}

function restoreEnv() {
  delete process.env.TEST_CONFIG;
  restoreConfiguration();
}
