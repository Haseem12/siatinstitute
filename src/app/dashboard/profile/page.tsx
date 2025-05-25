"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, ShieldCheck, KeyRound, Camera } from "lucide-react";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { updateProfileAction, type UpdateProfilePayload } from "./actions";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";

// Mock user data
const mockUser: User = {
  id: "mockUser123",
  name: "Aisha Bello",
  email: "aisha.bello@siat.edu.ng",
  studentId: "SIAT/CSC/001",
  avatarUrl: "https://placehold.co/150x150.png",
  department: "Computer Science",
  level: "300 Level",
};

const profileFormSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  department: z.string().optional(),
  level: z.string().optional(),
  // avatarFile: typeof window !== 'undefined' ? z.instanceof(FileList).optional() : z.any().optional(), // For file upload
  avatarUrl: z.string().url({ message: "Please enter a valid URL for avatar."}).optional(),
});
type ProfileFormValues = z.infer<typeof profileFormSchema>;

const passwordFormSchema = z.object({
    currentPassword: z.string().min(6, "Current password is required."),
    newPassword: z.string().min(6, "New password must be at least 6 characters."),
    confirmPassword: z.string().min(6, "Confirm password is required."),
}).refine(data => data.newPassword === data.confirmPassword, {
    message: "New passwords don't match",
    path: ["confirmPassword"],
});
type PasswordFormValues = z.infer<typeof passwordFormSchema>;


export default function ProfilePage() {
  const { toast } = useToast();
  const [user, setUser] = React.useState<User>(mockUser);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(user.avatarUrl || null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      department: user.department,
      level: user.level,
      avatarUrl: user.avatarUrl,
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: ""},
  });


  React.useEffect(() => {
    profileForm.reset({
      name: user.name,
      email: user.email,
      department: user.department,
      level: user.level,
      avatarUrl: user.avatarUrl,
    });
    setAvatarPreview(user.avatarUrl || null);
  }, [user, profileForm]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // For actual upload, you'd set this in form state:
        // profileForm.setValue('avatarFile', event.target.files); 
        // For now, we'll just update the avatarUrl if user provides one manually in edit mode or rely on this preview.
        // As a mock, if user provides a new avatarUrl manually, that would be used.
        // This example does not implement actual file upload to a server.
         toast({ title: "Avatar Preview Updated", description: "Save changes to apply the new avatar (mocked)." });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    
    // For actual file upload, you would handle `data.avatarFile` here,
    // upload it, get the URL, and then pass it to the action.
    // For this mock, we use avatarUrl from the form or the existing one.
    const payload: UpdateProfilePayload = {
      name: data.name,
      email: data.email,
      department: data.department,
      level: data.level,
      avatarUrl: data.avatarUrl || user.avatarUrl, // Prefer new URL if provided, else old one
    };

    const result = await updateProfileAction(user.id, payload);
    setIsLoading(false);

    if (result.success && result.user) {
      setUser(result.user); // Update local user state
      setIsEditing(false);
      toast({ title: "Profile Updated", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.message });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsLoading(true);
    // Simulate password change API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    // Mock response
    const success = Math.random() > 0.3; // 70% chance of success
    if (success) {
        toast({ title: "Password Changed", description: "Your password has been updated successfully." });
        passwordForm.reset();
    } else {
        toast({ variant: "destructive", title: "Password Change Failed", description: "Incorrect current password or an error occurred." });
        passwordForm.setError("currentPassword", {type: "manual", message: "Incorrect current password."})
    }
  }
  
  const getInitials = (name: string) => {
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">My Profile</CardTitle>
          <CardDescription>View and manage your personal information and settings.</CardDescription>
        </CardHeader>
      </Card>

    <Tabs defaultValue="overview" className="w-full" id="settings">
        <TabsList className="grid w-full grid-cols-2 md:w-1/2">
          <TabsTrigger value="overview">Profile Overview</TabsTrigger>
          <TabsTrigger value="security">Security Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
            <Card className="shadow-md">
                <CardHeader className="relative items-center text-center">
                    <div className="relative group">
                        <Avatar className="w-32 h-32 text-4xl border-4 border-primary/50">
                        <AvatarImage src={avatarPreview || undefined} alt={user.name} data-ai-hint="student avatar large" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(user.name)}
                        </AvatarFallback>
                        </Avatar>
                        {isEditing && (
                        <>
                            <input type="file" accept="image/*" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" />
                            <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                className="absolute bottom-1 right-1 rounded-full bg-background/80 hover:bg-background group-hover:opacity-100 md:opacity-0 transition-opacity"
                                onClick={() => avatarInputRef.current?.click()}
                            >
                                <Camera className="h-4 w-4" />
                                <span className="sr-only">Change Avatar</span>
                            </Button>
                        </>
                        )}
                    </div>
                    {!isEditing && (
                        <Button variant="ghost" size="sm" className="mt-2 text-accent hover:text-accent/80" onClick={() => setIsEditing(true)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    )}
                    <CardTitle className="text-2xl mt-4">{user.name}</CardTitle>
                    <CardDescription>{user.studentId} &bull; {user.level} &bull; {user.department}</CardDescription>
                </CardHeader>
                <CardContent className="mt-2">
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                            control={profileForm.control}
                            name="name"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="email"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                <Input type="email" {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="department"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Department</FormLabel>
                                <FormControl>
                                <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                        <FormField
                            control={profileForm.control}
                            name="level"
                            render={({ field }) => (
                            <FormItem>
                                <FormLabel>Level</FormLabel>
                                <FormControl>
                                <Input {...field} disabled={!isEditing} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                            )}
                        />
                         {isEditing && (
                            <FormField
                                control={profileForm.control}
                                name="avatarUrl"
                                render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Avatar URL (Optional)</FormLabel>
                                    <FormControl>
                                    <Input {...field} placeholder="https://example.com/avatar.png" />
                                    </FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">Or click the camera icon on your avatar to upload a file (mocked).</p>
                                </FormItem>
                                )}
                            />
                         )}
                        </div>
                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="outline" onClick={() => { setIsEditing(false); profileForm.reset(); setAvatarPreview(user.avatarUrl || null);}}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save Changes"}
                            </Button>
                            </div>
                        )}
                    </form>
                </Form>
                </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="security">
             <Card className="shadow-md">
                <CardHeader>
                    <CardTitle className="text-xl text-primary">Change Password</CardTitle>
                    <CardDescription>Update your account password regularly for better security.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormField
                                control={passwordForm.control}
                                name="currentPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Current Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="newPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <FormField
                                control={passwordForm.control}
                                name="confirmPassword"
                                render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm New Password</FormLabel>
                                    <FormControl>
                                    <Input type="password" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                                )}
                            />
                            <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isLoading}>
                                {isLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
             </Card>
        </TabsContent>
    </Tabs>

    </div>
  );
}
