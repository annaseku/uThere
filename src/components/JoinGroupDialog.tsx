import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface JoinGroupDialogProps {
  open: boolean;
  onClose: () => void;
  onJoined: () => void;
}

const JoinGroupDialog = ({ open, onClose, onJoined }: JoinGroupDialogProps) => {
  const [code, setCode] = useState("");
  const [joining, setJoining] = useState(false);

  const handleJoin = async () => {
    if (!code.trim()) return;
    setJoining(true);

    const { error } = await supabase.rpc("join_group_by_code", {
      _code: code.trim().toUpperCase(),
    });

    if (error) {
      if (error.message.includes("Already a member")) {
        toast.error("You're already in this group");
      } else if (error.message.includes("Invalid invite code")) {
        toast.error("Invalid invite code");
      } else {
        toast.error("Failed to join group");
      }
    } else {
      toast.success("Joined group!");
      setCode("");
      onJoined();
      onClose();
    }
    setJoining(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join a Group</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-[13px] font-medium text-muted-foreground mb-1 block">
              Enter invite code
            </label>
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. A1B2C3"
              maxLength={6}
              className="text-center text-lg tracking-widest font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleJoin()}
            />
          </div>
          <Button className="w-full" onClick={handleJoin} disabled={joining || code.trim().length < 4}>
            {joining ? "Joining..." : "Join Group"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JoinGroupDialog;
