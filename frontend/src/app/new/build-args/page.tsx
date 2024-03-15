import { ProjectArrayForm } from '@/components/internal/forms/array-form'

export default async function BuildArgsPage() {
    return (
        <ProjectArrayForm
            project={{
                name: '',
                description: '',
                env: [],
                buildArgs: [],
                metaData: []
            }}
            slug={''}
            prefix="build_args"
            propertyKey="buildArgs"
            descriptionName="Build Args"
            redirectTo="/new/meta-data"
            type="new"
            start={false}
        />
    )
}
