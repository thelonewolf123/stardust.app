import gql from 'graphql-tag'
import invariant from 'invariant'
import { v4 } from 'uuid'

import { getRegularUser } from '@/core/utils'
import { Resolvers } from '@/types/graphql-server'

export const mutation: Resolvers['Mutation'] = {
    async createContainer(_, { input }, ctx) {
        getRegularUser(ctx)
        const containerSlug = v4()

        const env: Record<string, string> = {}
        input.env?.forEach((envron) => {
            env[envron.name] = envron.value
        })

        ctx.queue.createContainer.publish({
            containerSlug,
            image: input.ecrRepo,
            command: input.command ?? [],
            env,
            ports: input.port ? [input.port] : []
        })

        return true
    },
    async startContainer(_, { projectSlug }, ctx) {
        const user = getRegularUser(ctx)
        const project = await ctx.db.Project.findOne({
            slug: projectSlug,
            user: user._id
        }).lean()

        invariant(project, 'Container not found')

        const container = await ctx.db.Container.findOne({
            _id: project.current
        }).lean()

        invariant(container, 'Container not found')
        invariant(
            container.status !== 'running',
            'Container is already running'
        )

        await ctx.db.Container.updateOne(
            {
                _id: container._id
            },
            {
                status: 'pending'
            }
        )

        const env: Record<string, string> = {}
        container.env.forEach((envron) => {
            env[envron.name] = envron.value
        })

        ctx.queue.createContainer.publish({
            containerSlug: container.containerSlug,
            image: container.image,
            command: container.command ?? [],
            env,
            ports: container.port ? [container.port] : []
        })
        return true
    },
    async stopContainer(_, { projectSlug }, ctx) {
        getRegularUser(ctx)
        const container = await ctx.db.Container.findOne({
            containerSlug: projectSlug,
            createdBy: ctx.user?._id
        }).lean()

        invariant(container, 'Container not found')

        ctx.queue.destroyContainer.publish({
            containerId: container.containerId,
            containerSlug: container.containerSlug
        })
        return true
    }
}

export const mutationType = gql`
    type Mutation {
        createContainer(input: ContainerInput!): Boolean!
        startContainer(projectSlug: String!): Boolean!
        stopContainer(projectSlug: String!): Boolean!
    }
`
