"use client";

import { FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type PasswordForm = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

type ProfileSecurityTabProps = {
  form: PasswordForm;
  loading?: boolean;
  onChange: (field: keyof PasswordForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const ProfileSecurityTab = ({ form, loading, onChange, onSubmit }: ProfileSecurityTabProps) => (
  <form className="max-w-lg space-y-4" onSubmit={onSubmit}>
    <div className="space-y-2">
      <Label htmlFor="currentPassword">Одоогийн нууц үг</Label>
      <Input
        id="currentPassword"
        type="password"
        value={form.currentPassword}
        onChange={(event) => onChange("currentPassword", event.target.value)}
        required
      />
    </div>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Шинэ нууц үг</Label>
        <Input
          id="newPassword"
          type="password"
          minLength={8}
          value={form.newPassword}
          onChange={(event) => onChange("newPassword", event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Нууц үг давтах</Label>
        <Input
          id="confirmPassword"
          type="password"
          minLength={8}
          value={form.confirmPassword}
          onChange={(event) => onChange("confirmPassword", event.target.value)}
          required
        />
      </div>
    </div>

    <Button type="submit" disabled={loading}>
      {loading ? "Шинэчилж байна…" : "Нууц үг шинэчлэх"}
    </Button>
  </form>
);

export default ProfileSecurityTab;
