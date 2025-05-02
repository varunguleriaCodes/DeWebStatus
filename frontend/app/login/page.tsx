"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Eye, EyeOff, LucideArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AuthHeader } from "@/components/auth/auth-header";
import { AuthCard } from "@/components/auth/auth-card";
import { API_BACKEND_URL } from "@/config";
import axios from "axios";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/auth";

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  rememberMe: z.boolean().default(false),
});

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    axios.post(`${API_BACKEND_URL}/api/login`, {
        "password":values["password"],
        "email":values["email"]
    })
    .then((response) => {
        if (response.data?.success) {
            useAuthStore.getState().setAuth(response.data.data.token, response.data.data.user_id);
            router.push('/dashboard');
            toast.success("Login successful!");
        } else {
            toast.error("Login failed: " + (response.data.message || "Please try again"));
            console.error("Login failed:", response.data.message);
        }
        setIsLoading(false);
    })
    .catch((error) => {
        toast.error("Login failed: " + (error.response?.data?.message || "Please try again"));
        setIsLoading(false);
        console.error("Error during login:", error);
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
        <AuthCard>
        <AuthHeader
            title="Welcome back"
            description="Enter your credentials to sign in to your account"
        />
        
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                    <Input
                        placeholder="hello@example.com"
                        type="email"
                        autoComplete="email"
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                    <div className="relative">
                        <Input
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        {...field}
                        />
                        <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-0 top-0 h-full px-3 py-2 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                        >
                        {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                        ) : (
                            <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                        </span>
                        </Button>
                    </div>
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />
            <div className="flex items-center justify-between">
                {/* <FormField
                control={form.control}
                name="rememberMe"
                render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                    <FormControl>
                        <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                        Remember me
                    </FormLabel>
                    </FormItem>
                )}
                /> */}
                <Link
                href="/auth/reset-password"
                className="text-sm font-medium text-primary hover:underline"
                >
                Forgot password?
                </Link>
            </div>
            <Button
                type="submit"
                className="w-full gap-2 transition-all"
                disabled={isLoading}
            >
                {isLoading ? "Signing in..." : "Sign in"}
                {!isLoading && <LucideArrowRight className="h-4 w-4" />}
            </Button>
            </form>
        </Form>
        
        <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link
            href="/signup"
            className="font-medium text-primary hover:underline"
            >
            Sign up
            </Link>
        </div>
        </AuthCard>
    </div>
  );
}