import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useOrganisation } from "@/hooks/useOrganisation";
import { ArrowLeft, Building2, Users, Mail, Crown, Shield, Eye, UserMinus, UserPlus, Settings, Clock, X } from "lucide-react";

export default function OrganisationSettings() {
  const navigate = useNavigate();
  const {
    organisation, members, invitations, loading, isAdmin, userRole,
    inviteMember, removeMember, updateMemberRole, cancelInvitation,
    transferOwnership, updateOrganisation, createOrganisation,
  } = useOrganisation();

  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<'admin' | 'member' | 'viewer'>("member");
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [billingEmail, setBillingEmail] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    await inviteMember(inviteEmail.trim(), inviteRole);
    setInviteEmail("");
    setInviteDialogOpen(false);
  };

  const handleCreate = async () => {
    if (!orgName.trim()) return;
    await createOrganisation(orgName.trim(), billingEmail.trim() || undefined);
    setOrgName("");
    setBillingEmail("");
    setCreateDialogOpen(false);
  };

  const handleUpdateName = async () => {
    if (!newOrgName.trim()) return;
    await updateOrganisation({ organisation_name: newOrgName.trim() });
    setEditingName(false);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="h-4 w-4 text-amber-500" />;
      case 'member': return <Shield className="h-4 w-4 text-blue-500" />;
      case 'viewer': return <Eye className="h-4 w-4 text-muted-foreground" />;
      default: return null;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'default';
      case 'member': return 'secondary';
      case 'viewer': return 'outline';
      default: return 'outline' as const;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading organisation...</p>
      </div>
    );
  }

  // No organisation - show create/join screen
  if (!organisation) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="text-center mb-8">
            <Building2 className="h-16 w-16 mx-auto text-primary mb-4" />
            <h1 className="text-3xl font-bold mb-2">Organisation Setup</h1>
            <p className="text-muted-foreground">Create or join an organisation to collaborate with your team</p>
          </div>

          <div className="grid gap-6">
            <Card className="border-primary/20 hover:border-primary/40 transition-colors">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Create Organisation
                </CardTitle>
                <CardDescription>Start a new organisation and invite your team</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Organisation Name</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Acme Corp" />
                </div>
                <div>
                  <Label>Billing Email (optional)</Label>
                  <Input value={billingEmail} onChange={(e) => setBillingEmail(e.target.value)} placeholder="billing@company.com" type="email" />
                </div>
                <Button onClick={handleCreate} disabled={!orgName.trim()} className="w-full">
                  Create Organisation
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-primary" />
                  Join via Invitation
                </CardTitle>
                <CardDescription>If you've received an invitation, it will automatically appear when you log in with the invited email address.</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>

        {/* Organisation Header */}
        <div className="flex items-start justify-between mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="h-8 w-8 text-primary" />
              {editingName && isAdmin ? (
                <div className="flex items-center gap-2">
                  <Input value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} className="w-64" />
                  <Button size="sm" onClick={handleUpdateName}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditingName(false)}>Cancel</Button>
                </div>
              ) : (
                <h1 className="text-3xl font-bold cursor-pointer" onClick={() => {
                  if (isAdmin) { setNewOrgName(organisation.organisation_name); setEditingName(true); }
                }}>
                  {organisation.organisation_name}
                </h1>
              )}
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {members.length} members</span>
              <Badge variant="outline">{organisation.subscription_plan}</Badge>
              <Badge variant={getRoleBadgeVariant(userRole || 'viewer') as any}>
                {getRoleIcon(userRole || 'viewer')} <span className="ml-1 capitalize">{userRole}</span>
              </Badge>
            </div>
          </div>
          {isAdmin && (
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><UserPlus className="h-4 w-4" /> Invite Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite Team Member</DialogTitle>
                  <DialogDescription>Send an invitation to join your organisation</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>Email Address</Label>
                    <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="colleague@company.com" type="email" />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as any)}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin - Full access</SelectItem>
                        <SelectItem value="member">Member - Standard access</SelectItem>
                        <SelectItem value="viewer">Viewer - Read-only access</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button onClick={handleInvite} disabled={!inviteEmail.trim()} className="w-full">Send Invitation</Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid gap-6">
          {/* Team Members */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> Team Members</CardTitle>
              <CardDescription>{members.length} member{members.length !== 1 ? 's' : ''} in your organisation</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Member</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Joined</TableHead>
                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{member.user_name}</p>
                          <p className="text-sm text-muted-foreground">{member.user_email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {isAdmin && member.user_id !== organisation.owner_user_id ? (
                          <Select value={member.role} onValueChange={(v) => updateMemberRole(member.id, v as any)}>
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Admin</SelectItem>
                              <SelectItem value="member">Member</SelectItem>
                              <SelectItem value="viewer">Viewer</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <Badge variant={getRoleBadgeVariant(member.role) as any} className="gap-1">
                            {getRoleIcon(member.role)}
                            <span className="capitalize">{member.role}</span>
                            {member.user_id === organisation.owner_user_id && <Crown className="h-3 w-3 text-amber-500 ml-1" />}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(member.joined_at).toLocaleDateString()}
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          {member.user_id !== organisation.owner_user_id && (
                            <div className="flex items-center gap-2 justify-end">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                                    <UserMinus className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Remove member?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This will remove {member.user_name} from the organisation. They will lose access to all shared data.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => removeMember(member.id)}>Remove</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Pending Invitations */}
          {invitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" /> Pending Invitations</CardTitle>
                <CardDescription>{invitations.length} pending invitation{invitations.length !== 1 ? 's' : ''}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead>Expires</TableHead>
                      {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations.map((inv) => (
                      <TableRow key={inv.id}>
                        <TableCell className="font-medium">{inv.email}</TableCell>
                        <TableCell><Badge variant="outline" className="capitalize">{inv.role}</Badge></TableCell>
                        <TableCell className="text-muted-foreground">{new Date(inv.created_at).toLocaleDateString()}</TableCell>
                        <TableCell className="text-muted-foreground">{new Date(inv.expires_at).toLocaleDateString()}</TableCell>
                        {isAdmin && (
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" className="text-destructive" onClick={() => cancelInvitation(inv.id)}>
                              <X className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Organisation Settings */}
          {isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Settings className="h-5 w-5" /> Organisation Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Billing Email</Label>
                    <div className="flex gap-2">
                      <Input
                        value={organisation.billing_email || ''}
                        onChange={() => {}}
                        placeholder="billing@company.com"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Contact support to update billing email</p>
                  </div>
                  <div>
                    <Label>Subscription Plan</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge className="capitalize">{organisation.subscription_plan}</Badge>
                      <Button variant="link" size="sm" onClick={() => navigate('/pricing')}>Upgrade Plan</Button>
                    </div>
                  </div>
                </div>

                {/* Transfer Ownership */}
                <div className="pt-4 border-t">
                  <h4 className="font-medium mb-2 text-destructive">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-3">Transfer ownership to another admin member</p>
                  <Select onValueChange={(userId) => transferOwnership(userId)}>
                    <SelectTrigger className="w-64">
                      <SelectValue placeholder="Select new owner..." />
                    </SelectTrigger>
                    <SelectContent>
                      {members
                        .filter(m => m.role === 'admin' && m.user_id !== organisation.owner_user_id)
                        .map(m => (
                          <SelectItem key={m.user_id} value={m.user_id}>{m.user_name}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
