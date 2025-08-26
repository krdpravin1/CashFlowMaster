import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface UserSwitcherProps {
  value: string;
  onValueChange: (value: string) => void;
}

export default function UserSwitcher({ value, onValueChange }: UserSwitcherProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700" data-testid="text-user-switcher-label">
        Active User
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="w-full" data-testid="select-active-user">
          <SelectValue placeholder="Select active user" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="current" data-testid="option-current-user">
            Current User
          </SelectItem>
          <SelectItem value="partner" data-testid="option-partner">
            Partner
          </SelectItem>
          <SelectItem value="shared" data-testid="option-shared-account">
            Shared Account
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
