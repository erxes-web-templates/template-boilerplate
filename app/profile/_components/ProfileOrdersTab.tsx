"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery } from "@apollo/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { getFileUrl } from "@/lib/utils";
import paymentQueries from "@/graphql/payment/queries";
import paymentMutations from "@/graphql/payment/mutations";
import orderMutations from "@/graphql/order/mutations";
import authQueries from "@/graphql/auth/queries";
import {
  CheckCircle,
  Clock,
  ExternalLink,
  RefreshCw,
  XCircle,
} from "lucide-react";
import Link from "next/link";

const POLL_INTERVAL_MS = 3000;
const TIMEOUT_MS = 2 * 60 * 1000;

type ModalStatus = "pending" | "paid" | "expired" | "cancelled";

type OrderItem = {
  _id?: string | null;
  productName?: string | null;
  productImgUrl?: string | null;
  count?: number | null;
  unitPrice?: number | null;
  status?: string | null;
  description?: string | null;
};

type Order = {
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
  items?: OrderItem[];
};

type PaymentOption = {
  _id: string;
  name: string;
  status: string;
  kind: string;
  config?: any;
};

type ProfileOrdersTabProps = {
  orders: Order[];
  loading?: boolean;
};

const formatCurrency = (value?: number | null) =>
  `₮${Number(value || 0).toLocaleString()}`;

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("mn-MN") : "—";

const statusLabel: Record<string, string> = {
  new: "Шинэ",
  doing: "Хийгдэж байна",
  done: "Дууссан",
  complete: "Гүйцэтгэсэн",
  reDoing: "Дахин хийгдэж байна",
  pending: "Хүлээгдэж байна",
  return: "Буцаагдсан",
  cancelled: "Цуцлагдсан",
  cart: "Сагс",
  confirmed: "Баталгаажсан",
};

const PAYABLE_STATUSES = new Set(["new", "doing", "reDoing", "pending"]);

const isPayable = (order: Order) =>
  order.saleStatus !== "confirmed" &&
  PAYABLE_STATUSES.has(order.status ?? "");

const deliveryAddress = (order: Order): string | null => {
  const info = order.deliveryInfo;
  if (!info) return null;
  if (typeof info === "string") {
    try {
      const parsed = JSON.parse(info);
      return parsed?.address ?? parsed?.description ?? null;
    } catch {
      return info;
    }
  }
  return info?.address ?? info?.description ?? null;
};

// ─── Detail Dialog ────────────────────────────────────────────────────────────

function OrderDetailDialog({
  order,
  onClose,
}: {
  order: Order | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!order} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Захиалга #{order?.number ?? order?._id?.slice(-6)}
          </DialogTitle>
        </DialogHeader>

        {order && (
          <div className="space-y-5 text-sm">
            <div className="grid grid-cols-2 gap-3 rounded-lg border p-4">
              <div>
                <p className="text-xs text-muted-foreground">Төлөв</p>
                <Badge variant="outline" className="mt-1">
                  {statusLabel[order.status ?? ""] ?? order.status ?? "—"}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Борлуулалтын төлөв
                </p>
                <p className="font-medium">
                  {statusLabel[order.saleStatus ?? ""] ??
                    order.saleStatus ??
                    "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Огноо</p>
                <p className="font-medium">{formatDate(order.createdAt)}</p>
              </div>
              {order.paidDate && (
                <div>
                  <p className="text-xs text-muted-foreground">Төлсөн огноо</p>
                  <p className="font-medium">{formatDate(order.paidDate)}</p>
                </div>
              )}
            </div>

            {order.customer && (
              <div className="space-y-1 rounded-lg border p-4">
                <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                  Хэрэглэгч
                </p>
                <p className="font-medium">
                  {[order.customer.firstName, order.customer.lastName]
                    .filter(Boolean)
                    .join(" ") || "—"}
                </p>
                {order.customer.primaryPhone && (
                  <p className="text-muted-foreground">
                    {order.customer.primaryPhone}
                  </p>
                )}
                {order.customer.primaryEmail && (
                  <p className="text-muted-foreground">
                    {order.customer.primaryEmail}
                  </p>
                )}
              </div>
            )}

            {deliveryAddress(order) && (
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Хүргэлтийн хаяг
                </p>
                <p>{deliveryAddress(order)}</p>
              </div>
            )}

            {!!order.items?.length && (
              <div className="space-y-3 rounded-lg border p-4">
                <p className="text-xs font-semibold uppercase text-muted-foreground">
                  Бараанууд
                </p>
                {order.items.map((item, i) => {
                  const imageUrl = item.productImgUrl
                    ? getFileUrl(item.productImgUrl)
                    : undefined;
                  const lineTotal = (item.count ?? 1) * (item.unitPrice ?? 0);
                  return (
                    <div
                      key={item._id ?? i}
                      className="flex items-center gap-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={item.productName ?? ""}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                            —
                          </div>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <p className="font-medium">
                          {item.productName ?? "Бараа"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.unitPrice)} × {item.count ?? 1}
                        </p>
                      </div>
                      <p className="font-semibold">{formatCurrency(lineTotal)}</p>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="space-y-2 rounded-lg border p-4">
              <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
                Дүн
              </p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Нийт дүн</span>
                <span className="font-medium">
                  {formatCurrency(order.totalAmount)}
                </span>
              </div>
              {order.finalAmount != null && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Эцсийн дүн</span>
                  <span className="font-semibold">
                    {formatCurrency(order.finalAmount)}
                  </span>
                </div>
              )}
            </div>

            {order.description && (
              <div className="rounded-lg border p-4">
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                  Тэмдэглэл
                </p>
                <p className="text-muted-foreground">{order.description}</p>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Payment Dialog ───────────────────────────────────────────────────────────

function OrderPaymentDialog({
  order,
  onClose,
  onPaid,
}: {
  order: Order | null;
  onClose: () => void;
  onPaid: () => void;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [modalStatus, setModalStatus] = useState<ModalStatus>("pending");
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const [invoice, setInvoice] = useState<any | null>(null);
  const [transaction, setTransaction] = useState<any | null>(null);
  const [invoiceError, setInvoiceError] = useState<string | null>(null);
  const [showQr, setShowQr] = useState(false);

  const selectedPaymentIdRef = useRef<string | null>(null);
  const invoiceIdRef = useRef<string | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    selectedPaymentIdRef.current = selectedPaymentId;
  }, [selectedPaymentId]);

  const { data: configData } = useQuery(authQueries.currentConfig, {
    fetchPolicy: "cache-first",
  });
  const appToken = configData?.currentConfig?.erxesAppToken ?? null;
  const mutationContext = appToken
    ? { headers: { "erxes-app-token": appToken } }
    : undefined;

  const { data: paymentsData, loading: loadingPayments } = useQuery(
    paymentQueries.payment,
    { fetchPolicy: "cache-and-network", skip: !order },
  );
  const paymentOptions: PaymentOption[] = useMemo(
    () => paymentsData?.cpPayments ?? [],
    [paymentsData],
  );

  useEffect(() => {
    if (!selectedPaymentId && paymentOptions.length > 0) {
      setSelectedPaymentId(paymentOptions[0]._id);
    }
  }, [paymentOptions, selectedPaymentId]);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  useEffect(() => () => stopPolling(), [stopPolling]);

  // Reset state when order changes
  useEffect(() => {
    setModalStatus("pending");
    setInvoice(null);
    setTransaction(null);
    setInvoiceError(null);
    setShowQr(false);
    stopPolling();
  }, [order?._id, stopPolling]);

  const [changeSaleStatus] = useMutation(orderMutations.orderChangeSaleStatus, {
    onCompleted() {
      onPaid();
      setTimeout(() => {
        router.push("/profile?tab=orders");
      }, 2500);
    },
  });

  const [cancelOrderMutation, { loading: isCancelling }] = useMutation(
    orderMutations.ordersCancel,
    {
      onCompleted() {
        setModalStatus("cancelled");
        stopPolling();
        setTimeout(() => {
          onClose();
          router.push("/profile?tab=orders");
        }, 2000);
      },
    },
  );

  const [checkInvoiceMutation] = useMutation(paymentMutations.checkInvoice, {
    context: mutationContext,
    onCompleted(data) {
      if (data?.invoicesCheck === "paid") {
        stopPolling();
        setModalStatus("paid");
        if (order?._id) {
          changeSaleStatus({
            variables: { _id: order._id, saleStatus: "confirmed" },
          });
        }
      }
    },
  });

  const startPolling = useCallback(
    (invoiceId: string) => {
      invoiceIdRef.current = invoiceId;
      pollIntervalRef.current = setInterval(() => {
        if (invoiceIdRef.current) {
          checkInvoiceMutation({ variables: { id: invoiceIdRef.current } });
        }
      }, POLL_INTERVAL_MS);
      timeoutRef.current = setTimeout(() => {
        stopPolling();
        setModalStatus("expired");
      }, TIMEOUT_MS);
    },
    [checkInvoiceMutation, stopPolling],
  );

  const [addTransaction, { loading: isAddingTransaction }] = useMutation(
    paymentMutations.addTransaction,
    {
      context: mutationContext,
      onCompleted(data) {
        const tx = data?.cpPaymentTransactionsAdd;
        if (tx) {
          setTransaction(tx);
          if (invoiceIdRef.current) startPolling(invoiceIdRef.current);
        }
      },
      onError(err) {
        setInvoiceError(err.message);
      },
    },
  );

  const [createInvoice, { loading: isCreatingInvoice }] = useMutation(
    paymentMutations.createInvoice,
    {
      context: mutationContext,
      onCompleted(data) {
        const payload = data?.cpInvoiceCreate;
        if (payload) {
          setInvoice(payload);
          setInvoiceError(null);
          setShowQr(true);
          invoiceIdRef.current = payload._id;
          const paymentId = selectedPaymentIdRef.current;
          if (paymentId) {
            addTransaction({
              variables: {
                input: { invoiceId: payload._id, paymentId, amount: payload.amount },
              },
            });
          }
        } else {
          setInvoiceError("Төлбөрийн холбоос үүсгэж чадсангүй.");
        }
      },
      onError(err) {
        setInvoiceError(err.message);
        toast({
          title: "Алдаа гарлаа",
          description: err.message,
          variant: "destructive",
        });
      },
    },
  );

  const handlePay = useCallback(async () => {
    if (!selectedPaymentId || !order) return;
    const input: Record<string, any> = {
      amount: order.totalAmount ?? 0,
      paymentIds: [selectedPaymentId],
      contentType: "pos:orders",
      contentTypeId: order._id,
      customerType: "customer",
      description: `Захиалга #${order.number ?? order._id.slice(-6)}`,
    };
    if (typeof window !== "undefined") input.redirectUri = window.location.href;
    await createInvoice({ variables: { input } });
  }, [createInvoice, order, selectedPaymentId]);

  const handleCancel = useCallback(() => {
    stopPolling();
    if (order?._id) {
      cancelOrderMutation({ variables: { _id: order._id } });
    } else {
      onClose();
    }
  }, [cancelOrderMutation, onClose, order, stopPolling]);

  const handleClose = useCallback(
    (open: boolean) => {
      if (!open && modalStatus === "pending" && showQr) return;
      if (!open) {
        stopPolling();
        onClose();
      }
    },
    [modalStatus, onClose, showQr, stopPolling],
  );

  const invoiceRedirectUrl = useMemo(() => {
    const d = invoice?.data;
    if (!d) return null;
    return d.redirectUrl || d.paymentUrl || d.url || d.checkoutUrl || null;
  }, [invoice]);

  return (
    <Dialog open={!!order} onOpenChange={handleClose}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => {
          if (modalStatus === "pending" && showQr) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle>
            {modalStatus === "paid" && "Төлбөр амжилттай"}
            {modalStatus === "expired" && "Хугацаа дууссан"}
            {modalStatus === "cancelled" && "Захиалга цуцлагдлаа"}
            {modalStatus === "pending" &&
              (showQr
                ? "Төлбөрийн мэдээлэл"
                : `Захиалга #${order?.number ?? order?._id?.slice(-6)}`)}
          </DialogTitle>
          <DialogDescription>
            {modalStatus === "paid" &&
              "Таны захиалга баталгаажлаа. Захиалгын хуудас руу шилжиж байна…"}
            {modalStatus === "expired" &&
              "Төлбөрийн хугацаа дууссан. Дахин оролдоно уу."}
            {modalStatus === "cancelled" && "Захиалга цуцлагдлаа."}
            {modalStatus === "pending" &&
              !showQr &&
              "Төлбөрийн аргаа сонгон төлбөр хийнэ үү."}
            {modalStatus === "pending" &&
              showQr &&
              "QR кодыг уншуулж эсвэл холбоосоор төлбөрөө гүйцэтгэнэ үү."}
          </DialogDescription>
        </DialogHeader>

        {/* Success */}
        {modalStatus === "paid" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500" />
            <p className="text-sm text-muted-foreground">
              Захиалгын дугаар:{" "}
              <span className="font-medium text-foreground">
                #{order?.number ?? order?._id?.slice(-6)}
              </span>
            </p>
          </div>
        )}

        {/* Expired */}
        {modalStatus === "expired" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <Clock className="h-16 w-16 text-amber-500" />
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowQr(false);
                  setInvoice(null);
                  setTransaction(null);
                  setModalStatus("pending");
                }}
              >
                Дахин оролдох
              </Button>
              <Button
                variant="destructive"
                onClick={handleCancel}
                disabled={isCancelling}
              >
                Захиалга цуцлах
              </Button>
            </div>
          </div>
        )}

        {/* Cancelled */}
        {modalStatus === "cancelled" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <XCircle className="h-16 w-16 text-destructive" />
          </div>
        )}

        {/* Pending — payment selection */}
        {modalStatus === "pending" && !showQr && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Төлөх дүн</span>
              <span className="font-semibold text-foreground">
                {formatCurrency(order?.totalAmount)}
              </span>
            </div>

            {loadingPayments && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                Ачааллаж байна…
              </div>
            )}

            {!loadingPayments && paymentOptions.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Төлбөрийн сонголт одоогоор бэлэн биш байна.
              </p>
            )}

            {paymentOptions.length > 0 && (
              <RadioGroup
                value={selectedPaymentId ?? ""}
                onValueChange={setSelectedPaymentId}
                className="space-y-2"
              >
                {paymentOptions.map((opt) => {
                  const checked = opt._id === selectedPaymentId;
                  return (
                    <label
                      key={opt._id}
                      htmlFor={`pay-${opt._id}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 text-sm transition ${
                        checked
                          ? "border-primary bg-primary/5"
                          : "border-border text-muted-foreground"
                      }`}
                    >
                      <RadioGroupItem
                        id={`pay-${opt._id}`}
                        value={opt._id}
                        disabled={opt.status !== "active"}
                      />
                      <div className="flex flex-1 flex-col">
                        <span className="font-medium text-foreground">
                          {opt.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {(opt.config as any)?.description ?? opt.kind}
                        </span>
                        {opt.status !== "active" && (
                          <Badge variant="outline" className="mt-1 w-fit text-xs">
                            Түр идэвхгүй
                          </Badge>
                        )}
                      </div>
                    </label>
                  );
                })}
              </RadioGroup>
            )}

            {invoiceError && (
              <p className="text-sm text-destructive">{invoiceError}</p>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={onClose}>
                Болих
              </Button>
              <Button
                onClick={handlePay}
                disabled={
                  !selectedPaymentId ||
                  isCreatingInvoice ||
                  isAddingTransaction ||
                  paymentOptions.length === 0
                }
              >
                {isCreatingInvoice || isAddingTransaction
                  ? "Бэлдэж байна…"
                  : "Төлбөр төлөх"}
              </Button>
            </div>
          </div>
        )}

        {/* Pending — QR */}
        {modalStatus === "pending" && showQr && invoice && (
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between">
              <span>И-Баримтын дугаар</span>
              <Badge variant="outline">{invoice.invoiceNumber}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Төлөх дүн</span>
              <span className="font-semibold">
                {formatCurrency(invoice.amount ?? order?.totalAmount)}
              </span>
            </div>

            {isAddingTransaction && (
              <div className="flex items-center justify-center gap-2 py-6 text-muted-foreground">
                <RefreshCw className="h-4 w-4 animate-spin" />
                QR код бэлдэж байна…
              </div>
            )}

            {transaction?.response &&
              (() => {
                const res = transaction.response;
                const qrImage =
                  res.qr_image || res.qrImage || res.qr_code || res.qrCode || null;
                const qrText = res.qr_text || res.qrText || res.qr || null;
                const redirectUrl =
                  res.redirectUrl ||
                  res.redirect_url ||
                  res.paymentUrl ||
                  res.payment_url ||
                  res.url ||
                  invoiceRedirectUrl ||
                  null;

                return (
                  <div className="space-y-3">
                    {qrImage && (
                      <div className="flex flex-col items-center gap-2 rounded-md border p-4">
                        <p className="text-xs text-muted-foreground">
                          QR кодыг уншуулж төлнэ үү
                        </p>
                        <img
                          src={
                            qrImage.startsWith("data:")
                              ? qrImage
                              : `data:image/png;base64,${qrImage}`
                          }
                          alt="Payment QR"
                          className="h-48 w-48 rounded"
                        />
                      </div>
                    )}
                    {!qrImage && qrText && (
                      <div className="flex flex-col items-center gap-2 rounded-md border p-4">
                        <p className="text-xs text-muted-foreground">
                          QR кодыг уншуулж төлнэ үү
                        </p>
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=192x192&data=${encodeURIComponent(qrText)}`}
                          alt="Payment QR"
                          className="h-48 w-48 rounded"
                        />
                      </div>
                    )}
                    {redirectUrl && (
                      <Button asChild className="w-full">
                        <Link
                          href={redirectUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2"
                        >
                          Төлбөр төлөх линк рүү очих
                          <ExternalLink className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                );
              })()}

            <div className="flex items-center justify-center gap-2 pt-2 text-xs text-muted-foreground">
              <RefreshCw className="h-3 w-3 animate-spin" />
              Төлбөрийн байдлыг шалгаж байна…
            </div>

            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleCancel}
              disabled={isCancelling}
            >
              {isCancelling ? "Цуцалж байна…" : "Захиалга цуцлах"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Tab ─────────────────────────────────────────────────────────────────

const ProfileOrdersTab = ({ orders, loading }: ProfileOrdersTabProps) => {
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [payOrder, setPayOrder] = useState<Order | null>(null);

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Захиалгуудыг ачааллаж байна…
      </p>
    );
  }

  if (!orders?.length) {
    return (
      <p className="text-sm text-muted-foreground">
        Таны захиалгын түүх хоосон байна.
      </p>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order._id} className="border border-muted">
            <CardHeader className="flex flex-row items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base font-semibold">
                  Захиалга #{order.number ?? order._id.slice(-6)}
                </CardTitle>
                <CardDescription>
                  {formatDate(order.createdAt)} · Нийт:{" "}
                  <span className="font-medium text-foreground">
                    {formatCurrency(order.totalAmount)}
                  </span>
                </CardDescription>
              </div>
              <Badge variant="outline">
                {statusLabel[order.status ?? ""] ??
                  order.status ??
                  "Төлөв тодорхойгүй"}
              </Badge>
            </CardHeader>

            <CardContent className="grid gap-3 md:grid-cols-3">
              {order.items?.slice(0, 3).map((item, index) => {
                const imageUrl = item?.productImgUrl
                  ? getFileUrl(item.productImgUrl)
                  : undefined;
                return (
                  <div
                    key={`${order._id}-item-${index}`}
                    className="flex gap-3 rounded-lg border bg-muted/30 p-3"
                  >
                    <div className="relative h-16 w-16 overflow-hidden rounded-md bg-muted">
                      {imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={imageUrl}
                          alt={item?.productName ?? "Product"}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 flex-col justify-between text-sm">
                      <p className="font-medium">
                        {item?.productName ?? "Бараа"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Тоо: {item?.count ?? 1}
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>

            <CardFooter className="flex justify-end gap-2">
              {isPayable(order) && (
                <Button
                  size="sm"
                  onClick={() => setPayOrder(order)}
                >
                  Төлбөр төлөх
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDetailOrder(order)}
              >
                Дэлгэрэнгүй харах
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <OrderDetailDialog
        order={detailOrder}
        onClose={() => setDetailOrder(null)}
      />

      <OrderPaymentDialog
        order={payOrder}
        onClose={() => setPayOrder(null)}
        onPaid={() => setPayOrder(null)}
      />
    </>
  );
};

export default ProfileOrdersTab;
