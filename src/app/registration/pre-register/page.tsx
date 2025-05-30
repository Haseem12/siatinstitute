
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
import { Eye, EyeOff, Loader2, Check } from "lucide-react";

const registrationSteps = [
  { id: 1, title: "Pre-register Account" },
  { id: 2, title: "Login & Continue" },
  { id: 3, title: "Complete Application Form" },
  { id: 4, title: "Submit & Await Decision" },
];

const PreRegisterFormSchema = z.object({
  surname: z.string().min(2, "Surname is required and must be at least 2 characters."),
  firstname: z.string().min(2, "First name is required and must be at least 2 characters."),
  othername: z.string().optional(),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  repeatPassword: z.string().min(6, "Please repeat your password."),
}).refine(data => data.password === data.repeatPassword, {
  message: "Passwords don't match",
  path: ["repeatPassword"],
});

type PreRegisterFormValues = z.infer<typeof PreRegisterFormSchema>;

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
    resolver: zodResolver(PreRegisterFormSchema),
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
    const appId = `SIAT-APP-${Date.now()}`;
    const newUser: PreRegisteredUser = {
      appId,
      surname: data.surname,
      firstname: data.firstname,
      othername: data.othername || "",
      email: data.email,
      password: data.password,
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
      router.push(`/registration/login?appId=${appId}`);
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

  const currentStepId = 1;

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-12 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Stepper */}
        <div className="md:col-span-4 lg:col-span-3 p-4 md:p-6 bg-background rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold text-primary mb-6">Registration Progress</h3>
          <div className="relative space-y-8">
            {registrationSteps.map((step, index) => (
              <div key={step.id} className="flex items-start">
                <div className="flex flex-col items-center mr-4">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2
                      ${step.id < currentStepId ? 'bg-primary border-primary text-primary-foreground' : ''}
                      ${step.id === currentStepId ? 'bg-accent border-accent text-accent-foreground animate-pulse' : ''}
                      ${step.id > currentStepId ? 'bg-background border-border text-muted-foreground' : ''}
                    `}
                  >
                    {step.id < currentStepId ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  {index < registrationSteps.length - 1 && (
                    <div className={`w-0.5 grow mt-2 
                      ${step.id < currentStepId ? 'bg-primary' : 'bg-border'}
                      ${(registrationSteps.length - 1 - index) === 1 && step.id < currentStepId ? 'h-8' : ''}
                      ${(registrationSteps.length - 1 - index) > 1 || step.id >= currentStepId ? 'h-10' : ''}
                    `}></div>
                  )}
                </div>
                <div>
                  <p className={`font-medium ${step.id === currentStepId ? 'text-accent' : (step.id < currentStepId ? 'text-primary' : 'text-muted-foreground')}`}>
                    {step.title}
                  </p>
                  {/* Optional: Add a small description for each step here */}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Area */}
        <div className="md:col-span-8 lg:col-span-9 bg-background p-6 sm:p-8 rounded-lg shadow-xl">
          <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-4">
              <ArewaLogo className="h-12 w-12 text-primary mx-auto" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">New Intake Pre-registration</h1>
            <p className="text-muted-foreground mt-1">
              Create your application account to get started.
            </p>
          </div>
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
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">Already have an Application ID?</p>
            <Button variant="link" asChild className="text-accent">
              <Link href="/registration/login">Login to Continue Application</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
