"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from "next/navigation";
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
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Button } from "../../../components/ui/button";
import { toast } from "sonner";
import { templateUrl } from "../../../lib/utils";

const resolveClientPortalId = (
  paramsValue?: string | string[],
  searchValue?: string | null
) => {
  if (searchValue) {
    return searchValue;
  }

  if (Array.isArray(paramsValue)) {
    return paramsValue[0] ?? "";
  }

  return paramsValue ?? "";
};

export default function RegisterPage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();

  const clientPortalId = resolveClientPortalId(
    process.env.ERXES_CP_ID || params?.id,
    searchParams?.get("clientPortalId")
  );

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    username: "",
    password: "",
  });

  const [registerMutation, { loading }] = useMutation(mutations.createUser, {
    onError(error) {
      toast("Registration failed", {
        description: error.message,
      });
    },
    onCompleted() {
      toast("Account created", {
        description: "You can now log in with your new credentials.",
      });
      router.push(templateUrl("/auth/login"));
    },
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!clientPortalId) {
      toast("Client portal not configured", {
        description:
          "Missing client portal identifier. Please contact support.",
      });
      return;
    }

    await registerMutation({
      variables: {
        clientPortalId,
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        phone: formState.phone,
        username: formState.username,
        password: formState.password,
      },
    });
  };

  const handleChange =
    (field: keyof typeof formState) =>
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setFormState((prev) => ({
        ...prev,
        [field]: event.target.value,
      }));
    };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/20 px-6 py-12">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-semibold">
            Create an account
          </CardTitle>
          <CardDescription>
            Fill in your details to get started.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="firstName">First name</Label>
              <Input
                id="firstName"
                value={formState.firstName}
                onChange={handleChange("firstName")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last name</Label>
              <Input
                id="lastName"
                value={formState.lastName}
                onChange={handleChange("lastName")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={formState.email}
                onChange={handleChange("email")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={formState.phone}
                onChange={handleChange("phone")}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formState.username}
                onChange={handleChange("username")}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={formState.password}
                onChange={handleChange("password")}
                minLength={8}
                required
              />
            </div>
            <div className="md:col-span-2">
              <Button
                type="submit"
                className="w-full md:w-auto"
                disabled={loading}
              >
                {loading ? "Creating account…" : "Create account"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="justify-center text-sm text-muted-foreground">
          <span>Already have an account?</span>
          <Link
            href={templateUrl("/auth/login")}
            className="ml-1 font-medium text-primary hover:underline"
          >
            Sign in
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
