
"use client";

import React, { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useRouter, useSearchParams } from "next/navigation";
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
import { Eye, EyeOff, Loader2, Check, MailWarning } from "lucide-react";

const registrationSteps = [
  { id: 1, title: "Pre-register Account" },
  { id: 1.5, title: "Verify Email" },
  { id: 2, title: "Login & Continue" },
  { id: 3, title: "Complete Application Form" },
  { id: 4, title: "Submit & Await Decision" },
];

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

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      appIdOrEmail: appIdFromUrl || "",
      password: "",
    },
  });
  
  useEffect(() => {
    document.title = "Applicant Login - SIAT Institute";
    console.log("RegistrationLoginPage mounted successfully.");
    if (appIdFromUrl && !form.getValues("appIdOrEmail")) {
      form.setValue("appIdOrEmail", appIdFromUrl);
    }
  }, [appIdFromUrl, form]);


  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const response = await fetch('https://sajfoods.net/api/siat/login-applicant.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appIdOrEmail: data.appIdOrEmail,
          password: data.password,
        }),
      });

      const result = await response.json();

      if (result.success && result.data.appId) {
        localStorage.setItem("currentApplicantSession", JSON.stringify({ 
            appId: result.data.appId, 
            email: result.data.email,
            admissionStatus: result.data.admissionStatus || "Not Submitted" // Store status from API
        }));
        toast({ title: "Login Successful", description: "Redirecting to your application dashboard..." });
        router.push("/registration/dashboard");
      } else {
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: result.message || "Invalid Application ID/Email or Password.",
        });
      }
    } catch (error) {
      console.error("Error during login API call:", error);
      toast({
        variant: "destructive",
        title: "Login Error",
        description: "Could not connect to the login service. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepId = 2;

  return (
    <div className="min-h-screen bg-muted/30 py-8 md:py-12 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-4xl grid md:grid-cols-12 gap-8 lg:gap-12 items-start">
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
                    {step.id < currentStepId ? <Check className="w-5 h-5" /> : (step.id === 1.5 ? <MailWarning className="w-4 h-4"/> : Math.floor(step.id))}
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
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="md:col-span-8 lg:col-span-9 bg-background p-6 sm:p-8 rounded-lg shadow-xl">
           <div className="text-center mb-6">
            <Link href="/" className="inline-block mb-4">
              <ArewaLogo className="h-12 w-12 text-primary mx-auto" />
            </Link>
            <h1 className="text-2xl md:text-3xl font-bold text-primary">Applicant Login</h1>
            <p className="text-muted-foreground mt-1">
              Login with your Application ID/Email and password to continue your registration.
            </p>
          </div>
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
          <div className="mt-6 text-center text-sm">
            <p className="text-muted-foreground">Don't have an Application ID yet?</p>
            <Button variant="link" asChild className="text-accent">
              <Link href="/registration/pre-register">Pre-register Here</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
