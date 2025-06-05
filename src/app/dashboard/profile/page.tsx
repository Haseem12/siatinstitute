"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, ShieldCheck, KeyRound, Camera, Loader2, UserCog } from "lucide-react";
import type { NewIntakeApplicationData } from "@/types";
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
import Image from "next/image"; // Keep for avatar preview if needed
import { mapRawApplicantData } from "@/lib/mapRawApplicantData"; // Import a shared mapper

// Schema for the profile form (subset of NewIntakeApplicationData)
const profileFormSchema = z.object({
  fullName: z.string().min(3, { message: "Name must be at least 3 characters." }),
  email: z.string().email({ message: "Please enter a valid email." }),
  department: z.string().optional(),
  level: z.string().optional(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  avatarUrl: z.string().url({ message: "Please enter a valid URL for avatar."}).optional(),
  // avatarFile: typeof window !== 'undefined' ? z.instanceof(FileList).optional() : z.any().optional(),
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
  const [applicantData, setApplicantData] = React.useState<NewIntakeApplicationData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = React.useState(true);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = React.useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const avatarInputRef = React.useRef<HTMLInputElement>(null);

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      department: "",
      level: "",
      phoneNumber: "",
      address: "",
      avatarUrl: "",
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: ""},
  });

  React.useEffect(() => {
    document.title = "My Profile - SIAT Institute";
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      const userEmail = localStorage.getItem("userEmail");
      if (!userEmail) {
        toast({ variant: "destructive", title: "Error", description: "User email not found. Please log in again." });
        setIsLoadingProfile(false);
        // router.push("/"); // Optional: redirect to login
        return;
      }

      try {
        const response = await fetch(`https://sajfoods.net/api/siat/get-applicant-details-by-email.php?email=${encodeURIComponent(userEmail)}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: `API Error: ${response.status}` }));
          throw new Error(errorData.message || "Failed to fetch profile data.");
        }
        const result = await response.json();
        if (result.success && result.data) {
          const mappedData = mapRawApplicantData(result.data);
          setApplicantData(mappedData);
          profileForm.reset({
            fullName: mappedData.fullName,
            email: mappedData.email,
            department: mappedData.department,
            level: mappedData.level,
            phoneNumber: mappedData.phoneNumber,
            address: mappedData.address,
            avatarUrl: mappedData.photograph?.name ? `https://placehold.co/150x150.png?text=${mappedData.photograph.name.substring(0,3)}` : (mappedData as any).avatarUrl, // Use avatarUrl if directly available
          });
          setAvatarPreview(mappedData.photograph?.name ? `https://placehold.co/150x150.png?text=PHOTO` : (mappedData as any).avatarUrl || null);
        } else {
          toast({ variant: "destructive", title: "Profile Load Error", description: result.message || "Could not load your profile." });
        }
      } catch (error: any) {
        toast({ variant: "destructive", title: "Profile Load Error", description: error.message });
      } finally {
        setIsLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [profileForm, toast]);

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
        // For this example, we assume avatarUrl will be set if user types it, or this preview is for local display only before submitting a real file.
        // If you were actually uploading the file, you'd use profileForm.setValue('avatarFile', event.target.files)
        // and then process it in onProfileSubmit. For now, if user provides avatarUrl in form, that's used.
        toast({ title: "Avatar Preview Updated", description: "Save changes to apply. (URL input takes precedence if filled)." });
      };
      reader.readAsDataURL(file);
    }
  };

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!applicantData?.applicationId) {
      toast({variant: "destructive", title: "Error", description: "Application ID not found. Cannot update profile."});
      return;
    }
    setIsUpdatingProfile(true);
    
    const payload: UpdateProfilePayload = {
      name: data.fullName,
      email: data.email,
      department: data.department,
      level: data.level,
      phoneNumber: data.phoneNumber,
      address: data.address,
      avatarUrl: data.avatarUrl || avatarPreview || applicantData.photograph?.name, // Logic for avatar URL
    };

    const result = await updateProfileAction(applicantData.applicationId, payload);
    setIsUpdatingProfile(false);

    if (result.success && result.user) {
      setApplicantData(result.user); // Update local state with returned user data
      profileForm.reset({ // Re-initialize form with potentially updated data
        fullName: result.user.fullName,
        email: result.user.email,
        department: result.user.department,
        level: result.user.level,
        phoneNumber: result.user.phoneNumber,
        address: result.user.address,
        avatarUrl: result.user.photograph?.name ? `https://placehold.co/150x150.png?text=${result.user.photograph.name.substring(0,3)}` : (result.user as any).avatarUrl,
      });
      setAvatarPreview(result.user.photograph?.name ? `https://placehold.co/150x150.png?text=PHOTO` : (result.user as any).avatarUrl || null);
      setIsEditing(false);
      toast({ title: "Profile Updated", description: result.message });
    } else {
      toast({ variant: "destructive", title: "Update Failed", description: result.message });
    }
  }

  async function onPasswordSubmit(data: PasswordFormValues) {
    setIsUpdatingPassword(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
    setIsUpdatingPassword(false);
    const success = Math.random() > 0.3; // Mock success
    if (success) {
        toast({ title: "Password Changed", description: "Your password has been updated successfully. (Mocked)" });
        passwordForm.reset();
    } else {
        toast({ variant: "destructive", title: "Password Change Failed", description: "Incorrect current password or an error occurred. (Mocked)" });
        passwordForm.setError("currentPassword", {type: "manual", message: "Incorrect current password. (Mocked)"})
    }
  }
  
  const getInitials = (name?: string) => {
    if (!name) return "SI";
    const names = name.split(' ');
    if (names.length === 1) return names[0].substring(0, 2).toUpperCase();
    return (names[0][0] + names[names.length - 1][0]).toUpperCase();
  }

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-10rem)]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Loading profile...</p>
      </div>
    );
  }
  
  if (!applicantData && !isLoadingProfile) {
     return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-10rem)] text-center">
        <UserCog className="h-16 w-16 text-destructive mb-4" />
        <h2 className="text-xl font-semibold text-destructive">Profile Data Not Found</h2>
        <p className="text-muted-foreground">Could not load your profile information. Please try logging out and back in, or contact support.</p>
      </div>
    );
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
                    <div className="relative group mx-auto">
                        <Avatar className="w-32 h-32 text-4xl border-4 border-primary/50">
                        <AvatarImage src={avatarPreview || undefined} alt={applicantData?.fullName || "User"} data-ai-hint="student avatar large" />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(applicantData?.fullName)}
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
                                title="Change Avatar"
                            >
                                <Camera className="h-4 w-4" />
                            </Button>
                        </>
                        )}
                    </div>
                    {!isEditing && (
                        <Button variant="ghost" size="sm" className="mt-2 text-accent hover:text-accent/80" onClick={() => setIsEditing(true)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
                        </Button>
                    )}
                    <CardTitle className="text-2xl mt-4">{applicantData?.fullName}</CardTitle>
                    <CardDescription>{applicantData?.applicationId} &bull; {applicantData?.level || "N/A"} &bull; {applicantData?.department || "N/A"}</CardDescription>
                </CardHeader>
                <CardContent className="mt-2">
                <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={profileForm.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email Address</FormLabel><FormControl><Input type="email" {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                         <FormField control={profileForm.control} name="phoneNumber" render={({ field }) => (
                            <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="address" render={({ field }) => (
                            <FormItem><FormLabel>Address</FormLabel><FormControl><Input {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="department" render={({ field }) => (
                            <FormItem><FormLabel>Department</FormLabel><FormControl><Input {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                        <FormField control={profileForm.control} name="level" render={({ field }) => (
                            <FormItem><FormLabel>Level</FormLabel><FormControl><Input {...field} disabled={!isEditing || isLoadingProfile} /></FormControl><FormMessage /></FormItem>
                        )} />
                         {isEditing && (
                            <FormField control={profileForm.control} name="avatarUrl" render={({ field }) => (
                                <FormItem className="md:col-span-2">
                                    <FormLabel>Avatar URL (Optional)</FormLabel>
                                    <FormControl><Input {...field} placeholder="https://example.com/avatar.png" disabled={isLoadingProfile} /></FormControl>
                                    <FormMessage />
                                    <p className="text-xs text-muted-foreground">Or click the camera icon on your avatar to upload a file (preview only, URL takes precedence if filled).</p>
                                </FormItem>
                            )} />
                         )}
                        </div>
                        {isEditing && (
                            <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="outline" onClick={() => { 
                                setIsEditing(false); 
                                if (applicantData) {
                                   profileForm.reset({
                                        fullName: applicantData.fullName,
                                        email: applicantData.email,
                                        department: applicantData.department,
                                        level: applicantData.level,
                                        phoneNumber: applicantData.phoneNumber,
                                        address: applicantData.address,
                                        avatarUrl: applicantData.photograph?.name ? `https://placehold.co/150x150.png?text=${applicantData.photograph.name.substring(0,3)}` : (applicantData as any).avatarUrl,
                                    });
                                    setAvatarPreview(applicantData.photograph?.name ? `https://placehold.co/150x150.png?text=PHOTO` : (applicantData as any).avatarUrl || null);
                                }
                            }}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isUpdatingProfile || isLoadingProfile}>
                                {isUpdatingProfile ? <Loader2 className="animate-spin mr-2"/> : null}
                                {isUpdatingProfile ? "Saving..." : "Save Changes"}
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
                    <CardDescription>Update your account password regularly for better security. (Mock functionality)</CardDescription>
                </CardHeader>
                <CardContent>
                     <Form {...passwordForm}>
                        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                            <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                                <FormItem><FormLabel>Current Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                                <FormItem><FormLabel>New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                                <FormItem><FormLabel>Confirm New Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                            )} />
                            <Button type="submit" className="bg-accent hover:bg-accent/80 text-accent-foreground" disabled={isUpdatingPassword}>
                                {isUpdatingPassword ? <Loader2 className="animate-spin mr-2"/> : null}
                                {isUpdatingPassword ? "Updating..." : "Update Password"}
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
