
"use client";
import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Placeholder page for Admin Settings

export default function AdminSettingsPage() {
  useState(() => { if (typeof document !== 'undefined') document.title = 'System Settings - Admin'; }, []);
  const { toast } = useToast();

  // Mock settings state
  const [portalName, setPortalName] = useState("SIAT-Institute, Zaria Student Portal");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [registrationOpen, setRegistrationOpen] = useState(true);

  const handleSaveChanges = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save action
    console.log("Admin Settings Saved:", { portalName, maintenanceMode, registrationOpen });
    toast({ title: "Settings Saved", description: "System settings have been updated." });
  };

  return (
    <div className="p-4 space-y-6">
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">System Settings</CardTitle>
                <CardDescription>Configure general settings for the student portal.</CardDescription>
            </CardHeader>
        </Card>
        <Card className="shadow-md">
            <CardContent className="pt-6">
                <form onSubmit={handleSaveChanges} className="space-y-6">
                    <div>
                        <Label htmlFor="portalName">Portal Name</Label>
                        <Input 
                            id="portalName" 
                            value={portalName} 
                            onChange={(e) => setPortalName(e.target.value)} 
                        />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                            <Label htmlFor="maintenanceMode" className="font-medium">Maintenance Mode</Label>
                            <p className="text-xs text-muted-foreground">Temporarily disable access to the portal for users.</p>
                        </div>
                        <Switch 
                            id="maintenanceMode" 
                            checked={maintenanceMode} 
                            onCheckedChange={setMaintenanceMode}
                        />
                    </div>

                     <div className="flex items-center justify-between p-3 border rounded-md">
                        <div>
                            <Label htmlFor="registrationOpen" className="font-medium">New Student Registration</Label>
                            <p className="text-xs text-muted-foreground">Enable or disable new student intake registrations.</p>
                        </div>
                        <Switch 
                            id="registrationOpen" 
                            checked={registrationOpen} 
                            onCheckedChange={setRegistrationOpen}
                        />
                    </div>
                    
                    {/* Add more settings as needed: semester dates, theme customization triggers, etc. */}

                    <Button type="submit" className="bg-accent hover:bg-accent/90 text-accent-foreground">Save Changes</Button>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}
