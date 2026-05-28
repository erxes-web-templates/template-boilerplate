"use client";

import { FormEvent } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { PasswordInput } from "../../../components/ui/password-input";

type PasswordForm = {
  newPassword: string;
  confirmPassword: string;
};

type ProfileSecurityTabProps = {
  form: PasswordForm;
  loading?: boolean;
  onChange: (field: keyof PasswordForm, value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

const ProfileSecurityTab = ({
  form,
  loading,
  onChange,
  onSubmit,
}: ProfileSecurityTabProps) => (
  <form className="max-w-lg space-y-4" onSubmit={onSubmit}>
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label htmlFor="newPassword">Шинэ нууц үг</Label>
        <PasswordInput
          id="newPassword"
          minLength={8}
          value={form.newPassword}
          onChange={(event) => onChange("newPassword", event.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Нууц үг давтах</Label>
        <PasswordInput
          id="confirmPassword"
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
