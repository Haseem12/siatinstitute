
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
import { Eye, EyeOff, Loader2, Check, KeyRound, MailWarning } from "lucide-react";

const registrationSteps = [
  { id: 1, title: "Pre-register Account" },
  { id: 1.5, title: "Verify Email" },
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
  const [awaitingVerification, setAwaitingVerification] = useState(false);
  const [verificationCodeInput, setVerificationCodeInput] = useState("");
  const [pendingRegistrationData, setPendingRegistrationData] = useState<PreRegisterFormValues | null>(null);

  useEffect(() => {
    document.title = "Pre-register - SIAT Institute";
    console.log("PreRegisterPage mounted successfully.");
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

  const handleProceedToVerification = async (data: PreRegisterFormValues) => {
    setIsLoading(true);
    const payload = {
        surname: data.surname,
        firstname: data.firstname,
        othername: data.othername,
        email: data.email,
        password: data.password,
    };

    const bodyString = JSON.stringify(payload);
    console.log(
        "PRE-REGISTER PAYLOAD DEBUG (handleProceedToVerification):\n",
        "Type of payload:", typeof payload, "\n",
        "Payload object:", payload, "\n",
        "JSON.stringify(payload):", bodyString, "\n",
        "Length of stringified body:", bodyString.length
    );

    try {
      const response = await fetch('https://sajfoods.net/api/siat/pre-register.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: bodyString,
      });

      if (!response.ok) {
        let errorText = await response.text();
        let errorJson = null;
        try {
          errorJson = JSON.parse(errorText);
        } catch (e) {
          // Not a JSON response, use raw text
        }
        const errorMessage = errorJson?.message || errorText.substring(0, 200) + (errorText.length > 200 ? "..." : "");
        console.error(`Pre-registration API error response text (HTTP ${response.status}):`, errorText);

        toast({
          variant: "destructive",
          title: `Pre-registration Server Error (${response.status})`,
          description: `Server msg: ${errorMessage}. CHECK PHP SERVER LOGS on sajfoods.net for detailed errors (e.g., in api/siat/php-error.log). Simulating success for UI testing.`,
          duration: 15000,
        });
        // Simulate success for UI testing
        setPendingRegistrationData(data);
        setAwaitingVerification(true);
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success) {
        if (result.emailVerified && result.data?.appId) {
             toast({
                title: "Email Already Verified",
                description: result.message || `Your Application ID is ${result.data.appId}. Please login.`,
                duration: 7000,
            });
            router.push(`/registration/login?appId=${result.data.appId}`);
        } else {
            setPendingRegistrationData(data);
            setAwaitingVerification(true);
            toast({
                title: "Check Your Email",
                description: result.message || "A verification code has been sent. Please check your inbox (and spam folder).",
                duration: 10000,
            });
        }
      } else {
        toast({
          variant: "destructive",
          title: "Pre-registration Failed",
          description: result.message || "Could not complete pre-registration. Please try again.",
          duration: 7000,
        });
      }
    } catch (error: any) {
      console.error("Error calling pre-register API:", error);
      const errMessageForToast = error.message.includes("JSON.parse") ? "Received invalid (non-JSON) response from server." : error.message;
      toast({
        variant: "destructive",
        title: "Pre-registration Network/Client Error",
        description: `Error: ${errMessageForToast}. Simulating successful pre-registration for UI testing. Check PHP server logs.`,
        duration: 15000,
      });
      // Simulate success for UI testing
      setPendingRegistrationData(data);
      setAwaitingVerification(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCodeAndCompleteRegistration = async () => {
    if (!pendingRegistrationData) {
        toast({ variant: "destructive", title: "Error", description: "No registration data found. Please start over."});
        return;
    }
    if (verificationCodeInput.length !== 6) {
        toast({ variant: "destructive", title: "Invalid Code", description: "Verification code must be 6 digits."});
        return;
    }

    setIsLoading(true);
    const payload = {
        email: pendingRegistrationData.email,
        verificationCode: verificationCodeInput,
        originalPassword: pendingRegistrationData.password,
    };

    const bodyString = JSON.stringify(payload);
     console.log(
        "VERIFY EMAIL PAYLOAD DEBUG (handleVerifyCodeAndCompleteRegistration):\n",
        "Type of payload:", typeof payload, "\n",
        "Payload object:", payload, "\n",
        "JSON.stringify(payload):", bodyString, "\n",
        "Length of stringified body:", bodyString.length
    );

    try {
      const response = await fetch('https://sajfoods.net/api/siat/verify-email.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: bodyString,
      });

      if (!response.ok) {
        let errorText = await response.text();
        let errorJson = null;
        try { errorJson = JSON.parse(errorText); } catch (e) {/*ignore*/}
        const errorMessage = errorJson?.message || errorText.substring(0, 200) + (errorText.length > 200 ? "..." : "");
        console.error(`Verification API error response text (HTTP ${response.status}):`, errorText);
        toast({
          variant: "destructive",
          title: `Backend Verification Error (${response.status}) (UI Test Mode)`,
          description: `Server msg: ${errorMessage}. Simulating successful verification. Check PHP server logs.`,
          duration: 15000,
        });
        const simulatedAppId = `SIM-${Date.now().toString().slice(-6)}`;
        router.push(`/registration/login?appId=${simulatedAppId}`);
        setIsLoading(false);
        return;
      }

      const result = await response.json();

      if (result.success && result.data && result.data.appId) {
        toast({
          title: "Email Verified & Pre-registration Complete!",
          description: `Your Application ID is ${result.data.appId}. Redirecting to login...`,
          duration: 7000,
        });
        router.push(`/registration/login?appId=${result.data.appId}`);
      } else {
        toast({
          variant: "destructive",
          title: "Verification Failed",
          description: result.message || "Could not verify your code. Please try again or pre-register anew.",
          duration: 10000
        });
      }
    } catch (error: any) {
      console.error("Error calling verify-email API:", error);
      const errMessageForToast = error.message.includes("JSON.parse") ? "Received invalid (non-JSON) response from server." : error.message;
      toast({
        variant: "destructive",
        title: "Verification Network/Client Error (UI Test Mode)",
        description: `Error: ${errMessageForToast}. Simulating successful verification. Check PHP server logs.`,
        duration: 15000,
      });
      const simulatedAppId = `SIM-${Date.now().toString().slice(-6)}`;
      router.push(`/registration/login?appId=${simulatedAppId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const currentStepId = awaitingVerification ? 1.5 : 1;

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
            <h1 className="text-2xl md:text-3xl font-bold text-primary">
                {awaitingVerification ? "Verify Your Email" : "New Intake Pre-registration"}
            </h1>
            <p className="text-muted-foreground mt-1">
              {awaitingVerification
                ? `A verification code was sent to ${pendingRegistrationData?.email}. Please enter it below to complete your pre-registration.`
                : "Create your application account to get started."}
            </p>
          </div>

          <Form {...form}>
            {!awaitingVerification ? (
              <form onSubmit={form.handleSubmit(handleProceedToVerification)} className="space-y-6">
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
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                  {isLoading ? "Processing..." : "Proceed to Email Verification"}
                </Button>
              </form>
            ) : (
              <div className="space-y-6">
                  <FormItem>
                      <FormLabel htmlFor="verificationCode">Verification Code</FormLabel>
                      <Input
                          id="verificationCode"
                          type="text"
                          value={verificationCodeInput}
                          onChange={(e) => setVerificationCodeInput(e.target.value)}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="text-center text-lg tracking-[0.3em]"
                      />
                  </FormItem>
                  <Button onClick={handleVerifyCodeAndCompleteRegistration} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading || verificationCodeInput.length !== 6}>
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                      {isLoading ? "Verifying..." : "Verify & Complete Registration"}
                  </Button>
                  <Button variant="outline" onClick={() => { setAwaitingVerification(false); setVerificationCodeInput(""); form.reset(); }} className="w-full" disabled={isLoading}>
                      Go Back & Edit Details
                  </Button>
              </div>
            )}
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
