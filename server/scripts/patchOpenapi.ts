/* eslint-disable */

import { promises as fs } from 'fs';
import { flatMap, fromPairs } from 'lodash';
import { join } from 'path';
import prettier from 'prettier';
import documentation from '../extensions/documentation/documentation/1.0.0/full_documentation.json';

const paramFilters = [
  {
    name: '=',
    in: 'query',
    required: false,
    description: 'Get entries that matches exactly your input',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_ne',
    in: 'query',
    required: false,
    description: 'Get records that are not equals to something',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_lt',
    in: 'query',
    required: false,
    description: 'Get record that are lower than a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_lte',
    in: 'query',
    required: false,
    description: 'Get records that are lower than or equal to a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_gt',
    in: 'query',
    required: false,
    description: 'Get records that are greater than a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_gte',
    in: 'query',
    required: false,
    description: 'Get records that are greater than  or equal a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_contains',
    in: 'query',
    required: false,
    description: 'Get records that contains a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_containss',
    in: 'query',
    required: false,
    description: 'Get records that contains (case sensitive) a value',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_in',
    in: 'query',
    required: false,
    description: 'Get records that matches any value in the array of values',
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
  {
    name: '_nin',
    in: 'query',
    required: false,
    description:
      "Get records that doesn't match any value in the array of values",
    schema: {
      type: 'string',
    },
    deprecated: false,
  },
];
const filters = paramFilters.map(({ name }) => name);

const correctedParamFilters = [
  { ...paramFilters[0], name: '_eq' },
  ...paramFilters.slice(1),
];

const getSchemaKey = (ref: string) => ref.split('/').pop();

(async () => {
  const { paths, ...rest } = documentation;

  const patchedPaths = fromPairs(
    Object.entries(paths).map((entry) => {
      const [key, path] = entry;
      if ('get' in path && path.get.parameters.length) {
        const {
          get: { parameters, ...get },
          ...rest
        } = path;

        const {
          responses: {
            [200]: {
              content: {
                ['application/json']: { schema },
              },
            },
          },
        } = get;

        const schemaKey =
          '$ref' in schema
            ? getSchemaKey(schema.$ref)
            : 'items' in schema
            ? getSchemaKey(schema.items.$ref)
            : '';

        return [
          key,
          {
            ...rest,
            get: {
              ...get,
              parameters: schemaKey
                ? parameters
                    .filter((param) => !filters.includes(param.name))
                    .concat(
                      flatMap(
                        Object.keys(
                          documentation.components.schemas[
                            schemaKey as keyof typeof documentation.components.schemas
                          ].properties,
                        ),
                        (prop) =>
                          correctedParamFilters.map((paramFilter) => ({
                            ...paramFilter,
                            name: `${prop}${paramFilter.name}`,
                          })),
                      ),
                    )
                : parameters,
            },
          },
        ];
      } else {
        return entry;
      }
    }),
  );

  const patchedDocumentation = { ...rest, paths: patchedPaths };

  await fs.writeFile(
    join(
      __dirname,
      '..',
      'extensions',
      'documentation',
      'documentation',
      '1.0.0',
      'full_documentation.json',
    ),
    prettier.format(JSON.stringify(patchedDocumentation), { parser: 'json' }),
  );
})();
