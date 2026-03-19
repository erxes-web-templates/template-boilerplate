"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { useToast } from "../../hooks/use-toast";
import { useCart } from "../../lib/CartContext";
import orderQueries from "../../graphql/order/queries";
import orderMutations from "../../graphql/order/mutations";
import authQueries from "../../graphql/auth/queries";
import { Minus, Plus, Trash2 } from "lucide-react";
import { templateUrl } from "../../lib/utils";
import useClientPortal from "../../hooks/useClientPortal";

const STEP_TITLES = ["Review Cart", "Delivery Details", "Confirm & Pay"];

const formatCurrency = (value: number) =>
  `₮${Math.round(value).toLocaleString()}`;

const DEFAULT_CONTACT_STATE = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  city: "",
  district: "",
  street: "",
  detail: "",
  notes: "",
  invoiceType: "individual" as "individual" | "company",
  registerNumber: "",
  companyName: "",
  haveBaby: false,
  callBefore: false,
  onlyAfternoon: false,
};

type ContactState = typeof DEFAULT_CONTACT_STATE;
type InvoiceType = ContactState["invoiceType"];
type ExtraOptionKey = "haveBaby" | "callBefore" | "onlyAfternoon";

const EXTRA_OPTIONS: { key: ExtraOptionKey; label: string }[] = [
  { key: "haveBaby", label: "Нялах хүүхэдтэй" },
  { key: "callBefore", label: "Хүргэхийн өмнө заавал залгах" },
  { key: "onlyAfternoon", label: "Зөвхөн оройн цагаар хүргэх" },
];

type StepIndicatorProps = {
  currentStep: number;
};

const StepIndicator = ({ currentStep }: StepIndicatorProps) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-card px-4 py-3">
    {STEP_TITLES.map((title, index) => {
      const stepNumber = index + 1;
      const isActive = stepNumber === currentStep;
      const isCompleted = stepNumber < currentStep;
      return (
        <div
          key={title}
          className="flex flex-1 items-center gap-3 text-sm sm:text-base"
        >
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : isCompleted
                ? "border-primary/50 bg-primary/10 text-primary"
                : "border-border text-muted-foreground"
            }`}
          >
            {stepNumber}
          </div>
          <span
            className={`hidden flex-1 text-sm font-medium md:block ${
              isActive ? "text-foreground" : "text-muted-foreground"
            }`}
          >
            {title}
          </span>
        </div>
      );
    })}
  </div>
);

const CheckoutPage = () => {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const stepParam = searchParams.get("step");
  const currentUrl =
    pathname +
    (searchParams?.toString() ? `?${searchParams.toString()}` : "");
  const currentStep = Math.min(
    3,
    Math.max(1, Number.isNaN(Number(stepParam)) ? 1 : Number(stepParam))
  );

  const { toast } = useToast();
  const {
    items: cartItems,
    totalPrice,
    totalItems,
    orderId,
    isSyncing,
    refetchCart,
    updateQuantity,
    removeFromCart,
  } = useCart();

  const { data: userData } = useQuery(authQueries.currentUser, {
    fetchPolicy: "cache-first",
  });

  const clientPortalId = Array.isArray(params.id)
    ? params.id[0]
    : params.id ?? "";

  const { cpDetail } = useClientPortal({ id: clientPortalId });
  const erxesCustomerId =
    userData?.clientPortalCurrentUser?.erxesCustomerId ?? undefined;

  useEffect(() => {
    if (currentStep === 2 && !erxesCustomerId) {
      router.push(templateUrl("/login"));
    }
  }, [currentStep, erxesCustomerId, router]);

  const { data: configData } = useQuery(authQueries.currentConfig, {
    fetchPolicy: "cache-first",
    skip: !erxesCustomerId,
  });
  const branchId = configData?.currentConfig?.branchId ?? undefined;

  const {
    data: orderData,
    loading: orderLoading,
    refetch: refetchOrder,
  } = useQuery(orderQueries.currentOrder, {
    variables: {
      customerId: erxesCustomerId,
      saleStatus: "cart",
      perPage: 1,
      sortField: "createdAt",
      sortDirection: -1,
      statuses: [],
    },
    skip: !erxesCustomerId,
    fetchPolicy: "cache-and-network",
  });

  const activeOrder = orderData?.fullOrders?.[0] ?? null;
  const deliveryInfoRaw = activeOrder?.deliveryInfo ?? null;
  const parsedDeliveryInfo = useMemo(() => {
    if (!deliveryInfoRaw) {
      return null;
    }

    if (typeof deliveryInfoRaw === "string") {
      try {
        return JSON.parse(deliveryInfoRaw);
      } catch {
        return null;
      }
    }

    return deliveryInfoRaw;
  }, [deliveryInfoRaw]);

  const [contactState, setContactState] = useState<ContactState>(
    DEFAULT_CONTACT_STATE
  );
  const [savingContact, setSavingContact] = useState(false);

  useEffect(() => {
    const profile = userData?.clientPortalCurrentUser;
    if (!profile) {
      return;
    }

    setContactState((prev) => ({
      ...prev,
      firstName: prev.firstName || profile.firstName || "",
      lastName: prev.lastName || profile.lastName || "",
      phone: prev.phone || profile.phone || "",
      email: prev.email || profile.email || "",
    }));
  }, [userData]);

  useEffect(() => {
    if (!parsedDeliveryInfo && !activeOrder?.description) {
      return;
    }

    setContactState((prev) => ({
      ...prev,
      ...Object.fromEntries(
        Object.entries(parsedDeliveryInfo ?? {}).filter(([key]) =>
          Object.prototype.hasOwnProperty.call(prev, key)
        )
      ),
      notes:
        typeof activeOrder?.description === "string"
          ? activeOrder.description
          : prev.notes,
    }));
  }, [activeOrder?.description, parsedDeliveryInfo]);

  const [editOrder] = useMutation(orderMutations.ordersEdit);

  const updateStep = useCallback(
    (nextStep: number) => {
      const normalized = Math.min(3, Math.max(1, nextStep));
      const params = new URLSearchParams();
      searchParams.forEach((value, key) => {
        if (key !== "step") {
          params.append(key, value);
        }
      });
      params.set("step", String(normalized));
      router.replace(`?${params.toString()}`, { scroll: true });
    },
    [router, searchParams]
  );

  const handleFieldChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = event.target;
      setContactState((prev) => ({
        ...prev,
        [name]: value,
      }));
    },
    []
  );

  const handleInvoiceChange = useCallback((value: InvoiceType) => {
    setContactState((prev) => ({
      ...prev,
      invoiceType: value,
    }));
  }, []);

  const handleExtraChange = useCallback(
    (key: ExtraOptionKey) => (checked: boolean | "indeterminate") => {
      setContactState((prev) => ({
        ...prev,
        [key]: checked === true,
      }));
    },
    []
  );

  const invoiceInfoValid =
    contactState.invoiceType === "individual" ||
    (contactState.registerNumber.trim().length > 0 &&
      contactState.companyName.trim().length > 0);

  const handleDeliverySubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!erxesCustomerId) {
        toast({
          title: "Нэвтрэх шаардлагатай",
          description: "Хүргэлтийн мэдээлэл илгээхийн тулд эхлээд нэвтэрнэ үү.",
          variant: "destructive",
        });
        return;
      }

      if (!orderId) {
        toast({
          title: "Захиалга үүсээгүй байна",
          description:
            "Сагсанд бараа нэмсэний дараа төлбөрийн хэсэгт үргэлжлүүлнэ үү.",
          variant: "destructive",
        });
        updateStep(1);
        return;
      }

      const payloadItems = cartItems.map((item) => ({
        ...(item.orderItemId ? { _id: item.orderItemId } : {}),
        productId: item.id,
        count: item.quantity,
        unitPrice: item.unitPrice,
      }));

      const totalAmount = cartItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
      );

      setSavingContact(true);
      try {
        await editOrder({
          variables: {
            _id: orderId,
            items: payloadItems,
            totalAmount,
            type: "delivery",
            customerId: erxesCustomerId,
            origin: "kiosk",
            saleStatus: "cart",
            branchId,
            deliveryInfo: {
              firstName: contactState.firstName,
              lastName: contactState.lastName,
              email: contactState.email,
              phone: contactState.phone,
              city: contactState.city,
              district: contactState.district,
              street: contactState.street,
              detail: contactState.detail,
              invoiceType: contactState.invoiceType,
              registerNumber: contactState.registerNumber,
              companyName: contactState.companyName,
              haveBaby: contactState.haveBaby,
              callBefore: contactState.callBefore,
              onlyAfternoon: contactState.onlyAfternoon,
            },
            description: contactState.notes,
          },
        });

        await Promise.all([refetchOrder(), refetchCart()]);

        toast({
          title: "Хүргэлтийн мэдээлэл хадгалагдлаа",
        });
        updateStep(3);
      } catch (error: any) {
        toast({
          title: "Хадгалах боломжгүй байна",
          description: error?.message ?? "Дахин оролдоно уу.",
          variant: "destructive",
        });
      } finally {
        setSavingContact(false);
      }
    },
    [
      branchId,
      cartItems,
      contactState,
      editOrder,
      erxesCustomerId,
      orderId,
      refetchCart,
      refetchOrder,
      toast,
      updateStep,
    ]
  );

  console.log(cpDetail, "cppppp");

  const canProceedToInformation = totalItems > 0 && !isSyncing;
  const canSubmitDelivery =
    // !!orderId &&
    !savingContact &&
    !isSyncing &&
    invoiceInfoValid &&
    Boolean(
      contactState.firstName &&
        contactState.phone &&
        contactState.city &&
        contactState.street
    );

  const selectedExtras = useMemo(
    () =>
      EXTRA_OPTIONS.filter((option) => contactState[option.key]).map(
        (option) => option.label
      ),
    [contactState]
  );

  const invoiceTypeLabel =
    contactState.invoiceType === "company" ? "Байгууллага" : "Хувь хүн";

  const renderCartStep = () => (
    <Card>
      <CardHeader>
        <CardTitle>Сагсны бараанууд</CardTitle>
        <CardDescription>
          Захиалгаа баталгаажуулахын өмнө бараануудаа шалгана уу.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {totalItems === 0 && (
          <div className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Таны сагс хоосон байна.{" "}
            <Link href="/products" className="text-primary underline">
              Бараа хайх
            </Link>
          </div>
        )}
        {cartItems.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-4 rounded-md border border-border p-4"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                  No image
                </div>
              )}
            </div>
            <div className="flex flex-1 flex-col gap-3">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </p>
                  {item.categoryName && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Ангилал: {item.categoryName}
                    </p>
                  )}
                </div>
                <p className="text-sm font-semibold">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </p>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      void updateQuantity(item.id, item.quantity - 1);
                    }}
                    disabled={item.quantity <= 1 || isSyncing}
                    aria-label="Quantity decrease"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="min-w-[2.5rem] text-center text-sm font-medium">
                    {item.quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => {
                      void updateQuantity(item.id, item.quantity + 1);
                    }}
                    disabled={isSyncing}
                    aria-label="Quantity increase"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/products/${item.id}`}>Дэлгэрэнгүй</Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => {
                      void removeFromCart(item.id);
                    }}
                    disabled={isSyncing}
                    aria-label="Remove from cart"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter className="flex flex-col items-end gap-3 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3 text-sm">
          <Badge variant="secondary">{totalItems} бараа</Badge>
          <span className="font-semibold text-foreground">
            Нийт: {formatCurrency(totalPrice)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => updateStep(1)}
            disabled={currentStep === 1}
          >
            Шалгах
          </Button>
          <Button
            onClick={() => updateStep(2)}
            disabled={!canProceedToInformation}
          >
            Үргэлжлүүлэх
          </Button>
        </div>
      </CardFooter>
    </Card>
  );

  const renderInformationStep = () => (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Хүргэлтийн мэдээлэл</CardTitle>
          <CardDescription>
            Хүргүүлэх хаяг, холбоо барих мэдээллээ оруулна уу.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!erxesCustomerId && (
            <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              Хүргэлтийн мэдээлэл оруулахын тулд{" "}
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(currentUrl)}`}
                className="underline"
              >
                эхлээд нэвтэрнэ үү
              </Link>
              .
            </div>
          )}
          <form className="space-y-8" onSubmit={handleDeliverySubmit}>
            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Захиалагчийн мэдээлэл
                </h3>
                <p className="text-sm text-muted-foreground">
                  Нэр болон холбоо барих мэдээллээ зөв оруулна уу.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Нэр*</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={contactState.firstName}
                    onChange={handleFieldChange}
                    required
                    placeholder="Нэр"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Овог</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={contactState.lastName}
                    onChange={handleFieldChange}
                    placeholder="Овог"
                  />
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="phone">Утас*</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={contactState.phone}
                    onChange={handleFieldChange}
                    required
                    placeholder="Утасны дугаар"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">И-мэйл</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={contactState.email}
                    onChange={handleFieldChange}
                    placeholder="И-мэйл хаяг"
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  И-Баримт авах
                </h3>
                <p className="text-sm text-muted-foreground">
                  Хувь хүн эсвэл байгууллагаар и-баримт авахыг сонгоно уу.
                </p>
              </div>
              <RadioGroup
                className="grid gap-3 sm:grid-cols-2"
                value={contactState.invoiceType}
                onValueChange={(value) =>
                  handleInvoiceChange(value as InvoiceType)
                }
              >
                {[
                  { value: "individual", label: "Хувь хүн" },
                  { value: "company", label: "Байгууллага" },
                ].map((option) => {
                  const checked = contactState.invoiceType === option.value;
                  return (
                    <label
                      key={option.value}
                      htmlFor={`invoice-${option.value}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition ${
                        checked
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <RadioGroupItem
                        id={`invoice-${option.value}`}
                        value={option.value}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </RadioGroup>

              {contactState.invoiceType === "company" && (
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <Label htmlFor="companyName">Байгууллагын нэр*</Label>
                    <Input
                      id="companyName"
                      name="companyName"
                      value={contactState.companyName}
                      onChange={handleFieldChange}
                      placeholder="Байгууллагын нэр"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="registerNumber">Регистрийн дугаар*</Label>
                    <Input
                      id="registerNumber"
                      name="registerNumber"
                      value={contactState.registerNumber}
                      onChange={handleFieldChange}
                      placeholder="Регистр"
                      required
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Хүргэлтийн хаяг
                </h3>
                <p className="text-sm text-muted-foreground">
                  Хаягаа дэлгэрэнгүй оруулснаар хүргэлт алдаагүй очих болно.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="city">Хот/Аймаг*</Label>
                  <Input
                    id="city"
                    name="city"
                    value={contactState.city}
                    onChange={handleFieldChange}
                    required
                    placeholder="Хот/Аймаг"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="district">Дүүрэг/Сум</Label>
                  <Input
                    id="district"
                    name="district"
                    value={contactState.district}
                    onChange={handleFieldChange}
                    placeholder="Дүүрэг/Сум"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-1">
                  <Label htmlFor="detail">Хороо/Баг</Label>
                  <Input
                    id="detail"
                    name="detail"
                    value={contactState.detail}
                    onChange={handleFieldChange}
                    placeholder="Хороо/Баг"
                  />
                </div>
                <div className="grid gap-2 sm:col-span-3">
                  <Label htmlFor="street">Дэлгэрэнгүй хаяг*</Label>
                  <Textarea
                    id="street"
                    name="street"
                    value={contactState.street}
                    onChange={handleFieldChange}
                    required
                    rows={3}
                    placeholder="Гудамж, байр, орц, тоот зэрэг дэлгэрэнгүй мэдээллийг оруулна уу."
                  />
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">
                  Нэмэлт анхааруулга
                </h3>
                <p className="text-sm text-muted-foreground">
                  Хүргэлтийн онцгой нөхцөл байдал байвал сонгоно уу.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {EXTRA_OPTIONS.map((option) => {
                  const checked = contactState[option.key];
                  return (
                    <label
                      key={option.key}
                      htmlFor={`extra-${option.key}`}
                      className={`flex cursor-pointer items-center gap-2 rounded-md border p-3 text-sm transition ${
                        checked
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <Checkbox
                        id={`extra-${option.key}`}
                        checked={checked}
                        onCheckedChange={handleExtraChange(option.key)}
                      />
                      <span>{option.label}</span>
                    </label>
                  );
                })}
              </div>
              <div className="grid gap-2">
                <Label htmlFor="notes">Нэмэлт тэмдэглэл</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={contactState.notes}
                  onChange={handleFieldChange}
                  rows={4}
                  placeholder="Хүргэлтийн хуваарь, үүдний код зэрэг мэдээллийг бичнэ үү."
                />
              </div>
            </section>

            <div className="flex flex-col-reverse items-center justify-between gap-3 pt-4 sm:flex-row">
              <Button
                type="button"
                variant="ghost"
                onClick={() => updateStep(1)}
              >
                Буцах
              </Button>
              <Button type="submit" disabled={!canSubmitDelivery}>
                Хадгалаад үргэлжлүүлэх
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card className="overflow-hidden">
          {cpDetail?.headerHtml ? (
            <div
              className="p-4 text-sm leading-relaxed [&_ul]:list-disc [&_ul]:list-inside [&_ul]:pl-5 [&_li]:mb-1 [&_li>p]:m-0 [&_li>p]:inline [&_p]:mb-2 [&_p:last-child]:mb-0"
              dangerouslySetInnerHTML={{ __html: cpDetail.headerHtml }}
            ></div>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Захиалгын товчоо</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {cartItems.map((item) => (
              <div
                key={`summary-${item.id}`}
                className="flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt={item.name}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                        No image
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex items-center justify-between text-sm font-semibold">
            <span>Нийт</span>
            <span>{formatCurrency(totalPrice)}</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );

  const renderReviewStep = () => (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Холбоо барих мэдээлэл</CardTitle>
          <CardDescription>
            Захиалгын төлбөр төлөхөөс өмнө мэдээллээ дахин шалгана уу.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-md border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">
              Хүргэлтийн хаяг
            </h3>
            <div className="mt-3 grid gap-2 text-muted-foreground">
              <p>
                {contactState.firstName} {contactState.lastName}
              </p>
              <p>{contactState.phone}</p>
              {contactState.email && <p>{contactState.email}</p>}
              <p>
                {contactState.city}
                {contactState.district ? `, ${contactState.district}` : ""}
              </p>
              <p>{contactState.street}</p>
              {contactState.detail && <p>{contactState.detail}</p>}
            </div>
          </div>

          <div className="rounded-md border border-border p-4">
            <h3 className="text-sm font-semibold text-foreground">
              И-Баримт авах
            </h3>
            <div className="mt-3 grid gap-1 text-muted-foreground">
              <p>{invoiceTypeLabel}</p>
              {contactState.invoiceType === "company" && (
                <>
                  {contactState.companyName && (
                    <p>Байгууллагын нэр: {contactState.companyName}</p>
                  )}
                  {contactState.registerNumber && (
                    <p>Регистрийн дугаар: {contactState.registerNumber}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {selectedExtras.length > 0 && (
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Нэмэлт анхааруулга
              </h3>
              <ul className="mt-3 grid gap-1 text-muted-foreground">
                {selectedExtras.map((label) => (
                  <li key={label}>• {label}</li>
                ))}
              </ul>
            </div>
          )}

          {contactState.notes && (
            <div className="rounded-md border border-border p-4">
              <h3 className="text-sm font-semibold text-foreground">
                Нэмэлт тэмдэглэл
              </h3>
              <p className="mt-3 text-muted-foreground">{contactState.notes}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col items-center justify-between gap-3 sm:flex-row">
          <Button variant="ghost" onClick={() => updateStep(2)}>
            Буцах
          </Button>
          <Button asChild disabled={!orderId || orderLoading}>
            <Link href={templateUrl("/payment")}>Төлбөр төлөх алхам руу</Link>
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Захиалгын дэлгэрэнгүй</CardTitle>
          <CardDescription>
            Бараанууд болон үнийн мэдээллийг дахин шалгаарай.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {cartItems.map((item) => (
            <div
              key={`review-${item.id}`}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-md bg-muted">
                  {item.imageUrl ? (
                    <Image
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
                      No image
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    × {item.quantity}
                  </p>
                </div>
              </div>
              <span className="font-medium text-foreground">
                {formatCurrency(item.unitPrice * item.quantity)}
              </span>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm font-semibold">
            <span>Нийт</span>
            <span>{formatCurrency(totalPrice)}</span>
          </div>
          {activeOrder?._id && (
            <p className="text-xs text-muted-foreground">
              Захиалгын код:{" "}
              <span className="font-medium">{activeOrder.number}</span>
            </p>
          )}
        </CardFooter>
      </Card>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
          Захиалгын төлбөр
        </h1>
        <p className="text-sm text-muted-foreground">
          Захиалгын мэдээллээ баталгаажуулж, төлбөр төлөх алхамд шилжинэ үү.
        </p>
      </header>

      <StepIndicator currentStep={currentStep} />

      {currentStep === 1 && renderCartStep()}
      {currentStep === 2 && renderInformationStep()}
      {currentStep === 3 && renderReviewStep()}
    </div>
  );
};

export default CheckoutPage;
