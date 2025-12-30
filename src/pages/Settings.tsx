import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Building2, 
  CreditCard, 
  Users, 
  Upload,
  Crown,
  UserPlus,
  Database
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ConnectionTest } from "@/components/ConnectionTest";

const Settings = () => {
  const { user } = useAuth();
  const [workspaceName, setWorkspaceName] = useState("My Workspace");
  const [teamMembers, setTeamMembers] = useState([
    { id: "1", email: user?.email || "you@example.com", role: "Owner" },
    { id: "2", email: "member@example.com", role: "Member" },
  ]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Member");

  const handleInvite = () => {
    if (inviteEmail) {
      setTeamMembers([
        ...teamMembers,
        { id: Date.now().toString(), email: inviteEmail, role: inviteRole },
      ]);
      setInviteEmail("");
      setInviteRole("Member");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your workspace, billing, and team</p>
      </div>

      <Tabs defaultValue="workspace" className="space-y-6">
        <TabsList>
          <TabsTrigger value="workspace">Workspace</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
        </TabsList>

        {/* Workspace Settings */}
        <TabsContent value="workspace" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Building2 className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Workspace Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <Label htmlFor="workspace-name">Workspace Name</Label>
                <Input
                  id="workspace-name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label>Workspace Logo</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                    <SettingsIcon className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <div>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Logo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 2MB
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="gradient">Save Changes</Button>
            </div>
          </Card>
        </TabsContent>

        {/* Billing Settings */}
        <TabsContent value="billing" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <CreditCard className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Billing & Subscription</h2>
            </div>
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold">Current Plan</h3>
                    <p className="text-sm text-muted-foreground">Pro Plan - $29/month</p>
                  </div>
                  <Badge variant="default" className="gap-2">
                    <Crown className="w-3 h-3" />
                    Active
                  </Badge>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Billing cycle</span>
                    <span className="font-medium">Monthly</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Next billing date</span>
                    <span className="font-medium">February 15, 2024</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment method</span>
                    <span className="font-medium">•••• •••• •••• 4242</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold">Change Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 border-2 border-border hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      <h4 className="font-semibold mb-1">Free</h4>
                      <p className="text-2xl font-bold mb-2">$0</p>
                      <p className="text-xs text-muted-foreground mb-3">1 account</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Select
                      </Button>
                    </div>
                  </Card>
                  <Card className="p-4 border-2 border-primary hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      <Badge className="mb-2">Current</Badge>
                      <h4 className="font-semibold mb-1">Pro</h4>
                      <p className="text-2xl font-bold mb-2">$29</p>
                      <p className="text-xs text-muted-foreground mb-3">5 accounts</p>
                      <Button variant="gradient" size="sm" className="w-full" disabled>
                        Current Plan
                      </Button>
                    </div>
                  </Card>
                  <Card className="p-4 border-2 border-border hover:border-primary transition-colors cursor-pointer">
                    <div className="text-center">
                      <h4 className="font-semibold mb-1">Agency</h4>
                      <p className="text-2xl font-bold mb-2">$99</p>
                      <p className="text-xs text-muted-foreground mb-3">Unlimited</p>
                      <Button variant="outline" size="sm" className="w-full">
                        Upgrade
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Team Settings */}
        <TabsContent value="team" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Team Management</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4">Team Members</h3>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <Users className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{member.email}</p>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      {member.role !== "Owner" && (
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4">Invite Team Member</h3>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <Select value={inviteRole} onValueChange={setInviteRole}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Member">Member</SelectItem>
                      <SelectItem value="Admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="gradient" onClick={handleInvite} className="gap-2">
                    <UserPlus className="w-4 h-4" />
                    Invite
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Connection Test */}
        <TabsContent value="connection" className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Database Connection</h2>
            </div>
            <ConnectionTest />
            <div className="mt-6 p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Setup Instructions</h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>Create a <code className="bg-background px-1 py-0.5 rounded">.env</code> file in the project root</li>
                <li>Add your Supabase credentials:
                  <pre className="mt-2 p-2 bg-background rounded text-xs">
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key`}
                  </pre>
                </li>
                <li>Get your credentials from Supabase Dashboard → Settings → API</li>
                <li>Restart the dev server after adding environment variables</li>
                <li>Run database migrations in Supabase SQL Editor</li>
              </ol>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;

