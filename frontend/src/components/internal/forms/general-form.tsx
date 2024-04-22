'use client'

import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FaArrowRight } from 'react-icons/fa';
import { z } from 'zod';

import { Autocomplete } from '@/components/ui/auto-complete';
import { Button } from '@/components/ui/button';
import {
    Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useGetAllGithubBranchesQuery, useGetAllGithubReposQuery } from '@/graphql-client';
import { zodResolver } from '@hookform/resolvers/zod';

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
        .or(z.number())
        .transform((v) => parseInt(`${v}`))
        .optional()
})

const GithubRepoForm = ({
    form,
    type
}: {
    form: ReturnType<typeof useForm<z.infer<typeof ProjectSchema>>>
    type: 'new' | 'edit'
}) => {
    const { data } = useGetAllGithubReposQuery()

    const items = useMemo(() => {
        if (!data) return []
        return data.getAllGithubRepos.map((repo) => ({
            value: repo,
            label: repo.split('github.com/')[1]
        }))
    }, [data])

    return (
        <FormField
            control={form.control}
            name={'githubUrl'}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="block">GitHub Repo</FormLabel>
                    <FormControl>
                        <Autocomplete
                            options={items}
                            placeholder="repo"
                            disabled={type === 'edit'}
                            value={field.value}
                            onChange={(v) => form.setValue('githubUrl', v)}
                        />
                    </FormControl>
                    <FormDescription>
                        This is your project&apos;s GitHub URL.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

const GithubBranchForm = ({
    form
}: {
    form: ReturnType<typeof useForm<z.infer<typeof ProjectSchema>>>
}) => {
    const repo = form.watch('githubUrl')
    const { data } = useGetAllGithubBranchesQuery({
        variables: {
            repo
        }
    })

    const items = useMemo(() => {
        if (!data) return []
        return data.getAllGithubBranches.map((branch) => ({
            value: branch,
            label: branch
        }))
    }, [data])

    return (
        <FormField
            control={form.control}
            name={'githubBranch'}
            render={({ field }) => (
                <FormItem className="flex flex-col">
                    <FormLabel className="block">GitHub Branch</FormLabel>
                    <FormControl>
                        <Autocomplete
                            options={items}
                            placeholder="repo"
                            value={field.value}
                            onChange={(v) => {
                                form.setValue('githubBranch', v)
                            }}
                        />
                    </FormControl>
                    <FormDescription>
                        This is your project&apos;s GitHub branch.
                    </FormDescription>
                    <FormMessage />
                </FormItem>
            )}
        />
    )
}

export const ProjectGeneralInfoForm: React.FC<{
    defaultValues: z.infer<typeof ProjectSchema>
    onSubmit: (values: z.infer<typeof ProjectSchema>) => void
    loading: boolean
    type: 'new' | 'edit'
}> = ({ defaultValues, onSubmit, loading, type }) => {
    const form = useForm<z.infer<typeof ProjectSchema>>({
        resolver: zodResolver(ProjectSchema),
        defaultValues
    })

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mx-auto space-y-8"
            >
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

                    <GithubRepoForm form={form} type={type} />
                    <GithubBranchForm form={form} />

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
                                        placeholder="9000"
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
                <Button
                    type="submit"
                    loading={loading}
                    leftIcon={type === 'new' ? <FaArrowRight /> : null}
                >
                    {type === 'new' ? 'Next' : 'Save'}
                </Button>
            </form>
        </Form>
    )
}
