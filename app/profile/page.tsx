"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  useRouter,
  useParams,
  useSearchParams,
  usePathname,
} from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import authQueries from "../../graphql/auth/queries";
import authMutations from "../../graphql/auth/mutations";
import orderQueries from "../../graphql/order/queries";
import ecommerceQueries from "../../graphql/ecommerce/queries";
import { queries as tmsQueries } from "../../graphql/tms";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Label } from "../../components/ui/label";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useToast } from "../../hooks/use-toast";
import ProfileSidebar from "./_components/ProfileSidebar";
import ProfileOrdersTab from "./_components/ProfileOrdersTab";
import ProfileWishlistTab from "./_components/ProfileWishlistTab";
import ProfileViewedTab from "./_components/ProfileViewedTab";
import ProfileSecurityTab from "./_components/ProfileSecurityTab";
import { templateUrl } from "../../lib/utils";

type User = {
  _id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  erxesCustomerId?: string | null;
};

type ProfileOrder = {
  _id: string;
  createdAt?: string | null;
  modifiedAt?: string | null;
  paidDate?: string | null;
  number?: string | null;
  totalAmount?: number | null;
  finalAmount?: number | null;
  cashAmount?: number | null;
  mobileAmount?: number | null;
  status?: string | null;
  saleStatus?: string | null;
  type?: string | null;
  description?: string | null;
  deliveryInfo?: any;
  customer?: {
    firstName?: string | null;
    lastName?: string | null;
    primaryPhone?: string | null;
    primaryEmail?: string | null;
    primaryAddress?: string | null;
  } | null;
  items?: Array<{
    _id?: string | null;
    productName?: string | null;
    productImgUrl?: string | null;
    count?: number | null;
    unitPrice?: number | null;
    status?: string | null;
    description?: string | null;
  }>;
  source?: "pos" | "bms";
  numberOfPeople?: number | null;
  tourId?: string | null;
  parent?: string | null;
  additionalCustomers?: string[] | null;
};

const SIDEBAR_ITEMS = [
  { id: "profile", label: "Хувийн мэдээлэл" },
  { id: "orders", label: "Захиалгууд" },
  { id: "wishlist", label: "Хүслийн жагсаалт" },
  { id: "viewed", label: "Үзсэн" },
  { id: "security", label: "Нууц үг" },
  { id: "logout", label: "Гарах" },
] as const;

type SidebarKey = (typeof SIDEBAR_ITEMS)[number]["id"];

const resolveClientPortalId = (
  paramsValue?: string | string[],
  searchValue?: string | null,
) => {
  if (searchValue) {
    return searchValue;
  }
  if (Array.isArray(paramsValue)) {
    return paramsValue[0] ?? "";
  }
  return paramsValue ?? "";
};

export default function ProfilePage() {
  const router = useRouter();
  const params = useParams<{ id?: string }>();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentUrl = pathname ?? "/profile";
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<SidebarKey>(
    () => (searchParams?.get("tab") as SidebarKey) || "profile",
  );

  const { data, loading, error, refetch } = useQuery(authQueries.currentUser);
  const { data: userDetailData } = useQuery(authQueries.userDetail);
  const user: User | null = useMemo(
    () => data?.clientPortalCurrentUser ?? null,
    [data],
  );

  console.log(userDetailData, "udd");

  const clientPortalId = resolveClientPortalId(
    params?.id,
    searchParams?.get("clientPortalId"),
  );

  const {
    data: ordersData,
    loading: ordersLoading,
    refetch: refetchOrders,
  } = useQuery(orderQueries.fullOrders, {
    variables: {
      customerId: user?.erxesCustomerId ?? undefined,
      sortField: "createdAt",
      sortDirection: -1,
      statuses: [
        "new",
        "doing",
        "done",
        "complete",
        "reDoing",
        "pending",
        "return",
      ],
    },
    skip: !user?.erxesCustomerId,
    fetchPolicy: "cache-and-network",
  });

  const { data: bmsOrdersData, loading: bmsOrdersLoading } = useQuery(
    tmsQueries.BMS_ORDERS_QUERY,
    {
      variables: {
        customerId: user?.erxesCustomerId ?? undefined,
        limit: 50,
      },
      skip: !user?.erxesCustomerId,
      fetchPolicy: "cache-and-network",
    },
  );

  console.log(userDetailData, "udd");
  const {
    data: wishlistData,
    loading: wishlistLoading,
    refetch: refetchWishlist,
  } = useQuery(ecommerceQueries.wishlist, {
    variables: {
      customerId: user?.erxesCustomerId ?? undefined,
      page: 1,
      perPage: 50,
    },
    skip: !user?.erxesCustomerId,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: viewedData,
    loading: viewedLoading,
    refetch: refetchViewed,
  } = useQuery(orderQueries.getLastProductView, {
    variables: {
      customerId: user?.erxesCustomerId ?? "",
      limit: 16,
    },
    skip: !user?.erxesCustomerId,
    fetchPolicy: "cache-and-network",
  });

  const [formState, setFormState] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    if (user) {
      setFormState({
        firstName: user.firstName ?? "",
        lastName: user.lastName ?? "",
        email: user.email ?? "",
        phone: user.phone ?? "",
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      router.push(
        templateUrl("/auth/login") +
          "?redirect=" +
          encodeURIComponent(currentUrl),
      );
    }
  }, [error]);

  const [passwordForm, setPasswordForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });

  const orders = useMemo<ProfileOrder[]>(() => {
    const fullOrders: ProfileOrder[] = (ordersData?.cpFullOrders ?? []).map(
      (order: any) => ({
        ...order,
        source: "pos",
      }),
    );

    const bmsOrders: ProfileOrder[] = (
      bmsOrdersData?.cpBmsOrders?.list ?? []
    ).map((order: any) => ({
      _id: order._id,
      createdAt: null,
      modifiedAt: null,
      paidDate: null,
      number: null,
      totalAmount: order.amount ?? 0,
      finalAmount: order.amount ?? 0,
      cashAmount: null,
      mobileAmount: null,
      status: order.status ?? null,
      saleStatus: null,
      type: order.type ?? "tour",
      description: order.note ?? null,
      deliveryInfo: null,
      customer: null,
      items: [],
      source: "bms",
      numberOfPeople: order.numberOfPeople ?? null,
      tourId: order.tourId ?? null,
      parent: order.parent ?? null,
      additionalCustomers: order.additionalCustomers ?? [],
    }));

    return [...fullOrders, ...bmsOrders];
  }, [bmsOrdersData, ordersData]);
  const wishlistItems = useMemo(
    () => wishlistData?.cpWishlist ?? [],
    [wishlistData],
  );
  const viewedItems = useMemo(
    () => viewedData?.cpLastViewedItems ?? [],
    [viewedData],
  );

  const [updateUser, { loading: updating }] = useMutation(
    authMutations.userEdit,
    {
      onError(err) {
        toast({
          title: "Шинэчилж чадсангүй",
          description: err.message,
          variant: "destructive",
        });
      },
      onCompleted() {
        toast({
          title: "Амжилттай хадгаллаа",
          description: "Таны мэдээллийг шинэчиллээ.",
        });
        refetch();
      },
    },
  );

  const [logoutMutation, { loading: loggingOut }] = useMutation(
    authMutations.logout,
    {
      onCompleted() {
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("refreshToken");
        toast({
          title: "Амжилттай гарлаа",
          description: "Та дахин нэвтрэх боломжтой.",
        });
        window.location.href = "/auth/login";
      },
    },
  );

  const [changePasswordMutation, { loading: changingPassword }] = useMutation(
    authMutations.userChangePassword,
    {
      onError(err) {
        toast({
          title: "Нууц үг солиход алдаа гарлаа",
          description: err.message,
          variant: "destructive",
        });
      },
      onCompleted() {
        toast({
          title: "Нууц үг шинэчлэгдлээ",
          description: "Шинэ нууц үг үйлчилж эхэллээ.",
        });
        setPasswordForm({
          newPassword: "",
          confirmPassword: "",
        });
      },
    },
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user?._id) {
      toast({
        title: "Алдаа гарлаа",
        description: "Хэрэглэгчийн мэдээллийг олсонгүй.",
        variant: "destructive",
      });
      return;
    }

    await updateUser({
      variables: {
        _id: user._id,
        firstName: formState.firstName,
        lastName: formState.lastName,
        email: formState.email,
        phone: formState.phone,
      },
    });
  };

  const handlePasswordFormChange = (
    field: keyof typeof passwordForm,
    value: string,
  ) => {
    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Нууц үг таарахгүй байна",
        description: "Шинэ нууц үг болон баталгаажуулалт ижил байх ёстой.",
        variant: "destructive",
      });
      return;
    }

    await changePasswordMutation({
      variables: {
        _id: user?._id,
        newPassword: passwordForm.newPassword,
      },
    });
  };

  const handleSidebarClick = (id: string) => {
    if (id === "logout") {
      logoutMutation();
      return;
    }
    if (id === "orders") {
      refetchOrders();
    }
    if (id === "wishlist") {
      refetchWishlist();
    }
    if (id === "viewed") {
      refetchViewed();
    }
    setActiveTab(id as SidebarKey);
  };

  const renderSummary = () => (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Хувийн мэдээлэл
        </p>
        <p className="mt-2 text-base font-semibold">{`${
          formState.firstName || "–"
        } ${formState.lastName || ""}`}</p>
      </div>
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Гар утас
        </p>
        <p className="mt-2 text-base font-semibold">{formState.phone || "—"}</p>
      </div>
      <div className="rounded-lg border bg-muted/40 p-4">
        <p className="text-xs font-medium uppercase text-muted-foreground">
          Цахим хаяг
        </p>
        <p className="mt-2 text-base font-semibold">{formState.email || "—"}</p>
        {userDetailData?.clientPortalCurrentUser?.isEmailVerified && (
          <Badge
            variant="outline"
            className="mt-2 border-green-500 text-green-600"
          >
            Баталгаажсан
          </Badge>
        )}
      </div>
    </div>
  );

  const renderProfileForm = () => (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="firstName">Нэр</Label>
          <Input
            id="firstName"
            value={formState.firstName}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                firstName: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Овог</Label>
          <Input
            id="lastName"
            value={formState.lastName}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                lastName: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Цахим шуудан</Label>
          <Input
            id="email"
            type="email"
            value={formState.email}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                email: event.target.value,
              }))
            }
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Гар утас</Label>
          <Input
            id="phone"
            type="tel"
            value={formState.phone}
            onChange={(event) =>
              setFormState((prev) => ({
                ...prev,
                phone: event.target.value,
              }))
            }
          />
        </div>
      </div>
      <Button type="submit" disabled={updating} className="w-full md:w-auto">
        {updating ? "Хадгалж байна…" : "Өөрчлөлт хадгалах"}
      </Button>
    </form>
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10 px-6 py-12">
        <Card className="w-full max-w-md animate-pulse">
          <CardHeader>
            <div className="h-6 w-1/3 rounded bg-muted/60" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-10 w-full rounded bg-muted/50" />
            <div className="h-10 w-full rounded bg-muted/50" />
            <div className="h-10 w-full rounded bg-muted/50" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/10 px-6 py-12">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="text-xl font-semibold">
              Та нэвтрээгүй байна
            </CardTitle>
            <CardDescription>Профайл харахын тулд нэвтэрнэ үү.</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center gap-3">
            <Button asChild variant="default">
              <Link
                href={
                  templateUrl("/auth/login") +
                  "?redirect=" +
                  encodeURIComponent(currentUrl)
                }
              >
                Нэвтрэх
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={templateUrl("/auth/register")}>Бүртгүүлэх</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const cardTitleMap: Record<SidebarKey, string> = {
    profile: "Хувийн мэдээлэл",
    orders: "Захиалгын түүх",
    wishlist: "Хүслийн жагсаалт",
    viewed: "Үзсэн бүтээгдэхүүнүүд",
    security: "Нууц үг солих",
    logout: "",
  };

  const cardDescriptionMap: Record<SidebarKey, string> = {
    profile: "Цахим худалдаанд ашиглах хувийн мэдээллээ шинэчлэх боломжтой.",
    orders: "Та хийсэн худалдан авалтын захиалгуудыг эндээс харах боломжтой.",
    wishlist:
      "Та сонирхож буй бараануудаа энд хадгалж, дараа нь худалдан авах боломжтой.",
    viewed: "Сүүлийн үед үзсэн бараанууд энд хадгалагдана.",
    security: "Нууц үгээ шинэчилж, аюулгүй байдлаа хангаарай.",
    logout: "",
  };

  const cardTitle = cardTitleMap[activeTab] || "Хувийн мэдээлэл";
  const cardDescription =
    cardDescriptionMap[activeTab] ||
    "Цахим худалдаанд ашиглах хувийн мэдээллээ шинэчлэх боломжтой.";

  return (
    <div className="min-h-screen bg-muted/10 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto w-full space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Хувийн мэдээлэл</h1>
          <p className="text-sm text-muted-foreground">Мэдээлэл засах</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          <ProfileSidebar
            items={SIDEBAR_ITEMS}
            activeId={activeTab}
            onSelect={handleSidebarClick}
          />
          <section className="space-y-6">
            {renderSummary()}
            <Card className="border bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {cardTitle}
                </CardTitle>
                {cardDescription && (
                  <CardDescription>{cardDescription}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {activeTab === "profile" && renderProfileForm()}
                {activeTab === "orders" && (
                  <ProfileOrdersTab
                    orders={orders}
                    loading={ordersLoading || bmsOrdersLoading}
                  />
                )}
                {activeTab === "wishlist" && (
                  <ProfileWishlistTab
                    items={wishlistItems}
                    loading={wishlistLoading}
                    onRemoved={refetchWishlist}
                  />
                )}
                {activeTab === "viewed" && (
                  <ProfileViewedTab
                    items={viewedItems}
                    loading={viewedLoading}
                  />
                )}
                {activeTab === "security" && (
                  <ProfileSecurityTab
                    form={passwordForm}
                    loading={changingPassword}
                    onChange={handlePasswordFormChange}
                    onSubmit={handlePasswordSubmit}
                  />
                )}
                {[
                  "profile",
                  "orders",
                  "wishlist",
                  "viewed",
                  "security",
                ].indexOf(activeTab) === -1 && (
                  <p className="text-sm text-muted-foreground">
                    Энэ хэсгийг удахгүй идэвхжүүлнэ.
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}
