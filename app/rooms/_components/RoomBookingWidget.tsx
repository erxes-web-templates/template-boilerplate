"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { templateUrl } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useQuery, useMutation } from "@apollo/client";
import authQueries from "../../../graphql/auth/queries";
import authMutations from "../../../graphql/auth/mutations";
import { toast } from "sonner";
import type { RoomSummary } from "../../../graphql/pms/rooms";

type Props = {
  room: RoomSummary;
};

type AuthTab = "login" | "register";

const storeTokens = (response: any) => {
  if (!response) return;
  if (typeof response === "string") {
    sessionStorage.setItem("token", response);
    return;
  }
  if (response.token) sessionStorage.setItem("token", response.token);
  if (response.refreshToken)
    sessionStorage.setItem("refreshToken", response.refreshToken);
};

export default function RoomBookingWidget({ room }: Props) {
  const router = useRouter();
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");

  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const { data: userData, refetch: refetchUser } = useQuery(
    authQueries.currentUser,
    { fetchPolicy: "network-only" },
  );
  const currentUser = userData?.clientPortalCurrentUser || null;

  const [loginMutation, { loading: loginLoading }] = useMutation(
    authMutations.login,
    {
      onError(error) {
        toast.error("Login failed", { description: error.message });
      },
      onCompleted(data) {
        storeTokens(data?.clientPortalUserLoginWithCredentials);
        toast.success("Logged in successfully");
        setShowAuthModal(false);
        refetchUser().then(() => {
          router.push(buildBookingUrl());
        });
      },
    },
  );

  const [registerMutation, { loading: registerLoading }] = useMutation(
    authMutations.createUser,
    {
      onError(error) {
        toast.error("Registration failed", { description: error.message });
      },
      onCompleted() {
        toast.success("Account created! Please log in.");
        setAuthTab("login");
        setRegisterForm({ firstName: "", lastName: "", email: "", phone: "", password: "" });
      },
    },
  );

  const buildBookingUrl = () => {
    const base = templateUrl("/booking");
    const sep = base.includes("?") ? "&" : "?";
    return `${base}${sep}roomId=${room._id}&checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`;
  };

  const proceedToBooking = () => {
    if (!checkIn || !checkOut) return;
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    router.push(buildBookingUrl());
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEmail = loginForm.login.includes("@");
    await loginMutation({
      variables: {
        email: isEmail ? loginForm.login : undefined,
        phone: !isEmail ? loginForm.login : undefined,
        password: loginForm.password,
      },
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    await registerMutation({
      variables: {
        clientPortalId: process.env.ERXES_CP_ID,
        firstName: registerForm.firstName,
        lastName: registerForm.lastName,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
      },
    });
  };

  const isReady = checkIn && checkOut && checkIn < checkOut;

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
        <p className="text-sm text-muted-foreground mb-1">Price per night</p>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <span className="text-sm text-muted-foreground">From</span>
          <span className="text-3xl font-bold" style={{ color: "var(--primary)" }}>
            ₮{Number(room.unitPrice ?? 0).toLocaleString()}
          </span>
        </div>

        <div className="border-t border-border/40 mb-5" />

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="check-in">Check-in</Label>
              <Input
                id="check-in"
                type="date"
                value={checkIn}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckIn(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="check-out">Check-out</Label>
              <Input
                id="check-out"
                type="date"
                value={checkOut}
                min={checkIn || new Date().toISOString().split("T")[0]}
                onChange={(e) => setCheckOut(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="guests">Guests</Label>
            <select
              id="guests"
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "Guest" : "Guests"}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={proceedToBooking}
            disabled={!isReady}
            className="w-full py-3 rounded-xl font-semibold text-sm text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={isReady ? { backgroundColor: "var(--primary)" } : undefined}
          >
            Book now →
          </Button>
        </div>
      </div>

      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {authTab === "login" ? "Sign in to continue" : "Create an account"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {authTab === "login"
                    ? "Log in to proceed with your booking"
                    : "Register to book your room"}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            <div className="flex mx-6 rounded-xl bg-gray-100 p-1 mb-5">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  authTab === "login" ? "bg-white shadow text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setAuthTab("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  authTab === "register" ? "bg-white shadow text-foreground" : "text-muted-foreground"
                }`}
                onClick={() => setAuthTab("register")}
              >
                Register
              </button>
            </div>

            <div className="px-6 pb-6">
              {authTab === "login" ? (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-login">Email or phone</Label>
                    <Input
                      id="modal-login"
                      value={loginForm.login}
                      onChange={(e) => setLoginForm((p) => ({ ...p, login: e.target.value }))}
                      placeholder="you@example.com"
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-password">Password</Label>
                    <Input
                      id="modal-password"
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full text-white"
                    disabled={loginLoading}
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {loginLoading ? "Signing in…" : "Sign in & Continue"}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-firstName">First name</Label>
                      <Input
                        id="modal-firstName"
                        value={registerForm.firstName}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-lastName">Last name</Label>
                      <Input
                        id="modal-lastName"
                        value={registerForm.lastName}
                        onChange={(e) => setRegisterForm((p) => ({ ...p, lastName: e.target.value }))}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-email">Email</Label>
                    <Input
                      id="modal-email"
                      type="email"
                      value={registerForm.email}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-phone">Phone</Label>
                    <Input
                      id="modal-phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-reg-password">Password</Label>
                    <Input
                      id="modal-reg-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => setRegisterForm((p) => ({ ...p, password: e.target.value }))}
                      minLength={8}
                      required
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={registerLoading}
                    style={{ backgroundColor: "var(--primary)" }}
                  >
                    {registerLoading ? "Creating account…" : "Create account"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
