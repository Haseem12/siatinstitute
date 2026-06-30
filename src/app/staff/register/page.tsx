"use client";

import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import ArewaLogo from "@/components/arewa-logo";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, UserPlus, ArrowLeft } from "lucide-react";

const staffRegisterSchema = z.object({
  fullName: z.string().min(3, "Full name is required."),
  email: z.string().email("Invalid institutional email address."),
  staffId: z.string().min(3, "Staff ID is required."),
  role: z.enum(["instructor", "admin"], { required_error: "Please select your role." }),
  department: z.string().min(2, "Department is required."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  confirmPassword: z.string().min(6, "Please confirm your password."),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type StaffRegisterValues = z.infer<typeof staffRegisterSchema>;

export default function StaffRegisterPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<StaffRegisterValues>({
    resolver: zodResolver(staffRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      staffId: "",
      role: undefined,
      department: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: StaffRegisterValues) => {
    setIsLoading(true);
    try {
      const response = await fetch("https://sajfoods.com.ng/siat/staff-register.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await response.json();

      if (result.success) {
        toast({ title: "Account Created", description: result.message });
        router.push("/"); // Back to home for login
      } else {
        toast({ variant: "destructive", title: "Registration Failed", description: result.message });
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Network Error", description: "Failed to connect to registration service." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 py-12 px-4 flex flex-col items-center justify-center">
      <Card className="w-full max-w-2xl shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mb-4 mx-auto">
            <ArewaLogo className="h-12 w-12 text-primary" />
          </Link>
          <CardTitle className="text-2xl font-bold text-primary">Staff Portal Registration</CardTitle>
          <CardDescription>Create your instructor or administrative account for the SIAT Institute.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="fullName" render={({ field }) => (
                  <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input placeholder="Dr. John Doe" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem><FormLabel>Institutional Email</FormLabel><FormControl><Input type="email" placeholder="john.doe@siat.edu.ng" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="staffId" render={({ field }) => (
                  <FormItem><FormLabel>Staff ID</FormLabel><FormControl><Input placeholder="STF/XXXX" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="role" render={({ field }) => (
                  <FormItem><FormLabel>Portal Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl><SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger></FormControl>
                      <SelectContent>
                        <SelectItem value="instructor">Instructor / Lecturer</SelectItem>
                        <SelectItem value="admin">Administrator / Registry</SelectItem>
                      </SelectContent>
                    </Select><FormMessage /></FormItem>
                )} />
              </div>
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem><FormLabel>Primary Department</FormLabel><FormControl><Input placeholder="e.g. Computer Science" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <div className="grid md:grid-cols-2 gap-6">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem><FormLabel>Confirm Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </div>
              <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <UserPlus className="mr-2 h-4 w-4" />}
                Register Staff Account
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
           <p className="text-sm text-muted-foreground text-center">Already have an account? <Link href="/" className="text-primary hover:underline">Login here</Link></p>
           <Button variant="ghost" asChild className="mx-auto">
            <Link href="/" className="flex items-center text-xs">
              <ArrowLeft className="mr-2 h-3 w-3" /> Back to Home
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
