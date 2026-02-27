import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface EditFieldDialogProps {
  open: boolean;
  onClose: () => void;
  label: string;
  value: string;
  onSave: (value: string) => void;
}

const EditFieldDialog = ({ open, onClose, label, value, onSave }: EditFieldDialogProps) => {
  const [val, setVal] = useState(value);

  const handleSave = () => {
    onSave(val);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit {label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <Input value={val} onChange={e => setVal(e.target.value)} placeholder={label} />
          <Button className="w-full" onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditFieldDialog;
