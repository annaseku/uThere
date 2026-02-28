import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, Copy, Check } from "lucide-react";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  group: { group_id: string | number; name: string };
  onAdded: () => void;
}

const AddMemberDialog = ({ open, onClose, group, onAdded }: AddMemberDialogProps) => {
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open) {
      supabase
        .from("groups")
        .select("invite_code")
        .eq("group_id", Number(group.group_id))
        .single()
        .then(({ data }) => {
          if (data) setInviteCode((data as any).invite_code || "");
        });
    }
  }, [open, group.group_id]);

  const handleAddByEmail = async () => {
    if (!email.trim()) return;
    setAdding(true);

    const { data: userData } = await supabase
      .from("users")
      .select("user_id")
      .eq("email", email.trim())
      .single();

    if (!userData) {
      toast.error("No user found with that email");
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
      setEmail("");
      onAdded();
    }
    setAdding(false);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(inviteCode);
    setCopied(true);
    toast.success("Invite code copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Members</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 pt-2">
          {/* Invite code */}
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">
              Share invite code
            </label>
            <div className="flex gap-2">
              <div className="flex-1 bg-muted rounded-lg px-4 py-3 text-center text-lg font-mono tracking-widest text-foreground">
                {inviteCode || "..."}
              </div>
              <Button size="icon" variant="outline" onClick={handleCopyCode} disabled={!inviteCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </Button>
            </div>
            <p className="text-[12px] text-muted-foreground mt-1.5">
              Share this code with anyone you want to invite
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[12px] text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Add by email */}
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">
              Add by email
            </label>
            <div className="flex gap-2">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleAddByEmail()}
              />
              <Button size="icon" variant="outline" onClick={handleAddByEmail} disabled={adding}>
                <UserPlus size={16} />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberDialog;
