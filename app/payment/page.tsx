"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  RadioGroup,
  RadioGroupItem,
} from "../../components/ui/radio-group";
import { useToast } from "../../hooks/use-toast";
import { useCart } from "../../lib/CartContext";
import paymentQueries from "../../graphql/payment/queries";
import paymentMutations from "../../graphql/payment/mutations";
import authQueries from "../../graphql/auth/queries";
import orderQueries from "../../graphql/order/queries";
import { ArrowLeft, ExternalLink, RefreshCw } from "lucide-react";

const formatCurrency = (value: number) =>
  `₮${Math.round(value).toLocaleString()}`;

interface PaymentOption {
  _id: string;
  name: string;
  status: string;
  kind: string;
  config?: any;
}

const PaymentPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const {
    items: cartItems,
    totalPrice,
    totalItems,
    orderId,
  } = useCart();

  const { data: userData } = useQuery(authQueries.currentUser, {
    fetchPolicy: "cache-first",
  });

  const erxesCustomerId =
    userData?.clientPortalCurrentUser?.erxesCustomerId ?? undefined;

  const { data: configData } = useQuery(authQueries.currentConfig, {
    fetchPolicy: "cache-first",
  });
  const appToken = configData?.currentConfig?.erxesAppToken ?? null;

  const {
    data: orderData,
    loading: orderLoading,
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

  const {
    data: paymentsData,
    loading: loadingPayments,
    refetch: refetchPayments,
  } = useQuery(paymentQueries.payment, {
    fetchPolicy: "cache-and-network",
  });

  const paymentOptions = useMemo(
    () => paymentsData?.payments ?? [],
    [paymentsData]
  );

  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null
  );
  const [invoice, setInvoice] = useState<any | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);

  const [createInvoice, { loading: isCreatingInvoice }] = useMutation(
    paymentMutations.createInvoice,
    {
      context: appToken
        ? {
            headers: {
              "erxes-app-token": appToken,
            },
          }
        : undefined,
      onCompleted(data) {
        const payload = data?.invoiceCreate;
        if (payload) {
          setInvoice(payload);
          setInvoiceError(null);
          toast({
            title: "Төлбөрийн холбоос бэлэн боллоо",
            description: "Доорх холбоосоор төлбөрөө гүйцэтгэнэ үү.",
          });
        } else {
          setInvoice(null);
          setInvoiceError("Төлбөрийн холбоос үүсгэж чадсангүй.");
        }
      },
      onError(error) {
        setInvoiceError(error.message);
        toast({
          title: "Төлбөрийн холбоос үүсгэхэд алдаа гарлаа",
          description: error.message,
          variant: "destructive",
        });
      },
    }
  );

  useEffect(() => {
    if (!selectedPaymentId && paymentOptions.length > 0) {
      setSelectedPaymentId(paymentOptions[0]._id);
    }
  }, [paymentOptions, selectedPaymentId]);

  const activeOrder = orderData?.fullOrders?.[0] ?? null;
  const parsedDeliveryInfo = useMemo(() => {
    const raw = activeOrder?.deliveryInfo ?? null;
    if (!raw) {
      return null;
    }
    if (typeof raw === "string") {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
    return raw;
  }, [activeOrder?.deliveryInfo]);

  const invoiceRedirectUrl = useMemo(() => {
    if (!invoice?.data) {
      return null;
    }
    return (
      invoice.data.redirectUrl ||
      invoice.data.paymentUrl ||
      invoice.data.url ||
      invoice.data.checkoutUrl ||
      null
    );
  }, [invoice]);

  const handleCreateInvoice = useCallback(async () => {
    if (!selectedPaymentId) {
      toast({
        title: "Төлбөрийн хэлбэр сонгоно уу",
        description: "Төлбөрийн аль нэг сонголтыг заавал сонгох хэрэгтэй.",
        variant: "destructive",
      });
      return;
    }

    if (!orderId || totalItems === 0) {
      toast({
        title: "Захиалгын мэдээлэл дутуу байна",
        description:
          "Сагс хоосон эсвэл захиалга үүсээгүй байна. Эхлээд сагсаа баталгаажуулна уу.",
        variant: "destructive",
      });
      router.push("/checkout?step=1");
      return;
    }

    const variables: Record<string, any> = {
      amount: totalPrice,
      paymentIds: [selectedPaymentId],
      contentType: "pos:orders",
      contentTypeId: orderId,
      customerId: erxesCustomerId,
      customerType: "customer",
      description: `Захиалга ${orderId}`,
      phone: parsedDeliveryInfo?.phone ?? undefined,
      email: parsedDeliveryInfo?.email ?? undefined,
    };

    if (typeof window !== "undefined") {
      variables.redirectUri = window.location.href;
    }

    await createInvoice({ variables });
  }, [
    createInvoice,
    erxesCustomerId,
    orderId,
    parsedDeliveryInfo,
    router,
    selectedPaymentId,
    toast,
    totalItems,
    totalPrice,
  ]);

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Төлбөрийн мэдээлэл алга</CardTitle>
            <CardDescription>
              Таны сагс хоосон байна. Эхлээд бараа нэмнэ үү.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <Link href="/products">Бараа үзэх</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <header className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="inline-flex items-center gap-2 px-0 text-sm"
          onClick={() => router.back()}
        >
          <ArrowLeft className="h-4 w-4" />
          Буцах
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Төлбөрийн төв
          </h1>
          <p className="text-sm text-muted-foreground">
            Захиалгын төлбөрөө төлөхийн тулд төлбөрийн хэлбэрээ сонгон, холбоос
            үүсгэнэ үү.
          </p>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Төлбөрийн сонголт</CardTitle>
            <CardDescription>
              Төлбөрийн боломжит аргуудаас сонгосны дараа холбоос үүсгэнэ.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {loadingPayments && (
              <Card>
                <CardContent className="flex items-center gap-2 p-4 text-sm text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Төлбөрийн сонголтуудыг ачааллаж байна...
                </CardContent>
              </Card>
            )}

            {!loadingPayments && paymentOptions.length === 0 && (
              <Card>
                <CardContent className="p-4 text-sm text-muted-foreground">
                  Төлбөрийн боломжууд одоогоор бэлэн биш байна. Дараа дахин
                  оролдоно уу.
                </CardContent>
              </Card>
            )}

            {paymentOptions.length > 0 && (
              <RadioGroup
                value={selectedPaymentId ?? ""}
                onValueChange={(value) => setSelectedPaymentId(value)}
                className="space-y-3"
              >
                {paymentOptions.map((option: PaymentOption) => {
                  const checked = option._id === selectedPaymentId;
                  const config =
                    (option.config as {
                      description?: string;
                    } | null) ?? null;

                  return (
                    <label
                      key={option._id}
                      htmlFor={`payment-${option._id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-4 text-sm transition ${
                        checked
                          ? "border-primary bg-primary/5 text-foreground"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <RadioGroupItem
                        id={`payment-${option._id}`}
                        value={option._id}
                        disabled={option.status !== "active"}
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {option.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {config?.description ?? option.kind}
                        </span>
                        {option.status !== "active" && (
                          <Badge variant="outline" className="mt-2 w-fit text-xs">
                            Түр идэвхгүй
                          </Badge>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>
                Нийт төлөх дүн:{" "}
                <span className="font-semibold text-foreground">
                  {formatCurrency(totalPrice)}
                </span>
              </p>
              <p>Төлбөрийн системд шилжихэд хэдэн секунд шаардагдана.</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" onClick={refetchPayments}>
                Сонголтуудыг шинэчлэх
              </Button>
              <Button
                onClick={handleCreateInvoice}
                disabled={!selectedPaymentId || isCreatingInvoice}
              >
                {isCreatingInvoice
                  ? "Төлбөрийн холбоос үүсгэж байна..."
                  : "Төлбөр төлөх"}
              </Button>
            </div>
          </CardFooter>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Захиалгын товчоо</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {cartItems.map((item) => (
                <div
                  key={`payment-summary-${item.id}`}
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

          {parsedDeliveryInfo && (
            <Card>
              <CardHeader>
                <CardTitle>Хүргэлтийн мэдээлэл</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>
                  {parsedDeliveryInfo.firstName}{" "}
                  {parsedDeliveryInfo.lastName ?? ""}
                </p>
                {parsedDeliveryInfo.phone && <p>{parsedDeliveryInfo.phone}</p>}
                {parsedDeliveryInfo.email && <p>{parsedDeliveryInfo.email}</p>}
                <p>
                  {parsedDeliveryInfo.city}
                  {parsedDeliveryInfo.district
                    ? `, ${parsedDeliveryInfo.district}`
                    : ""}
                </p>
                {parsedDeliveryInfo.street && <p>{parsedDeliveryInfo.street}</p>}
              </CardContent>
            </Card>
          )}

          {invoice && (
            <Card>
              <CardHeader>
                <CardTitle>Төлбөрийн холбоос</CardTitle>
                <CardDescription>
                  Холбоосыг дарж тухайн төлбөрийн системд шилжинэ үү.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>И-Баримтын дугаар</span>
                  <Badge variant="outline">{invoice.invoiceNumber}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Үлдэгдэл дүн</span>
                  <span className="font-semibold text-foreground">
                    {formatCurrency(
                      typeof invoice.remainingAmount === "number"
                        ? invoice.remainingAmount
                        : totalPrice
                    )}
                  </span>
                </div>
                {invoiceRedirectUrl ? (
                  <Button asChild className="w-full">
                    <Link
                      href={invoiceRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2"
                    >
                      Төлбөр төлөх линк рүү очих
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  </Button>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Төлбөрийн системээс холбоос иртэл түр хүлээнэ үү.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {invoiceError && (
            <Card>
              <CardContent className="p-4 text-sm text-destructive">
                {invoiceError}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
