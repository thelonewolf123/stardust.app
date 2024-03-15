'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { FaArrowRight, FaCloud } from 'react-icons/fa'
import {
    MdOutlineAddCircleOutline,
    MdOutlineRemoveCircleOutline
} from 'react-icons/md'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useRefreshProjectMutation } from '@/graphql-client'
import { parseEnv } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

import { ProjectSchema } from './general-form'

const keyValuePair = z.object({
    name: z.string(),
    value: z.string()
})

export const ArrayFieldsSchema = z.object({
    env: z.array(keyValuePair).optional(),
    buildArgs: z.array(keyValuePair).optional(),
    metaData: z.array(keyValuePair).optional()
})

type ArrayFieldsBuilderType = ReturnType<
    typeof useForm<z.infer<typeof ArrayFieldsSchema>>
>

function ArrayFieldsBuilder<T extends ArrayFieldsBuilderType>({
    form,
    propertyName,
    descriptionName,
    placeHolderPrefix,
    inputType = 'text'
}: {
    form: T
    propertyName: 'buildArgs' | 'env' | 'metaData'
    descriptionName: string
    placeHolderPrefix: string
    inputType?: 'text' | 'password'
}) {
    const { append, remove, fields } = useFieldArray({
        control: form.control,
        name: propertyName
    })

    useEffect(() => {
        if (fields.length === 0) {
            append({ name: '', value: '' })
        }
    }, [fields.length, append])

    const handlePasteEvent = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault()
        const text = e.clipboardData.getData('text')
        const envs = parseEnv(text)
        envs.map((env) =>
            append({
                name: env.name,
                value: env.value
            })
        )
    }

    return (
        <div className="col-span-2">
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name={`${propertyName}.${index}.name`}
                            render={({ field }) => (
                                <FormItem>
                                    {index === 0 && <FormLabel>Name</FormLabel>}
                                    <FormControl>
                                        <Input
                                            placeholder={`${placeHolderPrefix}_name`.toUpperCase()}
                                            {...field}
                                            onPaste={handlePasteEvent}
                                        />
                                    </FormControl>
                                    {index === 0 && (
                                        <FormDescription>
                                            This is your {descriptionName} name.
                                        </FormDescription>
                                    )}
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center gap-2">
                            <FormField
                                control={form.control}
                                name={`${propertyName}.${index}.value`}
                                render={({ field }) => (
                                    <FormItem className="flex-grow">
                                        {index === 0 && (
                                            <FormLabel>Value</FormLabel>
                                        )}
                                        <FormControl>
                                            <Input
                                                placeholder={`${placeHolderPrefix}_value`.toLowerCase()}
                                                type={inputType}
                                                {...field}
                                            />
                                        </FormControl>
                                        {index === 0 && (
                                            <FormDescription>
                                                This is your {descriptionName}{' '}
                                                value.
                                            </FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {index === fields.length - 1 ? (
                                <MdOutlineAddCircleOutline
                                    className="cursor-pointer text-green-500 hover:text-green-700"
                                    size={22}
                                    onClick={() =>
                                        append({ name: '', value: '' })
                                    }
                                />
                            ) : null}
                            <MdOutlineRemoveCircleOutline
                                className="cursor-pointer text-red-500 hover:text-red-700"
                                size={22}
                                onClick={() => remove(index)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export function ProjectArrayForm({
    slug,
    prefix,
    start = true,
    type = 'edit',
    project,
    redirectTo,
    propertyKey,
    descriptionName
}: {
    slug: string
    prefix: string
    start?: boolean
    type?: 'new' | 'edit'
    descriptionName: string
    project: z.infer<typeof ArrayFieldsSchema>
    propertyKey: 'env' | 'buildArgs' | 'metaData'

    redirectTo?: string
}) {
    const form = useForm<z.infer<typeof ArrayFieldsSchema>>({
        resolver: zodResolver(ArrayFieldsSchema),
        defaultValues: {
            [propertyKey]: project[propertyKey]
        }
    })

    const { toast } = useToast()
    const [saveEnvOptions, { loading }] = useRefreshProjectMutation()
    const router = useRouter()

    function onSubmit(values: z.infer<typeof ArrayFieldsSchema>) {
        const formValues = values[propertyKey] || []

        values[propertyKey] = formValues.filter(
            (item) => item.name !== '' && item.value !== ''
        )
        saveEnvOptions({
            variables: {
                slug,
                type,
                start,
                input: {
                    [propertyKey]: values[propertyKey]
                }
            }
        }).then(() => {
            if (redirectTo) {
                router.push(redirectTo)
                return
            }

            toast({
                title: 'Project updated',
                description: 'Your project has been updated.'
            })
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto space-y-8"
            >
                <ArrayFieldsBuilder
                    form={form}
                    propertyName={propertyKey}
                    descriptionName={descriptionName}
                    placeHolderPrefix={prefix}
                    inputType={propertyKey === 'metaData' ? 'text' : 'password'}
                />

                <Button type="submit" loading={loading}>
                    {type === 'new' && !start ? (
                        <div className="flex gap-1 items-center">
                            <FaArrowRight />
                            <span>Next</span>
                        </div>
                    ) : (
                        <>Save</>
                    )}
                </Button>
            </form>
        </Form>
    )
}
