import { ProjectArrayForm } from '@/components/internal/forms/array-form'

export default async function BuildArgsPage() {
    return (
        <ProjectArrayForm
            project={{
                env: [],
                buildArgs: [],
                metaData: []
            }}
            slug={''}
            prefix="build_args"
            propertyKey="buildArgs"
            descriptionName="Build Args"
            redirectTo="/new/environment"
            type="new"
            start={false}
        />
    )
}
