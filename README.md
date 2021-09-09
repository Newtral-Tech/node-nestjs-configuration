# @newtral-tech/nestjs-configuration

## Usage

Assume you have the following `.env` file. The `.env` file is loaded into an object using the
[dotenv](https://www.npmjs.com/package/dotenv) package.

```txt
USER_EXTERNAL_ENDPOINT=https://api.exaple.com/users
```

```typescript
import { ConfigurationModule } from '@newtral-tech/nestjs-configuration';
import { Injectable, Module } from '@nestjs/common';

// Define a valid JSON schema for your configuration object.
const schema = {
  type: 'object',
  properties: {
    USER_EXTERNAL_ENDPOINT: { type: 'string' }
  },
  required: ['USER_EXTERNAL_ENDPOINT']
};

const { InjectConfiguration, configurationModule } = ConfigurationModule.forEnvironment(schema);

@Injectable()
class UserService {
  constructor(@InjectConfiguration('USER_EXTERNAL_ENDPOINT') private readonly endpoint: string) {}
}

@Module({
  imports: [configurationModule],
  providers: [UserService]
})
class AppModule {}
```

### ConfigurationModule.forEnvironment(schema: JSONSchema7)

- **schema**: A valid JSON Schema v7

### InjectConfiguration(configurationKey?: string)

- When no `configurationKey` is provided the whole configuration object is injected
- When the `configurationKey` is provided the only the selected configuration key is injected

## Development

The project use [husky](https://github.com/typicode/husky) and
[lint-staged](https://github.com/okonet/lint-staged) for linting and fixing possible errors on
source code before commit

Git hooks scripts are installed after running `npm install` the first time

### npm run build:commonjs

Compile typescript files from the `src` folder inside the `lib` folder

### npm run build:esm

Compile typescript files from the `src` folder inside the `esm` folder using es modules

### npm run build

Concurrently run both `build:commonjs` and `build:esm`

### npm run clean

Remove the following directories/files

- **lib**
- **esm**
- **reports**

### npm test

Run tests files inside the `tests` folder that matches the following patterns. Exit with code > 0 on
error

- **\*.test.ts**
- **\*.spec.ts**

### npm run cover

The same as `npm test` and generates coverages reports in `reports/coverage`. Exit with code > 0 on
error

### npm run lint

Check eslint errors according to `.eslintrc`

### npm run lint:fix

Run `npm run lint` applying fixes and run prettier on every typescript file

### npm run health

Check for:

- Build errors
- Tests failures
- Lint errors

### npm run ci

Run test and generate every possible report. Do not exit with error code > 0 if the tests fail. It
generates a report file instead

- **reports/lint-checkstyle.xml** Lint report in chackstyle format
- **reports/test-results.xml** Test report in xUnit format
- **reports/coverage/clover.xml** Coverage report in clover format
- **reports/coverage/cobertura-coverage.xml** Coverage report in cobertura format
- **reports/coverage/lcov.info** Coverage report in lcov
- **reports/coverage/index.html** Coverage report in html
