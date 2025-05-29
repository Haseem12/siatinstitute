
"use client";

import React, { useState, useEffect } from "react"; // Ensure useEffect is imported
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
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

const preRegisterFormSchema = z.object({
  surname: z.string().min(2, "Surname is required and must be at least 2 characters."),
  firstname: z.string().min(2, "First name is required and must be at least 2 characters."),
  othername: z.string().optional(),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  repeatPassword: z.string().min(6, "Please repeat your password."),
}).refine(data => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ["repeatPassword"], // Set error on repeatPassword field
});

type PreRegisterFormValues = z.infer<typeof preRegisterFormSchema>;

export default function PreRegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);

  useEffect(() => {
    console.log("PreRegisterPage mounted successfully.");
    document.title = "Pre-register - SIAT Institute";
  }, []);

  const form = useForm<PreRegisterFormValues>({
    resolver: zodResolver(preRegisterFormSchema),
    defaultValues: {
      surname: "",
      firstname: "",
      othername: "",
      email: "",
      password: "",
      repeatPassword: "",
    },
  });

  const onSubmit = (data: PreRegisterFormValues) => {
    setIsLoading(true);
    // Simulate generating App ID and saving to localStorage
    const appId = `SIAT-APP-${Date.now()}`;
    const newUser: PreRegisteredUser = {
      appId,
      surname: data.surname,
      firstname: data.firstname,
      othername: data.othername || "",
      email: data.email,
      password: data.password, // In a real app, hash this password
    };

    try {
      const existingUsersString = localStorage.getItem("preRegisteredUsers");
      const existingUsers: PreRegisteredUser[] = existingUsersString ? JSON.parse(existingUsersString) : [];
      
      if (existingUsers.some(user => user.email === newUser.email)) {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: "This email address is already registered.",
        });
        setIsLoading(false);
        return;
      }
      
      const updatedUsers = [...existingUsers, newUser];
      localStorage.setItem("preRegisteredUsers", JSON.stringify(updatedUsers));

      toast({
        title: "Pre-registration Successful!",
        description: `Your Application ID is ${appId}. Please use it to login and complete your registration. Redirecting to login...`,
        duration: 7000,
      });
      router.push(`/registration/login?appId=${appId}`); // Pass App ID for pre-fill
    } catch (error) {
      console.error("Error during pre-registration:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-12 flex items-center justify-center">
      <Card className="w-full max-w-lg shadow-xl border-2 border-primary/10">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4">
            <ArewaLogo className="h-12 w-12 text-primary mx-auto" />
          </Link>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">New Intake Pre-registration</CardTitle>
          <CardDescription>
            Create your application account to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="surname" render={({ field }) => (
                <FormItem><FormLabel>Surname</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="firstname" render={({ field }) => (
                <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="othername" render={({ field }) => (
                <FormItem><FormLabel>Other Name (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
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
              <FormField control={form.control} name="repeatPassword" render={({ field }) => (
                 <FormItem>
                  <FormLabel>Repeat Password</FormLabel>
                  <FormControl>
                     <div className="relative">
                      <Input type={showRepeatPassword ? "text" : "password"} {...field} />
                       <Button type="button" variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowRepeatPassword(!showRepeatPassword)}>
                        {showRepeatPassword ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                      </Button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? "Registering..." : "Register & Get Application ID"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-sm">
          <p>Already have an Application ID?</p>
          <Button variant="link" asChild className="text-accent">
            <Link href="/registration/login">Login to Continue Application</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

    