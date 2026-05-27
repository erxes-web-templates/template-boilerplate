"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@apollo/client";
import { mutations } from "../../../graphql/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { PasswordInput } from "../../../components/ui/password-input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { templateUrl } from "../../../lib/utils";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? undefined;
  const identifier = searchParams.get("identifier") ?? undefined;

  if (!token) {
    return (
      <div className="flex my-[100px] items-center justify-center px-6 py-12">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-2 text-center">
            <div className="flex justify-center">
              <AlertCircle className="h-12 w-12 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-semibold">Invalid reset link</CardTitle>
            <CardDescription>
              This password reset link is missing or invalid. Please request a
              new one from the login page.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center text-sm text-muted-foreground">
            <Link
              href={templateUrl("/auth/login")}
              className="font-medium text-primary hover:underline"
            >
              Back to sign in
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [resetPassword, { loading }] = useMutation(mutations.resetPassword, {
    onError(error) {
      toast("Reset failed", { description: error.message });
    },
    onCompleted() {
      toast("Password updated", {
        description: "You can now sign in with your new password.",
      });
      router.push(templateUrl("/auth/login"));
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (newPassword !== confirm) {
      toast("Passwords do not match");
      return;
    }
    await resetPassword({ variables: { newPassword, token, identifier } });
  };

  return (
    <div className="flex my-[100px] items-center justify-center bg-muted/20 px-6 py-12">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">Set new password</CardTitle>
          <CardDescription>
            Choose a strong password for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="newPassword">New password</Label>
              <PasswordInput
                id="newPassword"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm password</Label>
              <PasswordInput
                id="confirm"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                minLength={8}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Updating…" : "Update password"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <Link
            href={templateUrl("/auth/login")}
            className="font-medium text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
