import { mutation, mutationType } from './mutation'
import { query, queryType } from './query'
import { typeDefs } from './type'

const resolvers: any = { Mutation: mutation, Query: query }

export default { typeDefs: [typeDefs, queryType, mutationType], resolvers }
