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
  buildArgs?: Maybe<Array<BuildArgs>>;
  command?: Maybe<Array<Scalars['String']>>;
  containerSlug: Scalars['String'];
  createdAt: Scalars['Float'];
  env?: Maybe<Array<Env>>;
  image: Scalars['String'];
  metaData?: Maybe<Array<MetaData>>;
  port?: Maybe<Scalars['Int']>;
  status: ContainerStatus;
  terminatedAt?: Maybe<Scalars['Float']>;
  updatedAt?: Maybe<Scalars['Float']>;
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
  addDomain: Scalars['Boolean'];
  createContainer: Scalars['Boolean'];
  createProject: Scalars['String'];
  deleteProject: Scalars['Boolean'];
  refreshProject: Scalars['Boolean'];
  removeDomain: Scalars['Boolean'];
  roleBackProject: Scalars['Boolean'];
  signupOrLogin: Scalars['String'];
  startContainer: Scalars['Boolean'];
  stopContainer: Scalars['Boolean'];
};


export type MutationAddDomainArgs = {
  domain: Scalars['String'];
  slug: Scalars['String'];
};


export type MutationCreateContainerArgs = {
  input: ContainerInput;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
  start: Scalars['Boolean'];
};


export type MutationDeleteProjectArgs = {
  slug: Scalars['String'];
};


export type MutationRefreshProjectArgs = {
  input: RefreshProjectInput;
  slug: Scalars['String'];
  start: Scalars['Boolean'];
  type: Scalars['String'];
};


export type MutationRemoveDomainArgs = {
  domain: Scalars['String'];
  slug: Scalars['String'];
};


export type MutationRoleBackProjectArgs = {
  slug: Scalars['String'];
  version: Scalars['Int'];
};


export type MutationSignupOrLoginArgs = {
  backend_token: Scalars['String'];
  email: Scalars['String'];
  token: Scalars['String'];
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
  domains?: Maybe<Array<Scalars['String']>>;
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
  getAllGithubBranches: Array<Scalars['String']>;
  getAllGithubRepos: Array<Scalars['String']>;
  getAllProjects: Array<Project>;
  getBuildLogs: Array<Scalars['String']>;
  getContainerInfo: Container;
  getGithubUsername: Scalars['String'];
  getNotRunningProjects: Array<Project>;
  getProjectBySlug: Project;
  getRunningProjects: Array<Project>;
  login: Scalars['String'];
  logout: Scalars['Boolean'];
};


export type QueryGetAllGithubBranchesArgs = {
  repo: Scalars['String'];
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
  backend_token: Scalars['String'];
  username: Scalars['String'];
};

export type RefreshProjectInput = {
  buildArgs?: InputMaybe<Array<BuildArgsInput>>;
  description?: InputMaybe<Scalars['String']>;
  dockerContext?: InputMaybe<Scalars['String']>;
  dockerPath?: InputMaybe<Scalars['String']>;
  env?: InputMaybe<Array<EnvInput>>;
  githubBranch?: InputMaybe<Scalars['String']>;
  githubUrl?: InputMaybe<Scalars['String']>;
  metaData?: InputMaybe<Array<MetaDataInput>>;
  name?: InputMaybe<Scalars['String']>;
  port?: InputMaybe<Scalars['Int']>;
};

export type User = {
  __typename?: 'User';
  createdAt: Scalars['Float'];
  email: Scalars['String'];
  username: Scalars['String'];
};

export type BuildArgs = {
  __typename?: 'buildArgs';
  name: Scalars['String'];
  value: Scalars['String'];
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

export type CreateProjectMutationVariables = Exact<{
  input: ProjectInput;
  start: Scalars['Boolean'];
}>;


export type CreateProjectMutation = { __typename?: 'Mutation', createProject: string };

export type RollbackProjectMutationVariables = Exact<{
  slug: Scalars['String'];
  version: Scalars['Int'];
}>;


export type RollbackProjectMutation = { __typename?: 'Mutation', roleBackProject: boolean };

export type GetDeploymentHistoryQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetDeploymentHistoryQuery = { __typename?: 'Query', getProjectBySlug: { __typename?: 'Project', slug: string, name: string, history?: Array<{ __typename?: 'Container', containerSlug: string, createdAt: number, status: ContainerStatus }> | null, current?: { __typename?: 'Container', containerSlug: string, status: ContainerStatus } | null } };

export type GetProjectBySlugQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetProjectBySlugQuery = { __typename?: 'Query', getProjectBySlug: { __typename?: 'Project', createdAt: number, description: string, dockerContext: string, dockerPath: string, githubBranch: string, githubUrl: string, domains?: Array<string> | null, slug: string, name: string, current?: { __typename?: 'Container', command?: Array<string> | null, containerSlug: string, image: string, port?: number | null, status: ContainerStatus, env?: Array<{ __typename?: 'Env', name: string, value: string }> | null, metaData?: Array<{ __typename?: 'metaData', name: string, value: string }> | null } | null, history?: Array<{ __typename?: 'Container', containerSlug: string, status: ContainerStatus }> | null } };

export type GetAllProjectsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllProjectsQuery = { __typename?: 'Query', getAllProjects: Array<{ __typename?: 'Project', createdAt: number, description: string, dockerContext: string, dockerPath: string, githubBranch: string, githubUrl: string, slug: string, name: string, current?: { __typename?: 'Container', command?: Array<string> | null, containerSlug: string, image: string, port?: number | null, status: ContainerStatus, env?: Array<{ __typename?: 'Env', name: string, value: string }> | null, metaData?: Array<{ __typename?: 'metaData', name: string, value: string }> | null } | null, history?: Array<{ __typename?: 'Container', containerSlug: string }> | null }> };

export type RefreshProjectMutationVariables = Exact<{
  slug: Scalars['String'];
  input: RefreshProjectInput;
  start: Scalars['Boolean'];
  type: Scalars['String'];
}>;


export type RefreshProjectMutation = { __typename?: 'Mutation', refreshProject: boolean };

export type GetBuildLogsQueryVariables = Exact<{
  containerSlug: Scalars['String'];
}>;


export type GetBuildLogsQuery = { __typename?: 'Query', getBuildLogs: Array<string> };

export type GetAllGithubReposQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllGithubReposQuery = { __typename?: 'Query', getAllGithubRepos: Array<string> };

export type GetAllGithubBranchesQueryVariables = Exact<{
  repo: Scalars['String'];
}>;


export type GetAllGithubBranchesQuery = { __typename?: 'Query', getAllGithubBranches: Array<string> };

export type GetProjectBySlugForEditQueryVariables = Exact<{
  slug: Scalars['String'];
}>;


export type GetProjectBySlugForEditQuery = { __typename?: 'Query', getProjectBySlug: { __typename?: 'Project', createdAt: number, description: string, dockerContext: string, dockerPath: string, githubBranch: string, githubUrl: string, slug: string, name: string, current?: { __typename?: 'Container', command?: Array<string> | null, containerSlug: string, image: string, port?: number | null, status: ContainerStatus, env?: Array<{ __typename?: 'Env', name: string, value: string }> | null, metaData?: Array<{ __typename?: 'metaData', name: string, value: string }> | null, buildArgs?: Array<{ __typename?: 'buildArgs', name: string, value: string }> | null } | null, history?: Array<{ __typename?: 'Container', containerSlug: string }> | null } };

export type SignUpOrLoginMutationVariables = Exact<{
  username: Scalars['String'];
  email: Scalars['String'];
  token: Scalars['String'];
  backend_token: Scalars['String'];
}>;


export type SignUpOrLoginMutation = { __typename?: 'Mutation', signupOrLogin: string };


export const CreateProjectDocument = gql`
    mutation CreateProject($input: ProjectInput!, $start: Boolean!) {
  createProject(input: $input, start: $start)
}
    `;
export type CreateProjectMutationFn = Apollo.MutationFunction<CreateProjectMutation, CreateProjectMutationVariables>;

/**
 * __useCreateProjectMutation__
 *
 * To run a mutation, you first call `useCreateProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProjectMutation, { data, loading, error }] = useCreateProjectMutation({
 *   variables: {
 *      input: // value for 'input'
 *      start: // value for 'start'
 *   },
 * });
 */
export function useCreateProjectMutation(baseOptions?: Apollo.MutationHookOptions<CreateProjectMutation, CreateProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<CreateProjectMutation, CreateProjectMutationVariables>(CreateProjectDocument, options);
      }
export type CreateProjectMutationHookResult = ReturnType<typeof useCreateProjectMutation>;
export type CreateProjectMutationResult = Apollo.MutationResult<CreateProjectMutation>;
export type CreateProjectMutationOptions = Apollo.BaseMutationOptions<CreateProjectMutation, CreateProjectMutationVariables>;
export const RollbackProjectDocument = gql`
    mutation RollbackProject($slug: String!, $version: Int!) {
  roleBackProject(slug: $slug, version: $version)
}
    `;
export type RollbackProjectMutationFn = Apollo.MutationFunction<RollbackProjectMutation, RollbackProjectMutationVariables>;

/**
 * __useRollbackProjectMutation__
 *
 * To run a mutation, you first call `useRollbackProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRollbackProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rollbackProjectMutation, { data, loading, error }] = useRollbackProjectMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      version: // value for 'version'
 *   },
 * });
 */
export function useRollbackProjectMutation(baseOptions?: Apollo.MutationHookOptions<RollbackProjectMutation, RollbackProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RollbackProjectMutation, RollbackProjectMutationVariables>(RollbackProjectDocument, options);
      }
export type RollbackProjectMutationHookResult = ReturnType<typeof useRollbackProjectMutation>;
export type RollbackProjectMutationResult = Apollo.MutationResult<RollbackProjectMutation>;
export type RollbackProjectMutationOptions = Apollo.BaseMutationOptions<RollbackProjectMutation, RollbackProjectMutationVariables>;
export const GetDeploymentHistoryDocument = gql`
    query GetDeploymentHistory($slug: String!) {
  getProjectBySlug(slug: $slug) {
    history {
      containerSlug
      createdAt
      status
    }
    current {
      containerSlug
      status
    }
    slug
    name
  }
}
    `;

/**
 * __useGetDeploymentHistoryQuery__
 *
 * To run a query within a React component, call `useGetDeploymentHistoryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDeploymentHistoryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDeploymentHistoryQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetDeploymentHistoryQuery(baseOptions: Apollo.QueryHookOptions<GetDeploymentHistoryQuery, GetDeploymentHistoryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDeploymentHistoryQuery, GetDeploymentHistoryQueryVariables>(GetDeploymentHistoryDocument, options);
      }
export function useGetDeploymentHistoryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDeploymentHistoryQuery, GetDeploymentHistoryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDeploymentHistoryQuery, GetDeploymentHistoryQueryVariables>(GetDeploymentHistoryDocument, options);
        }
export type GetDeploymentHistoryQueryHookResult = ReturnType<typeof useGetDeploymentHistoryQuery>;
export type GetDeploymentHistoryLazyQueryHookResult = ReturnType<typeof useGetDeploymentHistoryLazyQuery>;
export type GetDeploymentHistoryQueryResult = Apollo.QueryResult<GetDeploymentHistoryQuery, GetDeploymentHistoryQueryVariables>;
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
      status
    }
    domains
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
export const RefreshProjectDocument = gql`
    mutation RefreshProject($slug: String!, $input: RefreshProjectInput!, $start: Boolean!, $type: String!) {
  refreshProject(slug: $slug, input: $input, start: $start, type: $type)
}
    `;
export type RefreshProjectMutationFn = Apollo.MutationFunction<RefreshProjectMutation, RefreshProjectMutationVariables>;

/**
 * __useRefreshProjectMutation__
 *
 * To run a mutation, you first call `useRefreshProjectMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRefreshProjectMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [refreshProjectMutation, { data, loading, error }] = useRefreshProjectMutation({
 *   variables: {
 *      slug: // value for 'slug'
 *      input: // value for 'input'
 *      start: // value for 'start'
 *      type: // value for 'type'
 *   },
 * });
 */
export function useRefreshProjectMutation(baseOptions?: Apollo.MutationHookOptions<RefreshProjectMutation, RefreshProjectMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<RefreshProjectMutation, RefreshProjectMutationVariables>(RefreshProjectDocument, options);
      }
export type RefreshProjectMutationHookResult = ReturnType<typeof useRefreshProjectMutation>;
export type RefreshProjectMutationResult = Apollo.MutationResult<RefreshProjectMutation>;
export type RefreshProjectMutationOptions = Apollo.BaseMutationOptions<RefreshProjectMutation, RefreshProjectMutationVariables>;
export const GetBuildLogsDocument = gql`
    query GetBuildLogs($containerSlug: String!) {
  getBuildLogs(containerSlug: $containerSlug)
}
    `;

/**
 * __useGetBuildLogsQuery__
 *
 * To run a query within a React component, call `useGetBuildLogsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuildLogsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuildLogsQuery({
 *   variables: {
 *      containerSlug: // value for 'containerSlug'
 *   },
 * });
 */
export function useGetBuildLogsQuery(baseOptions: Apollo.QueryHookOptions<GetBuildLogsQuery, GetBuildLogsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBuildLogsQuery, GetBuildLogsQueryVariables>(GetBuildLogsDocument, options);
      }
export function useGetBuildLogsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBuildLogsQuery, GetBuildLogsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBuildLogsQuery, GetBuildLogsQueryVariables>(GetBuildLogsDocument, options);
        }
export type GetBuildLogsQueryHookResult = ReturnType<typeof useGetBuildLogsQuery>;
export type GetBuildLogsLazyQueryHookResult = ReturnType<typeof useGetBuildLogsLazyQuery>;
export type GetBuildLogsQueryResult = Apollo.QueryResult<GetBuildLogsQuery, GetBuildLogsQueryVariables>;
export const GetAllGithubReposDocument = gql`
    query GetAllGithubRepos {
  getAllGithubRepos
}
    `;

/**
 * __useGetAllGithubReposQuery__
 *
 * To run a query within a React component, call `useGetAllGithubReposQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllGithubReposQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllGithubReposQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllGithubReposQuery(baseOptions?: Apollo.QueryHookOptions<GetAllGithubReposQuery, GetAllGithubReposQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllGithubReposQuery, GetAllGithubReposQueryVariables>(GetAllGithubReposDocument, options);
      }
export function useGetAllGithubReposLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllGithubReposQuery, GetAllGithubReposQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllGithubReposQuery, GetAllGithubReposQueryVariables>(GetAllGithubReposDocument, options);
        }
export type GetAllGithubReposQueryHookResult = ReturnType<typeof useGetAllGithubReposQuery>;
export type GetAllGithubReposLazyQueryHookResult = ReturnType<typeof useGetAllGithubReposLazyQuery>;
export type GetAllGithubReposQueryResult = Apollo.QueryResult<GetAllGithubReposQuery, GetAllGithubReposQueryVariables>;
export const GetAllGithubBranchesDocument = gql`
    query GetAllGithubBranches($repo: String!) {
  getAllGithubBranches(repo: $repo)
}
    `;

/**
 * __useGetAllGithubBranchesQuery__
 *
 * To run a query within a React component, call `useGetAllGithubBranchesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllGithubBranchesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllGithubBranchesQuery({
 *   variables: {
 *      repo: // value for 'repo'
 *   },
 * });
 */
export function useGetAllGithubBranchesQuery(baseOptions: Apollo.QueryHookOptions<GetAllGithubBranchesQuery, GetAllGithubBranchesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllGithubBranchesQuery, GetAllGithubBranchesQueryVariables>(GetAllGithubBranchesDocument, options);
      }
export function useGetAllGithubBranchesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllGithubBranchesQuery, GetAllGithubBranchesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllGithubBranchesQuery, GetAllGithubBranchesQueryVariables>(GetAllGithubBranchesDocument, options);
        }
export type GetAllGithubBranchesQueryHookResult = ReturnType<typeof useGetAllGithubBranchesQuery>;
export type GetAllGithubBranchesLazyQueryHookResult = ReturnType<typeof useGetAllGithubBranchesLazyQuery>;
export type GetAllGithubBranchesQueryResult = Apollo.QueryResult<GetAllGithubBranchesQuery, GetAllGithubBranchesQueryVariables>;
export const GetProjectBySlugForEditDocument = gql`
    query GetProjectBySlugForEdit($slug: String!) {
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
      buildArgs {
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
 * __useGetProjectBySlugForEditQuery__
 *
 * To run a query within a React component, call `useGetProjectBySlugForEditQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetProjectBySlugForEditQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetProjectBySlugForEditQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGetProjectBySlugForEditQuery(baseOptions: Apollo.QueryHookOptions<GetProjectBySlugForEditQuery, GetProjectBySlugForEditQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetProjectBySlugForEditQuery, GetProjectBySlugForEditQueryVariables>(GetProjectBySlugForEditDocument, options);
      }
export function useGetProjectBySlugForEditLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetProjectBySlugForEditQuery, GetProjectBySlugForEditQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetProjectBySlugForEditQuery, GetProjectBySlugForEditQueryVariables>(GetProjectBySlugForEditDocument, options);
        }
export type GetProjectBySlugForEditQueryHookResult = ReturnType<typeof useGetProjectBySlugForEditQuery>;
export type GetProjectBySlugForEditLazyQueryHookResult = ReturnType<typeof useGetProjectBySlugForEditLazyQuery>;
export type GetProjectBySlugForEditQueryResult = Apollo.QueryResult<GetProjectBySlugForEditQuery, GetProjectBySlugForEditQueryVariables>;
export const SignUpOrLoginDocument = gql`
    mutation SignUpOrLogin($username: String!, $email: String!, $token: String!, $backend_token: String!) {
  signupOrLogin(
    username: $username
    email: $email
    token: $token
    backend_token: $backend_token
  )
}
    `;
export type SignUpOrLoginMutationFn = Apollo.MutationFunction<SignUpOrLoginMutation, SignUpOrLoginMutationVariables>;

/**
 * __useSignUpOrLoginMutation__
 *
 * To run a mutation, you first call `useSignUpOrLoginMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSignUpOrLoginMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [signUpOrLoginMutation, { data, loading, error }] = useSignUpOrLoginMutation({
 *   variables: {
 *      username: // value for 'username'
 *      email: // value for 'email'
 *      token: // value for 'token'
 *      backend_token: // value for 'backend_token'
 *   },
 * });
 */
export function useSignUpOrLoginMutation(baseOptions?: Apollo.MutationHookOptions<SignUpOrLoginMutation, SignUpOrLoginMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<SignUpOrLoginMutation, SignUpOrLoginMutationVariables>(SignUpOrLoginDocument, options);
      }
export type SignUpOrLoginMutationHookResult = ReturnType<typeof useSignUpOrLoginMutation>;
export type SignUpOrLoginMutationResult = Apollo.MutationResult<SignUpOrLoginMutation>;
export type SignUpOrLoginMutationOptions = Apollo.BaseMutationOptions<SignUpOrLoginMutation, SignUpOrLoginMutationVariables>;