
"use client";

import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import Link from "next/link";
import type { PreRegisteredUser } from "@/types";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginFormSchema = z.object({
  appIdOrEmail: z.string().min(1, "Application ID or Email is required."),
  password: z.string().min(1, "Password is required."),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function RegistrationLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const appIdFromUrl = searchParams.get("appId");

  useEffect(() => {
    console.log("RegistrationLoginPage mounted successfully.");
    document.title = "Applicant Login - SIAT Institute";
    if (appIdFromUrl) {
      form.setValue("appIdOrEmail", appIdFromUrl);
    }
  }, [appIdFromUrl]); // Rerun if appIdFromUrl changes

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      appIdOrEmail: appIdFromUrl || "",
      password: "",
    },
  });
  
  // Update default value if appIdFromUrl becomes available after initial mount
  useEffect(() => {
    if (appIdFromUrl && !form.getValues("appIdOrEmail")) {
      form.setValue("appIdOrEmail", appIdFromUrl);
    }
  }, [appIdFromUrl, form]);


  const onSubmit = (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const existingUsersString = localStorage.getItem("preRegisteredUsers");
      const existingUsers: PreRegisteredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
      
      const foundUser = existingUsers.find(
        user => (user.appId === data.appIdOrEmail || user.email.toLowerCase() === data.appIdOrEmail.toLowerCase()) && user.password === data.password
      );

      if (foundUser) {
        localStorage.setItem("currentApplicantSession", JSON.stringify({ appId: foundUser.appId, email: foundUser.email }));
        toast({ title: "Login Successful", description: "Redirecting to your application dashboard..." });
        router.push("/registration/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: "Invalid Application ID/Email or Password.",
        });
      }
    } catch (error) {
      console.error("Error during login:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-12 flex items-center justify-center">
      <Card className="w-full max-w-md shadow-xl border-2 border-primary/10">
        <CardHeader className="text-center">
           <Link href="/" className="inline-block mb-4">
            <ArewaLogo className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Applicant Login</CardTitle>
          <CardDescription>
            Login with your Application ID/Email and password to continue your registration.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="appIdOrEmail" render={({ field }) => (
                <FormItem><FormLabel>Application ID or Email</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                 <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Input type={showPassword ? "text" : "password"} {...field} />
                       <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Logging in..." : "Login & Continue"}
              </Button>
            </form>
          </Form>
        </CardContent>
         <CardFooter className="flex flex-col items-center text-sm">
          <p>Don't have an Application ID yet?</p>
          <Button variant="link" asChild className="text-accent">
            <Link href="/registration/pre-register">Pre-register Here</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    