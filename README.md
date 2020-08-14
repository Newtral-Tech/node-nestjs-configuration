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

Git hooks scripts are installed after running `yarn` the first time

### yarn build:commonjs

Compile typescript files from the `src` folder inside the `lib` folder

### yarn build:esm

Compile typescript files from the `src` folder inside the `esm` folder using es modules

### yarn build

Concurrently run both `build:commonjs` and `build:esm`

### yarn clean

Remove the following directories/files

- **lib**
- **esm**
- **reports**

### yarn test

Run tests files inside the `tests` folder that matches the following patterns. Exit with code > 0 on
error

- **\*.test.ts**
- **\*.spec.ts**

### yarn cover

The same as as `yarn test` and generates coverages reports in `reports/coverage`. Exit with code > 0
on error

### yarn lint

Check eslint errors according to `.eslintrc`

### yarn lint:fix

Run `yarn lint` applying fixes and run prettier on every typescript file

### yarn health

Check for:

- Build errors
- Tests failures
- Lint errors

### yarn ci

Run test and generate every possible report. Do not exit with error code > 0 if the tests fail. It
generates a report file instead

- **reports/lint-checkstyle.xml** Lint report in chackstyle format
- **reports/test-results.xml** Test report in xUnit format
- **reports/coverage/clover.xml** Coverage report in clover format
- **reports/coverage/cobertura-coverage.xml** Coverage report in cobertura format
- **reports/coverage/lcov.info** Coverage report in lcov
- **reports/coverage/index.html** Coverage report in html
