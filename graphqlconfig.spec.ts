import { APOLLO_OPTIONS } from 'apollo-angular';
import { ApolloClientOptions, ApolloLink, InMemoryCache, NormalizedCacheObject, from, HttpLink } from '@apollo/client/core';
import { provideGraphqlClient } from './graphql-client.config';
import { GraphQLErrorHandler } from './middleware/error-handler';

describe('provideGraphqlClient', () => {
  it('should include error middleware when link is provided', () => {
    const mockLink = new HttpLink({ uri: 'https://mock-api.com/graphql' });
    const options: ApolloClientOptions<NormalizedCacheObject> = {
      link: mockLink,
      cache: new InMemoryCache(),
    };

    const providers = provideGraphqlClient(options);
    const provider = providers.find((p) => p.provide === APOLLO_OPTIONS);

    expect(provider).toBeDefined();
    expect(provider?.useFactory).toBeDefined();

    const finalOptions = provider?.useFactory();
    expect(finalOptions.link).toBeDefined();
    expect(finalOptions.link).toBeInstanceOf(ApolloLink);
  });

  it('should use only the error middleware when no link is provided', () => {
    const options: ApolloClientOptions<NormalizedCacheObject> = {
      cache: new InMemoryCache(),
    };

    const providers = provideGraphqlClient(options);
    const provider = providers.find((p) => p.provide === APOLLO_OPTIONS);

    expect(provider).toBeDefined();
    expect(provider?.useFactory).toBeDefined();

    const finalOptions = provider?.useFactory();
    expect(finalOptions.link).toBeInstanceOf(GraphQLErrorHandler);
  });
});
