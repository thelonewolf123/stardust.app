'use client'

import { useFieldArray, useForm } from 'react-hook-form'
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

const BuildArgsInput = z.object({
    name: z.string(),
    value: z.string()
})

const EnvInput = z.object({
    key: z.string(),
    value: z.string()
})

const metaDataInput = z.object({
    key: z.string(),
    value: z.string()
})

const ProjectInputSchema = z.object({
    name: z.string(),
    description: z.string(),
    githubUrl: z.string().url(),
    githubBranch: z.string(),
    dockerPath: z.string(),
    dockerContext: z.string(),
    port: z.number().optional(),
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
            buildArgs: [],
            port: undefined,
            env: [],
            metaData: []
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

    function onSubmit(values: z.infer<typeof ProjectInputSchema>) {
        console.log(values)
    }

    const loading = false

    return (
        <div className="container">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="mx-auto mt-8 space-y-8 rounded-lg bg-white dark:bg-slate-900 p-8 shadow-lg"
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
                                        className="grid gap-4 md:grid-cols-2 grid-cols-1"
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
                                        <FormField
                                            control={form.control}
                                            name={`buildArgs.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    {index === 0 && (
                                                        <FormLabel>
                                                            Value
                                                        </FormLabel>
                                                    )}
                                                    <FormControl>
                                                        <Input
                                                            placeholder="arg_value"
                                                            {...field}
                                                        />
                                                    </FormControl>
                                                    {index === 0 && (
                                                        <FormDescription>
                                                            This is your build
                                                            arg value.
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() =>
                                        appendBuildArgs({ name: '', value: '' })
                                    }
                                >
                                    Add Build Arg
                                </Button>
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
                                        className="grid gap-4 md:grid-cols-2 grid-cols-1"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`env.${index}.key`}
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
                                        <FormField
                                            control={form.control}
                                            name={`env.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
                                                    {index === 0 ? (
                                                        <FormLabel>
                                                            Value
                                                        </FormLabel>
                                                    ) : null}
                                                    <FormControl>
                                                        <Input
                                                            placeholder="env_value"
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
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() =>
                                        appendEnv({ key: '', value: '' })
                                    }
                                >
                                    Add Env
                                </Button>
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
                                        className="grid gap-4 md:grid-cols-2 grid-cols-1"
                                    >
                                        <FormField
                                            control={form.control}
                                            name={`metaData.${index}.key`}
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
                                        <FormField
                                            control={form.control}
                                            name={`metaData.${index}.value`}
                                            render={({ field }) => (
                                                <FormItem>
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
                                                            This is your meta
                                                            data value.
                                                        </FormDescription>
                                                    )}
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    onClick={() =>
                                        appendMetaData({ key: '', value: '' })
                                    }
                                >
                                    Add Meta Data
                                </Button>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" disabled={loading}>
                        Submit
                    </Button>
                </form>
            </Form>
        </div>
    )
}
