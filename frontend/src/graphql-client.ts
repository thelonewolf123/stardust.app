import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
const defaultOptions = {} as const;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
};

export type BuildArgsInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Container = {
  __typename?: 'Container';
  command?: Maybe<Array<Scalars['String']>>;
  containerSlug: Scalars['String'];
  env?: Maybe<Array<Env>>;
  image: Scalars['String'];
  metaData?: Maybe<Array<MetaData>>;
  port?: Maybe<Scalars['Int']>;
  status: ContainerStatus;
};

export type ContainerInput = {
  command?: InputMaybe<Array<Scalars['String']>>;
  ecrRepo: Scalars['String'];
  env?: InputMaybe<Array<EnvInput>>;
  metaData?: InputMaybe<Array<MetaDataInput>>;
  port?: InputMaybe<Scalars['Int']>;
};

export enum ContainerStatus {
  Checkpoint = 'checkpoint',
  Failed = 'failed',
  Pending = 'pending',
  Running = 'running',
  Terminated = 'terminated'
}

export type Env = {
  __typename?: 'Env';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type EnvInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createContainer: Scalars['Boolean'];
  createProject: Scalars['String'];
  deleteProject: Scalars['Boolean'];
  refreshProject: Scalars['Boolean'];
  roleBackProject: Scalars['Boolean'];
  signup: Scalars['String'];
  startContainer: Scalars['Boolean'];
  stopContainer: Scalars['Boolean'];
};


export type MutationCreateContainerArgs = {
  input: ContainerInput;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationDeleteProjectArgs = {
  slug: Scalars['String'];
};


export type MutationRefreshProjectArgs = {
  input: RefreshProjectInput;
};


export type MutationRoleBackProjectArgs = {
  slug: Scalars['String'];
  version: Scalars['Int'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
};


export type MutationStartContainerArgs = {
  projectSlug: Scalars['String'];
};


export type MutationStopContainerArgs = {
  projectSlug: Scalars['String'];
};

export type Project = {
  __typename?: 'Project';
  createdAt: Scalars['Float'];
  current?: Maybe<Container>;
  description: Scalars['String'];
  dockerContext: Scalars['String'];
  dockerPath: Scalars['String'];
  githubBranch: Scalars['String'];
  githubUrl: Scalars['String'];
  history?: Maybe<Array<Container>>;
  name: Scalars['String'];
  slug: Scalars['String'];
};

export type ProjectInput = {
  buildArgs?: InputMaybe<Array<BuildArgsInput>>;
  description: Scalars['String'];
  dockerContext: Scalars['String'];
  dockerPath: Scalars['String'];
  env?: InputMaybe<Array<EnvInput>>;
  githubBranch: Scalars['String'];
  githubUrl: Scalars['String'];
  metaData?: InputMaybe<Array<MetaDataInput>>;
  name: Scalars['String'];
  port?: InputMaybe<Scalars['Int']>;
};

export type Query = {
  __typename?: 'Query';
  getAllContainers: Array<Container>;
  getAllProjects: Array<Project>;
  getBuildLogs: Array<Scalars['String']>;
  getContainerInfo: Container;
  getNotRunningProjects: Array<Project>;
  getProjectBySlug: Project;
  getRunningProjects: Array<Project>;
  login: Scalars['String'];
  logout: Scalars['Boolean'];
};


export type QueryGetBuildLogsArgs = {
  containerSlug: Scalars['String'];
};


export type QueryGetContainerInfoArgs = {
  slug: Scalars['String'];
};


export type QueryGetProjectBySlugArgs = {
  slug: Scalars['String'];
};


export type QueryLoginArgs = {
  password: Scalars['String'];
  username: Scalars['String'];
};

export type RefreshProjectInput = {
  buildArgs?: InputMaybe<Array<BuildArgsInput>>;
  description: Scalars['String'];
  dockerContext?: InputMaybe<Scalars['String']>;
  dockerPath?: InputMaybe<Scalars['String']>;
  env?: InputMaybe<Array<EnvInput>>;
  githubBranch?: InputMaybe<Scalars['String']>;
  githubUrl?: InputMaybe<Scalars['String']>;
  metaData?: InputMaybe<Array<MetaDataInput>>;
  name: Scalars['String'];
  port?: InputMaybe<Scalars['Int']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['Float'];
  email: Scalars['String'];
  username: Scalars['String'];
};

export type MetaData = {
  __typename?: 'metaData';
  name: Scalars['String'];
  value: Scalars['String'];
};

export type MetaDataInput = {
  name: Scalars['String'];
  value: Scalars['String'];
};

export type LoginQueryQueryVariables = Exact<{
  username: Scalars['String'];
  password: Scalars['String'];
}>;


export type LoginQueryQuery = { __typename?: 'Query', login: string };

export type GetProjectBySlugQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetProjectBySlugQuery = { __typename?: 'Query', getProjectBySlug: { __typename?: 'Project', createdAt: number, description: string, dockerContext: string, dockerPath: string, githubBranch: string, githubUrl: string, slug: string, name: string, current?: { __typename?: 'Container', command?: Array<string> | null, containerSlug: string, image: string, port?: number | null, status: ContainerStatus, env?: Array<{ __typename?: 'Env', name: string, value: string }> | null, metaData?: Array<{ __typename?: 'metaData', name: string, value: string }> | null } | null, history?: Array<{ __typename?: 'Container', containerSlug: string }> | null } };

export type GetAllProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllProjectsQuery = { __typename?: 'Query', getAllProjects: Array<{ __typename?: 'Project', createdAt: number, description: string, dockerContext: string, dockerPath: string, githubBranch: string, githubUrl: string, slug: string, name: string, current?: { __typename?: 'Container', command?: Array<string> | null, containerSlug: string, image: string, port?: number | null, status: ContainerStatus, env?: Array<{ __typename?: 'Env', name: string, value: string }> | null, metaData?: Array<{ __typename?: 'metaData', name: string, value: string }> | null } | null, history?: Array<{ __typename?: 'Container', containerSlug: string }> | null }> };

export type SignupMutaionMutationVariables = Exact<{
  username: Scalars['String'];
  email: Scalars['String'];
  password: Scalars['String'];
}>;


export type SignupMutaionMutation = { __typename?: 'Mutation', signup: string };


export const LoginQueryDocument = gql`
    query LoginQuery($username: String!, $password: String!) {
  login(username: $username, password: $password)
}
    `;

/**
 * __useLoginQueryQuery__
 *
 * To run a query within a React component, call `useLoginQueryQuery` and pass it any options that fit your needs.
 * When your component renders, `useLoginQueryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useLoginQueryQuery({
 *   variables: {
 *      username: // value for 'username'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useLoginQueryQuery(baseOptions: Apollo.QueryHookOptions<LoginQueryQuery, LoginQueryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<LoginQueryQuery, LoginQueryQueryVariables>(LoginQueryDocument, options);
      }
export function useLoginQueryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<LoginQueryQuery, LoginQueryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<LoginQueryQuery, LoginQueryQueryVariables>(LoginQueryDocument, options);
        }
export type LoginQueryQueryHookResult = ReturnType<typeof useLoginQueryQuery>;
export type LoginQueryLazyQueryHookResult = ReturnType<typeof useLoginQueryLazyQuery>;
export type LoginQueryQueryResult = Apollo.QueryResult<LoginQueryQuery, LoginQueryQueryVariables>;
export const GetProjectBySlugDocument = gql`
    query GetProjectBySlug($slug: String!) {
  getProjectBySlug(slug: $slug) {
    createdAt
    current {
      command
      containerSlug
      env {
        name
        value
      }
      image
      metaData {
        name
        value
      }
      port
      status
    }
    description
    dockerContext
    dockerPath
    githubBranch
    githubUrl
    history {
      containerSlug
    }
    slug
    name
  }
}
    `;

/**
 * __useGetProjectBySlugQuery__
 *
 * To run a query within a React component, call `useGetProjectBySlugQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectBySlugQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectBySlugQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetProjectBySlugQuery(baseOptions: Apollo.QueryHookOptions<GetProjectBySlugQuery, GetProjectBySlugQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectBySlugQuery, GetProjectBySlugQueryVariables>(GetProjectBySlugDocument, options);
      }
export function useGetProjectBySlugLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectBySlugQuery, GetProjectBySlugQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectBySlugQuery, GetProjectBySlugQueryVariables>(GetProjectBySlugDocument, options);
        }
export type GetProjectBySlugQueryHookResult = ReturnType<typeof useGetProjectBySlugQuery>;
export type GetProjectBySlugLazyQueryHookResult = ReturnType<typeof useGetProjectBySlugLazyQuery>;
export type GetProjectBySlugQueryResult = Apollo.QueryResult<GetProjectBySlugQuery, GetProjectBySlugQueryVariables>;
export const GetAllProjectsDocument = gql`
    query GetAllProjects {
  getAllProjects {
    createdAt
    current {
      command
      containerSlug
      env {
        name
        value
      }
      image
      metaData {
        name
        value
      }
      port
      status
    }
    description
    dockerContext
    dockerPath
    githubBranch
    githubUrl
    history {
      containerSlug
    }
    slug
    name
  }
}
    `;

/**
 * __useGetAllProjectsQuery__
 *
 * To run a query within a React component, call `useGetAllProjectsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllProjectsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllProjectsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllProjectsQuery(baseOptions?: Apollo.QueryHookOptions<GetAllProjectsQuery, GetAllProjectsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllProjectsQuery, GetAllProjectsQueryVariables>(GetAllProjectsDocument, options);
      }
export function useGetAllProjectsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllProjectsQuery, GetAllProjectsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllProjectsQuery, GetAllProjectsQueryVariables>(GetAllProjectsDocument, options);
        }
export type GetAllProjectsQueryHookResult = ReturnType<typeof useGetAllProjectsQuery>;
export type GetAllProjectsLazyQueryHookResult = ReturnType<typeof useGetAllProjectsLazyQuery>;
export type GetAllProjectsQueryResult = Apollo.QueryResult<GetAllProjectsQuery, GetAllProjectsQueryVariables>;
export const SignupMutaionDocument = gql`
    mutation SignupMutaion($username: String!, $email: String!, $password: String!) {
  signup(username: $username, email: $email, password: $password)
}
    `;
export type SignupMutaionMutationFn = Apollo.MutationFunction<SignupMutaionMutation, SignupMutaionMutationVariables>;

/**
 * __useSignupMutaionMutation__
 *
 * To run a mutation, you first call `useSignupMutaionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignupMutaionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signupMutaionMutation, { data, loading, error }] = useSignupMutaionMutation({
 *   variables: {
 *      username: // value for 'username'
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useSignupMutaionMutation(baseOptions?: Apollo.MutationHookOptions<SignupMutaionMutation, SignupMutaionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignupMutaionMutation, SignupMutaionMutationVariables>(SignupMutaionDocument, options);
      }
export type SignupMutaionMutationHookResult = ReturnType<typeof useSignupMutaionMutation>;
export type SignupMutaionMutationResult = Apollo.MutationResult<SignupMutaionMutation>;
export type SignupMutaionMutationOptions = Apollo.BaseMutationOptions<SignupMutaionMutation, SignupMutaionMutationVariables>;