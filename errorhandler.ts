import { ApolloLink, FetchResult, NextLink, Observable, Operation } from '@apollo/client/core';

export class GraphQLErrorHandler extends ApolloLink {
  override request(operation: Operation, forward: NextLink): Observable<FetchResult<unknown>> {
    return new Observable<FetchResult<unknown>>((observer) => {
      const subscription = forward(operation).subscribe({
        next: (result: FetchResult<unknown>) => {
          if (result.errors) {
            // Pass GraphQL errors to the observer for the consuming app to handle
            observer.error(result.errors);
          } else {
            observer.next(result);
          }
        },
        error: (networkError: unknown) => {
          // Pass network errors to the observer for the consuming app to handle
          observer.error(networkError);
        },
        complete: () => observer.complete(),
      });

      return () => subscription.unsubscribe();
    });
  }
}
