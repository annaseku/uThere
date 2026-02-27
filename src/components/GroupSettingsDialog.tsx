import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";

interface GroupSettingsDialogProps {
  open: boolean;
  onClose: () => void;
  group: { group_id: string | number; name: string; primary_address?: string };
  onUpdated: () => void;
}

const GroupSettingsDialog = ({ open, onClose, group, onUpdated }: GroupSettingsDialogProps) => {
  const [name, setName] = useState(group.name);
  const [address, setAddress] = useState(group.primary_address ?? "");
  const [memberEmail, setMemberEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("groups")
      .update({ name, primary_address: address || null } as any)
      .eq("group_id", Number(group.group_id));

    if (error) toast.error("Failed to update group");
    else {
      toast.success("Group updated");
      onUpdated();
    }
    setSaving(false);
  };

  const handleAddMember = async () => {
    if (!memberEmail.trim()) return;
    setAdding(true);

    // Find user by email
    const { data: userData } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", memberEmail.trim())
      .single();

    if (!userData) {
      toast.error("User not found with that email");
      setAdding(false);
      return;
    }

    const { error } = await supabase.from("group_members").insert({
      group_id: Number(group.group_id),
      user_id: userData.user_id,
      role: "member",
    });

    if (error) {
      if (error.code === "23505") toast.error("Already a member");
      else toast.error("Failed to add member");
    } else {
      toast.success("Member added!");
      setMemberEmail("");
      onUpdated();
    }
    setAdding(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Group Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Group Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Primary Address</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Main St" />
          </div>
          <Button className="w-full" onClick={handleSave} disabled={saving}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>

          <div className="border-t border-border pt-4">
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Add Member by Email</label>
            <div className="flex gap-2">
              <Input
                value={memberEmail}
                onChange={e => setMemberEmail(e.target.value)}
                placeholder="user@example.com"
                onKeyDown={e => e.key === "Enter" && handleAddMember()}
              />
              <Button size="icon" variant="outline" onClick={handleAddMember} disabled={adding}>
                <UserPlus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupSettingsDialog;
