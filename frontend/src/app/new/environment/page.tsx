import { ProjectArrayForm } from '@/components/internal/forms/array-form'

export default async function EnvironmentPage() {
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
            propertyKey="env"
            prefix="env"
            descriptionName="Environment Variables"
            redirectTo="/new/build-args"
            type="new"
            start={false}
        />
    )
}
