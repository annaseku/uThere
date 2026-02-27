import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface CreateGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const CreateGroupDialog = ({ open, onClose, onCreated }: CreateGroupDialogProps) => {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim() || !user) return;
    setCreating(true);

    const { data: group, error } = await supabase
      .from("groups")
      .insert({ name: name.trim(), primary_address: address.trim() || null })
      .select()
      .single();

    if (error || !group) {
      toast.error("Failed to create group");
      setCreating(false);
      return;
    }

    // Add self as admin
    const { error: memberError } = await supabase
      .from("group_members")
      .insert({ group_id: group.group_id, user_id: user.id, role: "admin" });

    if (memberError) {
      toast.error("Group created but failed to add you as admin");
    } else {
      toast.success("Group created!");
    }

    setName("");
    setAddress("");
    setCreating(false);
    onCreated();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Group Name</label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Smith Household" />
          </div>
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">Primary Address (optional)</label>
            <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 12 Red Gum Crescent" />
          </div>
          <Button className="w-full" onClick={handleCreate} disabled={creating || !name.trim()}>
            {creating ? "Creating..." : "Create Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateGroupDialog;
