
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

const mockInitialUsers: User[] = [
  { id: "usr1", name: "Aisha Bello", email: "aisha.bello@siat.edu.ng", studentId: "SIAT/CSC/001", role: "student", department: "Computer Science", level: "300 Level" },
  { id: "usr2", name: "Dr. Ibrahim Musa", email: "instructor@siat.edu.ng", studentId: "STF/012", role: "instructor", department: "Mathematics" },
  { id: "usr3", name: "Yusuf Ahmed", email: "yusuf.ahmed@siat.edu.ng", studentId: "SIAT/ENG/005", role: "student", department: "Engineering", level: "200 Level" },
  { id: "usr4", name: "Admin User", email: "admin@siat.edu.ng", studentId: "ADM/001", role: "admin" },
];

const newUserFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  studentId: z.string().min(3, "User ID is required."), // Can be student or staff ID
  role: z.enum(["student", "instructor", "admin"], { required_error: "Role is required." }),
  department: z.string().optional(),
  level: z.string().optional(),
});
type NewUserFormValues = z.infer<typeof newUserFormSchema>;

export default function ManageUsersPage() {
  const { toast } = useToast();
  const [users, setUsers] = React.useState<User[]>(() => {
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("mockAddedUsers");
      const addedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      const combined = [...mockInitialUsers];
      addedUsers.forEach((addedUser: User) => {
        if (!combined.some(u => u.email === addedUser.email)) {
          combined.push(addedUser);
        }
      });
      return combined;
    }
    return mockInitialUsers;
  });
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
    const newUser: User = {
      id: `usr${users.length + 1}_${Date.now()}`, 
      ...data,
    };

    if (users.some(u => u.email === newUser.email) || initialMockUsers.some(u => u.email === newUser.email)) {
        toast({ variant: "destructive", title: "Error", description: "User with this email already exists." });
        form.setError("email", {message: "User with this email already exists."});
        setIsSubmitting(false);
        return;
    }
    if (users.some(u => u.studentId === newUser.studentId) || initialMockUsers.some(u => u.studentId === newUser.studentId)) {
        toast({ variant: "destructive", title: "Error", description: "User with this ID already exists." });
        form.setError("studentId", {message: "User with this ID already exists."});
        setIsSubmitting(false);
        return;
    }

    // Simulate short delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // 1. Update local state for immediate UI feedback
    setUsers(prev => [newUser, ...prev]);

    // 2. Add to localStorage for mock persistence across sessions (for login page)
    if (typeof window !== 'undefined') {
      const storedUsers = localStorage.getItem("mockAddedUsers");
      const addedUsers = storedUsers ? JSON.parse(storedUsers) : [];
      localStorage.setItem("mockAddedUsers", JSON.stringify([...addedUsers, newUser]));
    }

    toast({ title: "User Added Locally", description: `${newUser.name} has been added to the local list and localStorage.` });
    
    setIsAddUserDialogOpen(false);
    form.reset();
    setIsSubmitting(false);
  };

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Manage Users</CardTitle>
          <CardDescription>View, add, edit, or remove users from the system.</CardDescription>
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
            if (!isOpen) form.reset(); // Reset form when dialog closes
          }}>
            <DialogTrigger asChild>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New User
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-primary">Add New User</DialogTitle>
                <DialogDescription>Enter the details for the new user account. This will save to localStorage for this prototype.</DialogDescription>
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
                    <FormItem><FormLabel>User ID (Student/Staff)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
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
                      {isSubmitting ? "Adding User..." : "Add User"}
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
                      <Button variant="ghost" size="icon" className="hover:text-primary" title="Edit user (not implemented)">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:text-destructive" title="Delete user (not implemented)">
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
