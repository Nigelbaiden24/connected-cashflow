import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Users, Globe, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Profile {
  user_id: string;
  email: string;
  full_name: string;
}

export type Platform = "finance" | "investor" | "business" | "all";

interface ContentTargetSelectorProps {
  selectedPlatform: Platform;
  onPlatformChange: (platform: Platform) => void;
  selectedUsers: string[];
  onUsersChange: (users: string[]) => void;
  allUsersSelected: boolean;
  onAllUsersChange: (allUsers: boolean) => void;
}

export function ContentTargetSelector({
  selectedPlatform,
  onPlatformChange,
  selectedUsers,
  onUsersChange,
  allUsersSelected,
  onAllUsersChange,
}: ContentTargetSelectorProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id, email, full_name")
        .order("email");

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error("Error fetching profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUserToggle = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      onUsersChange(selectedUsers.filter((id) => id !== userId));
    } else {
      onUsersChange([...selectedUsers, userId]);
    }
    // If manually selecting users, disable "all users"
    if (allUsersSelected) {
      onAllUsersChange(false);
    }
  };

  const handleAllUsersToggle = (checked: boolean) => {
    onAllUsersChange(checked);
    if (checked) {
      onUsersChange([]);
    }
  };

  return (
    <div className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
      <div className="flex items-center gap-2 mb-2">
        <Globe className="h-4 w-4 text-primary" />
        <span className="font-medium text-sm text-slate-700">Content Target Settings</span>
      </div>

      {/* Platform Selection */}
      <div className="space-y-2">
        <Label htmlFor="platform-select">Target Platform</Label>
        <Select value={selectedPlatform} onValueChange={(value: Platform) => onPlatformChange(value)}>
          <SelectTrigger id="platform-select" className="bg-white">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                All Platforms
              </div>
            </SelectItem>
            <SelectItem value="finance">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Finance</Badge>
              </div>
            </SelectItem>
            <SelectItem value="investor">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Investor</Badge>
              </div>
            </SelectItem>
            <SelectItem value="business">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Business</Badge>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* User Selection */}
      <div className="space-y-2">
        <Label>Target Users</Label>
        
        {/* All Users Toggle */}
        <div className="flex items-center gap-2 p-2 rounded-md bg-white border border-slate-200">
          <Checkbox
            id="all-users"
            checked={allUsersSelected}
            onCheckedChange={handleAllUsersToggle}
          />
          <label htmlFor="all-users" className="flex items-center gap-2 text-sm cursor-pointer">
            <Users className="h-4 w-4 text-slate-500" />
            <span>All Users</span>
            {allUsersSelected && (
              <Badge variant="secondary" className="text-xs">Selected</Badge>
            )}
          </label>
        </div>

        {/* Individual User Selection */}
        {!allUsersSelected && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500">Or select specific users:</p>
            <ScrollArea className="h-40 rounded-md border border-slate-200 bg-white">
              <div className="p-2 space-y-1">
                {loading ? (
                  <p className="text-sm text-slate-400 p-2">Loading users...</p>
                ) : profiles.length === 0 ? (
                  <p className="text-sm text-slate-400 p-2">No users found</p>
                ) : (
                  profiles.map((profile) => (
                    <div
                      key={profile.user_id}
                      className="flex items-center gap-2 p-2 rounded-md hover:bg-slate-50 cursor-pointer"
                      onClick={() => handleUserToggle(profile.user_id)}
                    >
                      <Checkbox
                        checked={selectedUsers.includes(profile.user_id)}
                        onCheckedChange={() => handleUserToggle(profile.user_id)}
                      />
                      <User className="h-3 w-3 text-slate-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">
                          {profile.full_name || profile.email}
                        </p>
                        {profile.full_name && (
                          <p className="text-xs text-slate-400 truncate">{profile.email}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
            {selectedUsers.length > 0 && (
              <p className="text-xs text-slate-500">
                {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
