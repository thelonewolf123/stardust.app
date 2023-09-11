import { GraphQLResolveInfo } from 'graphql';
import { Context } from 'packages/types/index';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
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
  deleteContainer: Scalars['Boolean'];
  signup: Scalars['String'];
};


export type MutationCreateContainerArgs = {
  input: ContainerInput;
};


export type MutationCreateProjectArgs = {
  input: ProjectInput;
};


export type MutationDeleteContainerArgs = {
  containerId: Scalars['String'];
};


export type MutationSignupArgs = {
  email: Scalars['String'];
  password: Scalars['String'];
  username: Scalars['String'];
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
  getContainerInfo: Container;
  getProjectBySlug: Project;
  login: Scalars['String'];
  logout: Scalars['Boolean'];
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



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;



/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  BuildArgsInput: BuildArgsInput;
  Container: ResolverTypeWrapper<Container>;
  ContainerInput: ContainerInput;
  ContainerStatus: ContainerStatus;
  Env: ResolverTypeWrapper<Env>;
  EnvInput: EnvInput;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Mutation: ResolverTypeWrapper<{}>;
  Project: ResolverTypeWrapper<Project>;
  ProjectInput: ProjectInput;
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  User: ResolverTypeWrapper<User>;
  metaData: ResolverTypeWrapper<MetaData>;
  metaDataInput: MetaDataInput;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Boolean: Scalars['Boolean'];
  BuildArgsInput: BuildArgsInput;
  Container: Container;
  ContainerInput: ContainerInput;
  Env: Env;
  EnvInput: EnvInput;
  Float: Scalars['Float'];
  Int: Scalars['Int'];
  Mutation: {};
  Project: Project;
  ProjectInput: ProjectInput;
  Query: {};
  String: Scalars['String'];
  User: User;
  metaData: MetaData;
  metaDataInput: MetaDataInput;
};

export type ContainerResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Container'] = ResolversParentTypes['Container']> = {
  command?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  containerSlug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  env?: Resolver<Maybe<Array<ResolversTypes['Env']>>, ParentType, ContextType>;
  image?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  metaData?: Resolver<Maybe<Array<ResolversTypes['metaData']>>, ParentType, ContextType>;
  port?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  status?: Resolver<ResolversTypes['ContainerStatus'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EnvResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Env'] = ResolversParentTypes['Env']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MutationResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  createContainer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationCreateContainerArgs, 'input'>>;
  createProject?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationCreateProjectArgs, 'input'>>;
  deleteContainer?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType, RequireFields<MutationDeleteContainerArgs, 'containerId'>>;
  signup?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<MutationSignupArgs, 'email' | 'password' | 'username'>>;
};

export type ProjectResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Project'] = ResolversParentTypes['Project']> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  current?: Resolver<Maybe<ResolversTypes['Container']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dockerContext?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dockerPath?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  githubBranch?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  githubUrl?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  history?: Resolver<Maybe<Array<ResolversTypes['Container']>>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = Context, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  getContainerInfo?: Resolver<ResolversTypes['Container'], ParentType, ContextType, RequireFields<QueryGetContainerInfoArgs, 'slug'>>;
  getProjectBySlug?: Resolver<ResolversTypes['Project'], ParentType, ContextType, RequireFields<QueryGetProjectBySlugArgs, 'slug'>>;
  login?: Resolver<ResolversTypes['String'], ParentType, ContextType, RequireFields<QueryLoginArgs, 'password' | 'username'>>;
  logout?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
};

export type UserResolvers<ContextType = Context, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  username?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type MetaDataResolvers<ContextType = Context, ParentType extends ResolversParentTypes['metaData'] = ResolversParentTypes['metaData']> = {
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  value?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = Context> = {
  Container?: ContainerResolvers<ContextType>;
  Env?: EnvResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  Project?: ProjectResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  metaData?: MetaDataResolvers<ContextType>;
};

