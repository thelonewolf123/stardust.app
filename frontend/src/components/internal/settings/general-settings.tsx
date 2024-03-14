'use client'

import { useForm } from 'react-hook-form'
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
import { useRefreshProjectMutation } from '@/graphql-client'
import { zodResolver } from '@hookform/resolvers/zod'

export const ProjectSchema = z.object({
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
        .optional()
})

export default function GeneralSettings({
    project,
    slug
}: {
    project: z.infer<typeof ProjectSchema>
    slug: string
}) {
    const form = useForm<z.infer<typeof ProjectSchema>>({
        resolver: zodResolver(ProjectSchema),
        defaultValues: {
            ...project
        }
    })

    const [saveGeneralSettings, { loading }] = useRefreshProjectMutation()

    function onSubmit(values: z.infer<typeof ProjectSchema>) {
        console.log(values)
        saveGeneralSettings({
            variables: {
                slug,
                input: {
                    ...values
                }
            }
        }).then(() => {
            console.log('Saved')
        })
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto space-y-8"
            >
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
                                    This is your project&apos;s GitHub branch.
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
                                    This is your project&apos;s Docker context.
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
                </div>
                <Button type="submit" loading={loading}>
                    Save
                </Button>
            </form>
        </Form>
    )
}
