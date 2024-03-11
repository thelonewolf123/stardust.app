'use client'

import { useEffect } from 'react'
import { useFieldArray, useForm } from 'react-hook-form'
import { MdOutlineRemoveCircleOutline } from 'react-icons/md'
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
import { zodResolver } from '@hookform/resolvers/zod'

const keyValuePair = z.object({
    name: z.string(),
    value: z.string()
})

export const ProjectInputSchema = z.object({
    name: z
        .string()
        .min(2, {
            message: 'Project name must be at least 2 characters.'
        })
        .regex(/^[a-z0-9-]+$/i, {
            message: 'Invalid project name.'
        }),
    description: z.string().min(2, {
        message: 'Project description must be at least 2 characters.'
    }),
    githubUrl: z.string().url(),
    githubBranch: z.string().min(2, {
        message: 'Invalid github branch.'
    }),
    dockerPath: z.string().min(1, {
        message: 'Invalid docker path.'
    }),
    dockerContext: z.string().min(1, {
        message: 'Invalid docker context.'
    }),
    port: z
        .string()
        .transform((v) => parseInt(v))
        .optional(),
    env: z.array(keyValuePair),
    buildArgs: z.array(keyValuePair),
    metaData: z.array(keyValuePair)
})

type ArrayFieldsBuilderType = ReturnType<
    typeof useForm<z.infer<typeof ProjectInputSchema>>
>

function parseEnv(data: string) {
    // Split the file content into lines
    const lines = data.split('\n')

    const envVariables: {
        name: string
        value: string
    }[] = []
    let currentKey = ''
    let isMultilineValue = false

    // Iterate through each line
    lines.forEach((line) => {
        // Ignore comments and empty lines
        if (line.trim() !== '' && !line.startsWith('#')) {
            // If line starts with '"', it's a multiline value
            if (line.startsWith('"')) {
                // If multiline value is already in progress, add current line
                if (isMultilineValue) {
                    currentKey += '\n' + line.trim()
                } else {
                    currentKey = line.trim()
                    isMultilineValue = true
                }
            } else if (isMultilineValue) {
                // If line doesn't start with '"', but is part of multiline value, add current line
                currentKey += '\n' + line.trim()
            } else {
                // Split each line into key-value pair
                const [key, value] = line.split('=')
                // Trim whitespace from key and value
                if (!key || !value) return
                const trimmedKey = key.trim()
                let trimmedValue = value.trim()
                // If value is wrapped in double quotes, remove them
                if (
                    trimmedValue.startsWith('"') &&
                    trimmedValue.endsWith('"')
                ) {
                    trimmedValue = trimmedValue.substring(
                        1,
                        trimmedValue.length - 1
                    )
                }
                // Add key-value pair to the object
                envVariables.push({
                    name: trimmedKey,
                    value: trimmedValue
                })
                // Reset multiline value tracking
                isMultilineValue = false
                currentKey = ''
            }
        }
    })

    return envVariables
}

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

        const isAllFieldsUsed = fields.every((field, index) => {
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
        envs.map((env) => {
            append({
                name: env.name,
                value: env.value
            })
        })
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
    loading
}: {
    onSubmit: (values: z.infer<typeof ProjectInputSchema>) => void
    loading: boolean
}) {
    const form = useForm<z.infer<typeof ProjectInputSchema>>({
        resolver: zodResolver(ProjectInputSchema),
        defaultValues: {
            name: '',
            description: '',
            githubUrl: '',
            githubBranch: 'main',
            dockerPath: 'Dockerfile',
            dockerContext: '.',
            buildArgs: [
                {
                    name: '',
                    value: ''
                }
            ],
            port: undefined,
            env: [
                {
                    name: '',
                    value: ''
                }
            ],
            metaData: [
                {
                    name: '',
                    value: ''
                }
            ]
        }
    })

    return (
        <div className="container">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mx-auto my-8 space-y-8 rounded-lg bg-white dark:bg-slate-900 p-8 shadow-lg"
                >
                    <h1 className="text-xl font-medium underline">
                        New Project
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
