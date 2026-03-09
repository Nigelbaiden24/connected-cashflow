import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Organisation {
  id: string;
  organisation_name: string;
  owner_user_id: string;
  subscription_plan: string;
  billing_email: string | null;
  logo_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrganisationMember {
  id: string;
  organisation_id: string;
  user_id: string;
  role: 'admin' | 'member' | 'viewer';
  invited_by: string | null;
  joined_at: string;
  user_email?: string;
  user_name?: string;
}

export interface OrganisationInvitation {
  id: string;
  organisation_id: string;
  email: string;
  role: string;
  invited_by: string | null;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
}

export function useOrganisation() {
  const { toast } = useToast();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [members, setMembers] = useState<OrganisationMember[]>([]);
  const [invitations, setInvitations] = useState<OrganisationInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  const fetchOrganisation = useCallback(async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user's membership
      const { data: membership } = await supabase
        .from('organisation_members')
        .select('organisation_id, role')
        .eq('user_id', user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setOrganisation(null);
        setLoading(false);
        return;
      }

      setUserRole(membership.role);

      // Get organisation
      const { data: org } = await supabase
        .from('organisations')
        .select('*')
        .eq('id', membership.organisation_id)
        .single();

      if (org) setOrganisation(org as Organisation);

      // Get members
      const { data: memberData } = await supabase
        .from('organisation_members')
        .select('*')
        .eq('organisation_id', membership.organisation_id)
        .order('joined_at', { ascending: true });

      if (memberData) {
        // Fetch user profiles for members
        const userIds = memberData.map(m => m.user_id);
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, email, full_name')
          .in('user_id', userIds);

        const enrichedMembers = memberData.map(m => {
          const profile = profiles?.find(p => p.user_id === m.user_id);
          return {
            ...m,
            role: m.role as 'admin' | 'member' | 'viewer',
            user_email: profile?.email || 'Unknown',
            user_name: profile?.full_name || profile?.email || 'Unknown',
          };
        });
        setMembers(enrichedMembers);
      }

      // Get pending invitations
      const { data: inviteData } = await supabase
        .from('organisation_invitations')
        .select('*')
        .eq('organisation_id', membership.organisation_id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (inviteData) setInvitations(inviteData as OrganisationInvitation[]);
    } catch (error: any) {
      console.error('Error fetching organisation:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrganisation();
  }, [fetchOrganisation]);

  const createOrganisation = async (name: string, billingEmail?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: org, error: orgError } = await supabase
        .from('organisations')
        .insert({
          organisation_name: name,
          owner_user_id: user.id,
          billing_email: billingEmail || user.email,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add creator as admin
      const { error: memberError } = await supabase
        .from('organisation_members')
        .insert({
          organisation_id: org.id,
          user_id: user.id,
          role: 'admin',
        });

      if (memberError) throw memberError;

      toast({ title: "Organisation created successfully!" });
      await fetchOrganisation();
      return org;
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      throw error;
    }
  };

  const inviteMember = async (email: string, role: 'admin' | 'member' | 'viewer') => {
    try {
      if (!organisation) throw new Error('No organisation');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('organisation_invitations')
        .insert({
          organisation_id: organisation.id,
          email,
          role,
          invited_by: user.id,
        });

      if (error) throw error;

      toast({ title: "Invitation sent", description: `Invited ${email} as ${role}` });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('organisation_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: "Member removed" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateMemberRole = async (memberId: string, newRole: 'admin' | 'member' | 'viewer') => {
    try {
      const { error } = await supabase
        .from('organisation_members')
        .update({ role: newRole })
        .eq('id', memberId);

      if (error) throw error;

      toast({ title: "Role updated" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('organisation_invitations')
        .update({ status: 'cancelled' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({ title: "Invitation cancelled" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const acceptInvitation = async (token: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the invitation
      const { data: invitation, error: findError } = await supabase
        .from('organisation_invitations')
        .select('*')
        .eq('token', token)
        .eq('status', 'pending')
        .single();

      if (findError || !invitation) throw new Error('Invalid or expired invitation');

      // Add member
      const { error: memberError } = await supabase
        .from('organisation_members')
        .insert({
          organisation_id: invitation.organisation_id,
          user_id: user.id,
          role: invitation.role,
          invited_by: invitation.invited_by,
        });

      if (memberError) throw memberError;

      // Mark invitation as accepted
      await supabase
        .from('organisation_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitation.id);

      toast({ title: "You've joined the organisation!" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const transferOwnership = async (newOwnerId: string) => {
    try {
      if (!organisation) throw new Error('No organisation');

      // Update org owner
      const { error: orgError } = await supabase
        .from('organisations')
        .update({ owner_user_id: newOwnerId })
        .eq('id', organisation.id);

      if (orgError) throw orgError;

      // Ensure new owner is admin
      await supabase
        .from('organisation_members')
        .update({ role: 'admin' })
        .eq('organisation_id', organisation.id)
        .eq('user_id', newOwnerId);

      toast({ title: "Ownership transferred" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const updateOrganisation = async (updates: Partial<Organisation>) => {
    try {
      if (!organisation) throw new Error('No organisation');

      const { error } = await supabase
        .from('organisations')
        .update(updates)
        .eq('id', organisation.id);

      if (error) throw error;

      toast({ title: "Organisation updated" });
      await fetchOrganisation();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  return {
    organisation,
    members,
    invitations,
    loading,
    userRole,
    isAdmin: userRole === 'admin',
    createOrganisation,
    inviteMember,
    removeMember,
    updateMemberRole,
    cancelInvitation,
    acceptInvitation,
    transferOwnership,
    updateOrganisation,
    refresh: fetchOrganisation,
  };
}
