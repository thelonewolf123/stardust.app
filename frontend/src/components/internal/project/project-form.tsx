'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
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
import { Textarea } from '@/components/ui/textarea'
import { parseEnv } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'

import { ArrayFieldsSchema } from '../settings/array-forms'
import { ProjectSchema } from '../settings/general-settings'

export const ProjectInputSchema = ProjectSchema.merge(ArrayFieldsSchema)

type ArrayFieldsBuilderType = ReturnType<
    typeof useForm<z.infer<typeof ProjectInputSchema>>
>

function ArrayFieldsBuilder<T extends ArrayFieldsBuilderType>({
    form,
    propertyName,
    title,
    descriptionName,
    placeHolderPrefix,
    inputType = 'text'
}: {
    form: T
    propertyName: 'buildArgs' | 'env' | 'metaData'
    title: string
    descriptionName: string
    placeHolderPrefix: string
    inputType?: 'text' | 'password'
}) {
    const { append, remove, fields } = useFieldArray({
        control: form.control,
        name: propertyName
    })

    useEffect(() => {
        // check all fields and remove empty ones, and if there are no fields, add one

        const isAllFieldsUsed: boolean = fields.every((field, index) => {
            return field.name.trim() && field.value.trim()
        })

        if (isAllFieldsUsed) {
            append({ name: '', value: '' })
        }
    }, [fields, append])

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
            <h2 className="text-lg font-medium underline capitalize">
                {title}
            </h2>
            <div className="space-y-4">
                {fields.map((field, index) => (
                    <div key={field.id} className="grid gap-4 grid-cols-2">
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
                                    className="text-green-500 hover:text-green-700 cursor-pointer"
                                    size={22}
                                    onClick={() =>
                                        append({ name: '', value: '' })
                                    }
                                />
                            ) : null}
                            <MdOutlineRemoveCircleOutline
                                className="text-red-500 hover:text-red-700 cursor-pointer"
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

export default function ProjectForm({
    onSubmit,
    defaultValues,
    loading,
    title
}: {
    onSubmit: (values: z.infer<typeof ProjectInputSchema>) => void
    defaultValues?: z.infer<typeof ProjectInputSchema>
    loading: boolean
    title?: string
}) {
    const form = useForm<z.infer<typeof ProjectInputSchema>>({
        resolver: zodResolver(ProjectInputSchema),
        defaultValues
    })

    return (
        <div className="container">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mx-auto my-8 space-y-8 rounded-lg bg-white dark:bg-slate-900 p-8 shadow-lg"
                >
                    <h1 className="text-xl font-medium underline">
                        {title || 'New Project'}
                    </h1>
                    <div className="grid gap-4 md:grid-cols-2 grid-cols-1">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Name</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="dark-knight"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project name.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Project Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="My project is the best"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project description.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="githubUrl"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GitHub URL</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project&apos;s GitHub URL.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="githubBranch"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>GitHub Branch</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project&apos;s GitHub
                                        branch.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dockerPath"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Docker Path</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project&apos;s Docker path.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="dockerContext"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Docker Context</FormLabel>
                                    <FormControl>
                                        <Input placeholder="" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project&apos;s Docker
                                        context.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="port"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Port</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder=""
                                            inputMode="numeric"
                                            type="number"
                                            min={'0'}
                                            max={'65535'}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        This is your project&apos;s port.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <ArrayFieldsBuilder
                            form={form}
                            propertyName="buildArgs"
                            title="Build Args"
                            descriptionName="build arg"
                            placeHolderPrefix="ARG"
                            inputType="password"
                        />
                        <ArrayFieldsBuilder
                            form={form}
                            propertyName="env"
                            title="Environment Variables"
                            descriptionName="environment variable"
                            placeHolderPrefix="ENV"
                            inputType="password"
                        />
                        <ArrayFieldsBuilder
                            form={form}
                            propertyName="metaData"
                            title="Meta Data"
                            descriptionName="meta data"
                            placeHolderPrefix="META"
                        />
                    </div>

                    <Button type="submit" loading={loading}>
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    )
}
