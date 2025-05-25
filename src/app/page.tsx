"use client";

import *
as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ArewaLogo from "@/components/arewa-logo";
import Image from "next/image";

const loginFormSchema = z.object({
  studentId: z.string().min(1, { message: "Student ID is required." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

// This is a mock login action. In a real app, this would call an API.
async function handleLogin(data: LoginFormValues): Promise<{ success: boolean; message: string }> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (data.studentId && data.password) {
    // Simulate successful login
    // In a real app, you would set a session cookie here.
    if (typeof window !== 'undefined') {
      localStorage.setItem('isLoggedIn', 'true'); // Simple flag for demo
    }
    return { success: true, message: "Login successful!" };
  }
  return { success: false, message: "Invalid Student ID or Password." };
}


export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      studentId: "",
      password: "",
    },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    const result = await handleLogin(data);
    setIsLoading(false);

    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Redirecting to your dashboard...",
      });
      router.push("/dashboard");
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.message,
      });
      form.setError("studentId", { type: "manual", message: " " });
      form.setError("password", { type: "manual", message: result.message });
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-background p-4 overflow-hidden">
      <Image
        src="https://placehold.co/1920x1080.png?pattern"
        alt="Background pattern"
        layout="fill"
        objectFit="cover"
        className="absolute inset-0 z-0 opacity-10"
        data-ai-hint="hausa pattern subtle"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-background via-transparent to-background opacity-50 z-0"></div>
      
      <Card className="w-full max-w-md shadow-2xl z-10 border-2 border-primary/20">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto mb-4">
            <ArewaLogo className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Arewa Scholar Hub</CardTitle>
          <CardDescription className="text-muted-foreground">
            Welcome back! Please login to access your portal.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="studentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-foreground/80">Student ID</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., SIAT/001" 
                        {...field} 
                        className="bg-background/80 focus:bg-background"
                        aria-label="Student ID"
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
                    <FormLabel className="text-foreground/80">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...field} 
                        className="bg-background/80 focus:bg-background"
                        aria-label="Password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center">
          <p className="text-xs text-muted-foreground mt-4">
            &copy; {new Date().getFullYear()} Scholars Institute of Arts & Technology, Zaria.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
