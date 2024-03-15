import { ProjectArrayForm } from '@/components/internal/forms/array-form'

export default async function MetaDataPage() {
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
            propertyKey="metaData"
            prefix="meta_data"
            descriptionName="Meta Data"
            redirectTo="/projects"
            type="new"
            start={true}
        />
    )
}
