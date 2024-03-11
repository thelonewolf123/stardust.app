'use client'

import { useRouter } from 'next/navigation'
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
import { useCreateProjectMutation } from '@/graphql-client'
import { zodResolver } from '@hookform/resolvers/zod'

const BuildArgsInput = z.object({
    name: z.string(),
    value: z.string()
})

const EnvInput = z.object({
    name: z.string(),
    value: z.string()
})

const metaDataInput = z.object({
    name: z.string(),
    value: z.string()
})

const ProjectInputSchema = z.object({
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
    env: z.array(EnvInput),
    buildArgs: z.array(BuildArgsInput),
    metaData: z.array(metaDataInput)
})

export default function NewProjectPage() {
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

    const {
        fields: buildArgsFields,
        append: appendBuildArgs,
        remove: removeBuildArgs
    } = useFieldArray({
        control: form.control,
        name: 'buildArgs'
    })

    const {
        fields: envFields,
        append: appendEnv,
        remove: removeEnv
    } = useFieldArray({
        control: form.control,
        name: 'env'
    })

    const {
        fields: metaDataFields,
        append: appendMetaData,
        remove: removeMetaData
    } = useFieldArray({
        control: form.control,
        name: 'metaData'
    })

    const [createProject, { data, loading, error }] = useCreateProjectMutation()
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof ProjectInputSchema>) {
        try {
            const result = await createProject({
                variables: {
                    input: {
                        name: values.name,
                        description: values.description,
                        githubUrl: values.githubUrl,
                        githubBranch: values.githubBranch,
                        dockerPath: values.dockerPath,
                        dockerContext: values.dockerContext,
                        buildArgs: values.buildArgs,
                        port: values.port,
                        env: values.env,
                        metaData: values.metaData
                    }
                }
            })
            const containerSlug = result.data?.createProject
            if (!containerSlug) throw new Error('Container slug not found')

            const projectSlug = containerSlug.split(':')[0]
            console.log('Project created', containerSlug)
            router.push(`/project/${projectSlug}`)
        } catch (error) {
            console.error(error)
        }
    }

    useEffect(() => {
        // check all fields and remove empty ones, and if there are no fields, add one

        const isAllFieldsUsed = envFields.every((field, index) => {
            return field.name.trim() && field.value.trim()
        })

        if (isAllFieldsUsed) {
            appendEnv({ name: '', value: '' })
        }
    }, [envFields, appendEnv, removeEnv])

    useEffect(() => {
        // check all fields and remove empty ones, and if there are no fields, add one

        const isAllFieldsUsed = buildArgsFields.every((field, index) => {
            return field.name.trim() && field.value.trim()
        })

        if (isAllFieldsUsed) {
            appendBuildArgs({ name: '', value: '' })
        }
    }, [buildArgsFields, appendBuildArgs, removeBuildArgs])

    useEffect(() => {
        // check all fields and remove empty ones, and if there are no fields, add one

        const isAllFieldsUsed = metaDataFields.every((field, index) => {
            return field.name.trim() && field.value.trim()
        })

        if (isAllFieldsUsed) {
            appendMetaData({ name: '', value: '' })
        }
    }, [metaDataFields, appendMetaData, removeMetaData])

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

                        <div className="col-span-2">
                            <h2 className="text-lg font-medium underline">
                                Build Args
                            </h2>
                            <div className="space-y-4">
                                {buildArgsFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid gap-4 grid-cols-2"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`buildArgs.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    {index === 0 && (
                                                        <FormLabel>
                                                            Key
                                                        </FormLabel>
                                                    )}
                                                    <FormControl>
                                                        <Input
                                                            placeholder="ARG_NAME"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {index === 0 && (
                                                        <FormDescription>
                                                            This is your build
                                                            arg name.
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`buildArgs.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        {index === 0 && (
                                                            <FormLabel>
                                                                Value
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="arg_value"
                                                                type="password"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        {index === 0 && (
                                                            <FormDescription>
                                                                This is your
                                                                build arg value.
                                                            </FormDescription>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <MdOutlineRemoveCircleOutline
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                size={22}
                                                onClick={() =>
                                                    removeBuildArgs(index)
                                                }
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="col-span-2">
                            <h2 className="text-lg font-medium underline">
                                Environment Variables
                            </h2>
                            <div className="space-y-4">
                                {envFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid gap-4 grid-cols-2"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`env.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    {index === 0 ? (
                                                        <FormLabel>
                                                            Key
                                                        </FormLabel>
                                                    ) : null}
                                                    <FormControl>
                                                        <Input
                                                            placeholder="ENV_KEY"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {index === 0 ? (
                                                        <FormDescription>
                                                            This is your env
                                                            key.
                                                        </FormDescription>
                                                    ) : null}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <div className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`env.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        {index === 0 ? (
                                                            <FormLabel>
                                                                Value
                                                            </FormLabel>
                                                        ) : null}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="env_value"
                                                                type="password"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        {index === 0 ? (
                                                            <FormDescription>
                                                                This is your env
                                                                value.
                                                            </FormDescription>
                                                        ) : null}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />

                                            <MdOutlineRemoveCircleOutline
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                size={22}
                                                onClick={() => removeEnv(index)}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="col-span-2">
                            <h2 className="text-lg font-medium underline">
                                Meta Data
                            </h2>
                            <div className="space-y-4">
                                {metaDataFields.map((field, index) => (
                                    <div
                                        key={field.id}
                                        className="grid gap-4 grid-cols-2"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`metaData.${index}.name`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    {index === 0 && (
                                                        <FormLabel>
                                                            Key
                                                        </FormLabel>
                                                    )}
                                                    <FormControl>
                                                        <Input
                                                            placeholder="META_KEY"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {index === 0 && (
                                                        <FormDescription>
                                                            This is your meta
                                                            data key.
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                        <span className="flex items-center gap-2">
                                            <FormField
                                                control={form.control}
                                                name={`metaData.${index}.value`}
                                                render={({ field }) => (
                                                    <FormItem className="flex-grow">
                                                        {index === 0 && (
                                                            <FormLabel>
                                                                Value
                                                            </FormLabel>
                                                        )}
                                                        <FormControl>
                                                            <Input
                                                                placeholder="meta_value"
                                                                {...field}
                                                            />
                                                        </FormControl>
                                                        {index === 0 && (
                                                            <FormDescription>
                                                                This is your
                                                                meta data value.
                                                            </FormDescription>
                                                        )}
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <MdOutlineRemoveCircleOutline
                                                className="text-red-500 hover:text-red-700 cursor-pointer"
                                                size={22}
                                                onClick={() =>
                                                    removeMetaData(index)
                                                }
                                            />
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <Button type="submit" loading={loading}>
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    )
}
