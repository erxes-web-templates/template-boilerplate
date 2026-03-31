"use client";

import { Receipt } from "lucide-react";

type Payment = {
  _id: string;
  name: string;
  kind: string;
};

type PaymentSectionProps = {
  paymentUrl?: string | null;
  transaction?: any | null;
  loading?: boolean;
  payments?: Payment[];
  selectedPaymentId?: string | null;
  onSelectPayment?: (id: string) => void;
  onPay?: () => void;
};

export default function PaymentSection({
  paymentUrl,
  transaction,
  loading = false,
  payments = [],
  selectedPaymentId,
  onSelectPayment,
  onPay,
}: PaymentSectionProps) {
  const res = transaction?.response;

  const rawQrImage =
    res?.qrData ||
    res?.qr_image ||
    res?.qrImage ||
    res?.qr_code ||
    res?.qrCode ||
    null;
  const isValidQrImage =
    !!rawQrImage &&
    !rawQrImage.endsWith("undefined") &&
    !rawQrImage.endsWith("null");
  const qrImage = isValidQrImage ? rawQrImage : null;

  const qrText = res?.qr_text || res?.qrText || res?.qr || null;
  const redirectUrl =
    paymentUrl ||
    res?.invoice ||
    res?.redirectUrl ||
    res?.redirect_url ||
    res?.paymentUrl ||
    res?.payment_url ||
    res?.url ||
    transaction?.details?.invoice ||
    transaction?.details?.redirectUrl ||
    transaction?.details?.url ||
    null;

  const iframeUrl = redirectUrl
    ? redirectUrl.startsWith("http")
      ? redirectUrl
      : `https://ecommerce.golomtbank.com/payment/en/${redirectUrl}`
    : null;

  const hasPaymentResult = iframeUrl || qrImage || qrText;

  return (
    <div className="space-y-6">
      <div className="flex gap-2 items-center text-[#5F5F5F]">
        <Receipt className="w-4 h-4" />
        <h2 className="text-lg font-semibold">Payment</h2>
      </div>

      {loading ? (
        <div
          className="flex flex-col gap-4 justify-center items-center w-full bg-white rounded-2xl shadow-sm"
          style={{ height: 400 }}
        >
          <div className="w-8 h-8 rounded-full border-2 border-gray-300 border-t-gray-700 animate-spin" />
          <p className="text-sm text-gray-500">Creating payment...</p>
        </div>
      ) : hasPaymentResult ? (
        iframeUrl ? (
          <div className="w-full" style={{ height: 750 }}>
            <iframe
              src={iframeUrl}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                borderRadius: 16,
              }}
            />
          </div>
        ) : qrImage ? (
          <div className="flex flex-col gap-4 justify-center items-center w-full bg-white rounded-2xl shadow-sm py-16">
            <p className="text-sm font-medium text-gray-600">Scan QR to pay</p>
            <img
              src={qrImage.startsWith("data:") ? qrImage : `data:image/png;base64,${qrImage}`}
              alt="Payment QR"
              className="w-56 h-56 rounded"
            />
          </div>
        ) : (
          <div className="flex flex-col gap-4 justify-center items-center w-full bg-white rounded-2xl shadow-sm py-16">
            <p className="text-sm font-medium text-gray-600">Scan QR to pay</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=224x224&data=${encodeURIComponent(qrText!)}`}
              alt="Payment QR"
              className="w-56 h-56 rounded"
            />
          </div>
        )
      ) : (
        <div className="p-6 bg-white rounded-2xl shadow-sm space-y-4">
          <p className="text-sm font-medium text-gray-700">Select payment method</p>

          {payments.length === 0 ? (
            <p className="text-sm text-gray-400">Loading payment options...</p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {payments.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => onSelectPayment?.(p._id)}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    selectedPaymentId === p._id
                      ? "border-gray-800 bg-gray-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <span className="text-xs font-semibold text-gray-700 text-center">
                    {p.name}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                    {p.kind}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onPay}
            disabled={!selectedPaymentId || loading}
            className="w-full py-3 rounded-xl bg-gray-900 text-white text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}
