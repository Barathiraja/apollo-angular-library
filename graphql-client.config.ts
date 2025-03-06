import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, ApolloLink, from, NormalizedCacheObject } from '@apollo/client/core';
import { GraphQLErrorHandler } from './middleware/error-handler';

export function provideGraphqlClient(options: ApolloClientOptions<NormalizedCacheObject>) {
  return [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (): ApolloClientOptions<NormalizedCacheObject> => {
        // Ensure the consuming app's link passes through our error handler first
        const errorMiddleware = new GraphQLErrorHandler();
        const link: ApolloLink = options.link ? from([errorMiddleware, options.link]) : errorMiddleware;

        return {
          ...options,
          link,
        };
      },
    },
  ];
}
