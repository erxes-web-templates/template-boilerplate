"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tag, X } from "lucide-react";
import { getMinTourPrice, templateUrl } from "../../../lib/utils";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { useQuery, useMutation } from "@apollo/client";
import authQueries from "../../../graphql/auth/queries";
import authMutations from "../../../graphql/auth/mutations";
import { toast } from "sonner";

type TourItem = {
  _id: string;
  startDate: string;
  name?: string;
  groupCode?: string;
  groupSize?: number;
  cost?: number;
};

type Props = {
  tour: {
    _id: string;
    cost?: number;
    groupCode?: string;
    pricingOptions?: Array<{ prices?: Array<{ price: number; type: string }> }>;
  };
  groupTourItems: TourItem[];
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

export default function TourBookingWidget({ tour, groupTourItems }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"booking" | "enquiry">("booking");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [travelers, setTravelers] = useState<number>(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<AuthTab>("login");

  // Login form
  const [loginForm, setLoginForm] = useState({ login: "", password: "" });
  // Register form
  const [registerForm, setRegisterForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });

  const selectedItem = groupTourItems.find((it) => it._id === selectedItemId);
  const maxTravelers = selectedItem?.groupSize || 20;
  const basePrice = getMinTourPrice(tour.pricingOptions);
  const groupCode = selectedItem?.groupCode || tour.groupCode || tour._id;

  // Refs to avoid stale closures in mutation callbacks
  const travelersRef = useRef(travelers);
  const selectedItemRef = useRef(selectedItem);
  useEffect(() => { travelersRef.current = travelers; }, [travelers]);
  useEffect(() => { selectedItemRef.current = selectedItem; }, [selectedItem]);

  const { data: userData, refetch: refetchUser } = useQuery(
    authQueries.currentUser,
    {
      fetchPolicy: "network-only",
    },
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
          const item = selectedItemRef.current;
          if (item) router.push(buildBookingUrl(item, travelersRef.current));
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
        setRegisterForm({
          firstName: "",
          lastName: "",
          email: "",
          phone: "",
          password: "",
        });
      },
    },
  );

  const buildBookingUrl = (item: TourItem, count: number = travelers) => {
    const base = templateUrl("/booking");
    const separator = base.includes("?") ? "&" : "?";
    return `${base}${separator}tourId=${groupCode}&startDate=${item.startDate}&travelers=${count}`;
  };

  const proceedToBooking = () => {
    if (!selectedItem) return;
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    router.push(buildBookingUrl(selectedItem));
  };

  const handleInquiry = () => {
    router.push(templateUrl(`/inquiry?tourId=${groupCode}`));
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

  return (
    <>
      <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm">
        {/* Price */}
        <p className="text-sm text-muted-foreground mb-1">Price</p>
        <div className="flex items-center gap-2 mb-4">
          <Tag className="w-5 h-5" style={{ color: "var(--primary)" }} />
          <span className="text-sm text-muted-foreground">From</span>
          <span
            className="text-3xl font-bold"
            style={{ color: "var(--primary)" }}
          >
            {basePrice != null ? `${Number(basePrice).toLocaleString()}₮` : "—"}
          </span>
        </div>

        <div className="border-t border-border/40 mb-5" />

        {/* Tabs */}
        <div className="flex rounded-xl bg-gray-100 p-1 mb-5">
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "booking"
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("booking")}
          >
            Booking
          </button>
          <button
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "enquiry"
                ? "bg-white shadow text-foreground"
                : "text-muted-foreground"
            }`}
            onClick={() => setActiveTab("enquiry")}
          >
            Enquiry
          </button>
        </div>

        {activeTab === "booking" ? (
          <div className="space-y-5">
            {/* Travel Dates */}
            <div>
              <p className="font-semibold text-sm mb-2">Choose Travel Dates</p>
              <select
                value={selectedItemId}
                onChange={(e) => {
                  setSelectedItemId(e.target.value);
                  setTravelers(1);
                }}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Select a departure</option>
                {groupTourItems.map((item) => (
                  <option key={item._id} value={item._id}>
                    {new Date(item.startDate).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                    {item.name ? ` — ${item.name}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Travelers */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-sm">Number of Travelers</p>
                {!selectedItemId && (
                  <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-1 rounded-full">
                    Pick a date
                  </span>
                )}
              </div>
              <select
                value={travelers}
                onChange={(e) => setTravelers(Number(e.target.value))}
                disabled={!selectedItemId}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!selectedItemId ? (
                  <option>Select travel date first</option>
                ) : (
                  Array.from({ length: maxTravelers }, (_, i) => i + 1).map(
                    (n) => (
                      <option key={n} value={n}>
                        {n} {n === 1 ? "Traveler" : "Travelers"}
                      </option>
                    ),
                  )
                )}
              </select>
              {!selectedItemId && (
                <p className="text-xs text-muted-foreground mt-1.5">
                  Please select a travel date to see available seats
                </p>
              )}
            </div>

            {/* Pay in full */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 rounded accent-primary"
              />
              <span className="text-sm font-medium">Pay in full</span>
            </label>

            {/* Proceed button */}
            <Button
              onClick={proceedToBooking}
              disabled={!selectedItemId}
              className="w-full py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400 text-white"
              style={
                selectedItemId
                  ? { backgroundColor: "var(--primary)" }
                  : undefined
              }
            >
              Proceed to Booking →
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Have questions? Our travel experts are here to help you plan the
              perfect trip.
            </p>
            <button
              onClick={handleInquiry}
              className="w-full py-3 rounded-xl font-semibold text-sm border-2 transition-all hover:opacity-80"
              style={{ borderColor: "var(--accent)", color: "var(--accent)" }}
            >
              Send an Enquiry →
            </button>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {authTab === "login"
                    ? "Sign in to continue"
                    : "Create an account"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {authTab === "login"
                    ? "Log in to proceed with your booking"
                    : "Register to book your tour"}
                </p>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>

            {/* Tab switcher */}
            <div className="flex mx-6 rounded-xl bg-gray-100 p-1 mb-5">
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  authTab === "login"
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground"
                }`}
                onClick={() => setAuthTab("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  authTab === "register"
                    ? "bg-white shadow text-foreground"
                    : "text-muted-foreground"
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
                      onChange={(e) =>
                        setLoginForm((p) => ({ ...p, login: e.target.value }))
                      }
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
                      onChange={(e) =>
                        setLoginForm((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
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
                        onChange={(e) =>
                          setRegisterForm((p) => ({
                            ...p,
                            firstName: e.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="modal-lastName">Last name</Label>
                      <Input
                        id="modal-lastName"
                        value={registerForm.lastName}
                        onChange={(e) =>
                          setRegisterForm((p) => ({
                            ...p,
                            lastName: e.target.value,
                          }))
                        }
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
                      onChange={(e) =>
                        setRegisterForm((p) => ({
                          ...p,
                          email: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-phone">Phone</Label>
                    <Input
                      id="modal-phone"
                      type="tel"
                      value={registerForm.phone}
                      onChange={(e) =>
                        setRegisterForm((p) => ({
                          ...p,
                          phone: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="modal-reg-password">Password</Label>
                    <Input
                      id="modal-reg-password"
                      type="password"
                      value={registerForm.password}
                      onChange={(e) =>
                        setRegisterForm((p) => ({
                          ...p,
                          password: e.target.value,
                        }))
                      }
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
