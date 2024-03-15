import { ProjectArrayForm } from '@/components/internal/forms/array-form'

export default async function EnvironmentPage() {
    return (
        <ProjectArrayForm
            project={{
                env: [],
                buildArgs: [],
                metaData: []
            }}
            slug={''}
            propertyKey="env"
            prefix="env"
            descriptionName="Environment Variables"
            redirectTo="/new/meta-data"
            type="new"
            start={false}
        />
    )
}
