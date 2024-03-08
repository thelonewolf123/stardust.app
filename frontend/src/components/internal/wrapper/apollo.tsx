'use client'

import { PropsWithChildren } from 'react'

import client from '@/lib/graphql'
import { ApolloProvider } from '@apollo/client'

export const ApolloWrapper: React.FC<PropsWithChildren<{}>> = ({
    children
}) => {
    return <ApolloProvider client={client}>{children}</ApolloProvider>
}
