'use client'

import invariant from 'invariant'
import { useRouter } from 'next/navigation'
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
import { useSignupMutaionMutation } from '@/graphql-client'
import { zodResolver } from '@hookform/resolvers/zod'

const formSchema = z.object({
    username: z.string().min(2, {
        message: 'Username must be at least 2 characters.'
    }),
    email: z.string().email({
        message: 'Invalid email.'
    }),
    password: z.string().min(8, {
        message: 'Password must be at least 8 characters.'
    }),
    confirmPassword: z.string().min(8, {
        message: 'Password must be at least 8 characters.'
    })
})

export default function SignupPage() {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: '',
            password: '',
            email: '',
            confirmPassword: ''
        }
    })
    const [signup, { data, loading, error }] = useSignupMutaionMutation()
    const router = useRouter()

    async function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
        try {
            const result = await signup({
                variables: {
                    username: values.username,
                    password: values.password,
                    email: values.email
                }
            })
            console.log(result)
            const token = result.data?.signup
            invariant(token, 'Expected token to be defined')
            localStorage.setItem('token', token)
            router.push('/projects')
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div className="w-full">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-8 w-full max-w-md mx-auto mt-8 p-8 bg-white rounded-lg shadow-lg"
                >
                    <h1 className="text-xl font-medium underline">
                        Welcome to Jet-Deploy
                    </h1>
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Username</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="white-ghost"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your public display name.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input
                                        placeholder="whiteghost@gmail.com"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your email address.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        name="password"
                        control={form.control}
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    This is your private password.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="confirmPassword"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Confirm Password</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        placeholder="confirm password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Please confirm your password.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <Button type="submit" disabled={loading}>
                        Sign up
                    </Button>
                </form>
            </Form>
        </div>
    )
}
