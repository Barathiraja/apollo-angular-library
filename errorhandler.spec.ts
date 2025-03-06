import { ApolloLink, FetchResult, NextLink, Observable, Operation } from '@apollo/client/core';
import { GraphQLErrorHandler } from './error-handler';

describe('GraphQLErrorHandler', () => {
  let errorHandler: GraphQLErrorHandler;
  let mockForward: NextLink;
  let mockOperation: Operation;

  beforeEach(() => {
    errorHandler = new GraphQLErrorHandler();
    mockForward = jest.fn().mockImplementation(() => new Observable());
    mockOperation = {
      operationName: 'TestQuery',
      variables: {},
      extensions: {},
      query: {} as any,
      getContext: jest.fn(),
      setContext: jest.fn(),
      toKey: jest.fn(),
    };
  });

  it('should forward the request and pass data if no errors occur', (done) => {
    const mockResult: FetchResult = { data: { message: 'Success' } };

    mockForward = jest.fn().mockReturnValue(new Observable((observer) => {
      observer.next(mockResult);
      observer.complete();
    }));

    errorHandler.request(mockOperation, mockForward).subscribe({
      next: (result) => {
        expect(result).toEqual(mockResult);
        done();
      },
      error: () => fail('Should not call error'),
    });

    expect(mockForward).toHaveBeenCalledWith(mockOperation);
  });

  it('should pass GraphQL errors to the observer', (done) => {
    const mockGraphQLErrors = [{ message: 'GraphQL Error', extensions: { code: 'FORBIDDEN' } }];

    mockForward = jest.fn().mockReturnValue(new Observable((observer) => {
      observer.next({ errors: mockGraphQLErrors });
      observer.complete();
    }));

    errorHandler.request(mockOperation, mockForward).subscribe({
      next: () => fail('Should not call next'),
      error: (error) => {
        expect(error).toEqual(mockGraphQLErrors);
        done();
      },
    });

    expect(mockForward).toHaveBeenCalledWith(mockOperation);
  });

  it('should pass network errors to the observer', (done) => {
    const mockNetworkError = new Error('Network failure');

    mockForward = jest.fn().mockReturnValue(new Observable((observer) => {
      observer.error(mockNetworkError);
    }));

    errorHandler.request(mockOperation, mockForward).subscribe({
      next: () => fail('Should not call next'),
      error: (error) => {
        expect(error).toEqual(mockNetworkError);
        done();
      },
    });

    expect(mockForward).toHaveBeenCalledWith(mockOperation);
  });
});
