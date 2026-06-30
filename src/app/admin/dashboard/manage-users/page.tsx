"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle, Search, Edit, Trash2, Loader2 } from "lucide-react";
import type { User } from "@/types";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

// mockInitialUsers are updated with requested instructors and admin
const mockInitialUsers: User[] = [
  { id: "usr1", name: "Aisha Bello", email: "aisha.bello@siat.edu.ng", studentId: "SIAT/CSC/001", role: "student", department: "Computer Science", level: "300 Level" },
  { id: "usr2", name: "Dr. Ibrahim Musa", email: "instructor@siat.edu.ng", studentId: "STF/012", role: "instructor", department: "Mathematics" },
  { id: "usr3", name: "Yusuf Ahmed", email: "yusuf.ahmed@siat.edu.ng", studentId: "SIAT/ENG/005", role: "student", department: "Engineering", level: "200 Level" },
  { id: "usr4", name: "Admin User", email: "admin@siat.edu.ng", studentId: "ADM/001", role: "admin" },
  { id: "usr5", name: "Dr. Sani Mohammed", email: "sani.mohammed@siat.edu.ng", studentId: "STF/045", role: "instructor", department: "Computer Science" },
  { id: "usr6", name: "Mrs. Grace Bitrus", email: "grace.bitrus@siat.edu.ng", studentId: "STF/067", role: "instructor", department: "Business Administration" },
  { id: "usr7", name: "Super Admin", email: "superadmin@siat.edu.ng", studentId: "ADM/002", role: "admin" },
];

const newUserFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  studentId: z.string().min(3, "User ID is required (Student Matric/Staff ID)."), 
  role: z.enum(["student", "instructor", "admin"], { required_error: "Role is required." }),
  department: z.string().optional(),
  level: z.string().optional(),
});
type NewUserFormValues = z.infer<typeof newUserFormSchema>;

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>(mockInitialUsers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (typeof document !== 'undefined') {
        document.title = 'Manage Users - Admin Dashboard';
    }
  }, []);

  const form = useForm<NewUserFormValues>({
    resolver: zodResolver(newUserFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      studentId: "",
      role: undefined,
      department: "",
      level: "",
    },
  });

  const handleAddUserSubmit = async (data: NewUserFormValues) => {
    setIsSubmitting(true);
    
    try {
        const response = await fetch('https://sajfoods.com.ng/siat/add-user.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const result = await response.json();

        if (result.success) {
            toast({ title: "User Added Successfully", description: result.message });
            const newUserForDisplay: User = {
                id: `usr_${Date.now()}`,
                ...data,
            };
            setUsers(prev => [newUserForDisplay, ...prev]);
            setIsAddUserDialogOpen(false);
            form.reset();
        } else {
            toast({ variant: "destructive", title: "Failed to Add User", description: result.message || "An error occurred on the server." });
             if (result.message && result.message.toLowerCase().includes("email")) {
                form.setError("email", { type: "manual", message: result.message });
            } else if (result.message && (result.message.toLowerCase().includes("staff id") || result.message.toLowerCase().includes("student matriculation"))) {
                form.setError("studentId", { type: "manual", message: result.message });
            }
        }
    } catch (error) {
        console.error("Error submitting new user:", error);
        toast({ variant: "destructive", title: "Network Error", description: "Could not connect to the server to add user." });
    }

    setIsSubmitting(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.studentId && user.studentId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Manage Users</CardTitle>
          <CardDescription>View, add, edit, or remove users from the system. New users will be added to the central login table.</CardDescription>
        </CardHeader>
      </Card>

      <Card className="shadow-md">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-1 md:grow-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search users..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Dialog open={isAddUserDialogOpen} onOpenChange={(isOpen) => {
            setIsAddUserDialogOpen(isOpen);
            if (!isOpen) form.reset(); 
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-primary">Add New User</DialogTitle>
                <DialogDescription>Enter the details for the new user account. This will create an account in the system.</DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleAddUserSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
                  <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                   <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="studentId" render={({ field }) => (
                    <FormItem><FormLabel>User ID (Student Matric/Staff ID)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="role" render={({ field }) => (
                    <FormItem><FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="instructor">Instructor</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="department" render={({ field }) => (
                    <FormItem><FormLabel>Department (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="level" render={({ field }) => (
                    <FormItem><FormLabel>Level (Optional, for students)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <DialogFooter className="mt-6">
                    <DialogClose asChild><Button type="button" variant="outline" disabled={isSubmitting}>Cancel</Button></DialogClose>
                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {isSubmitting ? "Adding User..." : "Add User to System"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.studentId}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>{user.department || "N/A"}</TableCell>
                    <TableCell>{user.level || "N/A"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" className="hover:text-primary" title="Edit user">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Delete user">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredUsers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      No users found matching your search criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
