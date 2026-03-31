"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useLazyQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import {
  mutations as tmsMutations,
  queries as tmsQueries,
} from "../../../graphql/tms";
import { mutations as customerMutations } from "../../../graphql/customers";
import paymentMutations from "../../../graphql/payment/mutations";
import paymentQueries from "../../../graphql/payment/queries";
import authQueries from "../../../graphql/auth/queries";
import { toast } from "sonner";
import TravelerDetailsAndSummary from "./TravelerDetailsAndSummary";
import BookingSummarySidebar from "./BookingSummarySidebar";
import CompleteSection from "./CompleteSection";
import PaymentSection from "./PaymentSection";
import { validateBookingStepOne } from "./bookingSchemas";
import type { BmTour } from "../../../types/tours";
import { Check } from "lucide-react";
import generateRandomPassword from "../../../lib/password-generator";
import { getFileUrl } from "../../../lib/utils";

// Constants
const TAX_RATE = 0.04;
const PAYMENT_CHECK_INTERVAL = 3000;

export type BookingFormData = {
  selectedDate: string | null;
  travelers: number;
  additionalInfo: string;
  onePaxPrice?: number;
  leadTraveler: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    birthDate: Date | undefined;
    gender: string;
    nationality: string;
    passportNumber?: string;
    address?: string;
  };
  additionalTravelers: Array<{
    firstName: string;
    lastName: string;
    birthDate: Date | undefined;
    gender: string;
    nationality: string;
    passportNumber?: string;
    email?: string;
  }>;
  paymentType: string;
  paymentMethod: string;
};

const safeSessionStorage = {
  get: (key: string): string | null => {
    try {
      return sessionStorage.getItem(key);
    } catch {
      return null;
    }
  },
  set: (key: string, value: string): void => {
    try {
      sessionStorage.setItem(key, value);
    } catch {
      // Silently fail
    }
  },
};

export default function BookingForm() {
  const params = useSearchParams();

  const urlParams = useMemo(
    () => ({
      tourId: params.get("tourId"),
      startDate: params.get("sd") || params.get("startDate"),
      travelers: params.get("tr") || params.get("travelers"),
      pricePerPerson: params.get("pp"),
      orderId: params.get("orderId") || params.get("oid"),
      paymentType: params.get("pt"),
      downPayment: params.get("dp"),
      remaining: params.get("remaining"),
      amount: params.get("amount"),
    }),
    [params],
  );

  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(
    null,
  );
  const selectedPaymentIdRef = useRef<string | null>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [paidByCheck, setPaidByCheck] = useState(false);
  const [serverRegNumber, setServerRegNumber] = useState<string | null>(null);
  const [serverSex, setServerSex] = useState<number | null>(null);

  // Current user
  const { data: userData } = useQuery(authQueries.currentUser);
  const currentUser = userData?.clientPortalCurrentUser || null;

  // Tour group data
  const { data: groupToursData } = useQuery(
    tmsQueries.TOUR_GROUP_DETAIL_QUERY,
    {
      variables: {
        status: "published",
        groupCode: urlParams.tourId || "",
      },
      skip: !urlParams.tourId,
    },
  );

  const groupTourItems = useMemo(
    () => (groupToursData?.cpBmToursGroupDetail?.items ?? []) as BmTour[],
    [groupToursData],
  );

  const selectedItem = useMemo(
    () =>
      urlParams.startDate
        ? groupTourItems.find(
            (it) =>
              it?.startDate &&
              it.startDate.slice(0, 10) === urlParams.startDate!.slice(0, 10),
          )
        : groupTourItems[0],
    [groupTourItems, urlParams.startDate],
  );

  const [formData, setFormData] = useState<BookingFormData>({
    selectedDate: urlParams.startDate,
    travelers: Number(urlParams.travelers || 1),
    additionalInfo: "",
    leadTraveler: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      birthDate: undefined,
      gender: "1",
      nationality: "",
      passportNumber: "",
      address: "",
    },
    additionalTravelers: [],
    paymentType: "Card",
    paymentMethod: "card",
  });

  // Sync URL params to form
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedDate: urlParams.startDate || prev.selectedDate,
      travelers: Number(urlParams.travelers || prev.travelers || 1),
    }));
  }, [urlParams.startDate, urlParams.travelers]);

  // Sync current user into lead traveler
  useEffect(() => {
    if (!currentUser) return;
    setFormData((prev) => ({
      ...prev,
      leadTraveler: {
        ...prev.leadTraveler,
        firstName: currentUser.firstName || prev.leadTraveler.firstName,
        lastName: currentUser.lastName || prev.leadTraveler.lastName,
        email: currentUser.email || prev.leadTraveler.email,
        phone: currentUser.phone || prev.leadTraveler.phone,
      },
    }));
  }, [currentUser]);

  // Restore existing order from URL
  useEffect(() => {
    if (!urlParams.orderId) return;
    setOrderId(urlParams.orderId);
    setCurrentStep(2);

    const isPendingPayment = urlParams.paymentType === "pending";
    const isPrepaidRemaining =
      !!urlParams.remaining && Number(urlParams.remaining) > 0;
    const needsFreshPayment = isPendingPayment || isPrepaidRemaining;

    if (!needsFreshPayment) {
      const savedInvoice = safeSessionStorage.get(
        `invoice:${urlParams.orderId}`,
      );
      const savedPayUrl = safeSessionStorage.get(`payurl:${urlParams.orderId}`);
      if (savedInvoice) setInvoiceId(savedInvoice);
      if (savedPayUrl) setPaymentUrl(savedPayUrl);
    }
  }, [urlParams.orderId, urlParams.paymentType, urlParams.remaining]);

  // Fetch customer details once we have a logged-in user
  const [fetchCustomersByIds] = useLazyQuery(
    gql`
      query BookingCustomersMain($ids: [String]) {
        cpCustomers(ids: $ids) {
          list {
            _id
            registrationNumber
            sex
          }
        }
      }
    `,
    { fetchPolicy: "no-cache" },
  );

  useEffect(() => {
    const id = currentUser?.erxesCustomerId;
    if (!id) return;
    fetchCustomersByIds({ variables: { ids: [id] } }).then(({ data }) => {
      const customer = data?.cpCustomers?.list?.[0];
      if (!customer) return;
      setServerRegNumber(customer.registrationNumber || null);
      setServerSex(typeof customer.sex === "number" ? customer.sex : null);
      setFormData((prev) => ({
        ...prev,
        leadTraveler: {
          ...prev.leadTraveler,
          passportNumber:
            prev.leadTraveler.passportNumber ||
            customer.registrationNumber ||
            "",
        },
      }));
    });
  }, [currentUser?.erxesCustomerId, fetchCustomersByIds]);

  // Pricing
  const pricePerPerson = useMemo(
    () => Number(urlParams.pricePerPerson || 0) || groupTourItems[0]?.cost || 0,
    [urlParams.pricePerPerson, groupTourItems],
  );

  const { totalPrice, totalWithTax } = useMemo(() => {
    const isRemaining =
      !!urlParams.remaining && Number(urlParams.remaining) > 0;
    const basePrice = isRemaining
      ? Number(urlParams.remaining)
      : Math.max(0, formData.travelers * pricePerPerson);
    return {
      totalPrice: basePrice,
      totalWithTax: Math.round(basePrice * (1 + TAX_RATE)),
    };
  }, [urlParams.remaining, formData.travelers, pricePerPerson]);

  // Mutations
  const [orderAddMutation, { loading: creatingOrder }] = useMutation(
    tmsMutations.BM_ORDER_ADD,
  );
  const [editOrder] = useMutation(tmsMutations.BM_ORDER_EDIT);
  const [addCpUser] = useMutation(customerMutations.addCpUser);
  const [addCustomer] = useMutation(customerMutations.addCustomer);
  const [editCustomer] = useMutation(customerMutations.editCustomer);
  const [changeState] = useMutation(customerMutations.customersChangeState);

  const [createInvoice, { loading: creatingInvoice }] = useMutation(
    paymentMutations.invoiceCreate,
    {
      onCompleted: async (data) => {
        const created = data?.cpInvoiceCreate;
        const newInvoiceId = created?._id;
        if (!newInvoiceId) return;

        setInvoiceId(newInvoiceId);
        if (orderId) {
          safeSessionStorage.set(`invoice:${orderId}`, newInvoiceId);
        }

        const tx = created?.transactions?.[0];
        const paymentId = tx?.paymentId || selectedPaymentIdRef.current;

        if (paymentId) {
          try {
            const { data: txData } = await addTransaction({
              variables: {
                input: {
                  invoiceId: newInvoiceId,
                  paymentId,
                  amount: Number(created?.amount || 0),
                },
              },
            });
            const newTx = txData?.cpPaymentTransactionsAdd;
            if (newTx) {
              setTransaction(newTx);
              const res = newTx.response;
              const payUrl =
                res?.invoice ||
                res?.redirectUrl ||
                res?.redirect_url ||
                res?.paymentUrl ||
                res?.payment_url ||
                res?.url ||
                newTx.details?.invoice ||
                newTx.details?.redirectUrl ||
                newTx.details?.url;
              if (payUrl) {
                setPaymentUrl(payUrl);
                if (orderId) {
                  safeSessionStorage.set(`payurl:${orderId}`, payUrl);
                }
              }
            }
          } catch {
            // Ignore transaction errors
          }
        }
      },
    },
  );

  const [addTransaction] = useMutation(paymentMutations.transactionsAdd);
  const [checkInvoice] = useMutation(paymentMutations.checkInvoice);
  const { data: paymentsData } = useQuery(paymentQueries.payments);
  const payments = paymentsData?.cpPayments || [];

  // Find customer by email
  const [findCustomerQuery] = useLazyQuery(
    gql`
      query FindCustomerByEmail($email: String) {
        cpCustomers(searchValue: $email) {
          list {
            _id
            primaryEmail
          }
        }
      }
    `,
    { fetchPolicy: "no-cache" },
  );

  const handleFindCustomer = useCallback(
    async (email: string) => {
      const { data } = await findCustomerQuery({ variables: { email } });
      const list = data?.cpCustomers?.list || [];
      return (
        list.find(
          (c: any) => c.primaryEmail?.toLowerCase() === email.toLowerCase(),
        ) || null
      );
    },
    [findCustomerQuery],
  );

  const handleSelectPayment = useCallback((id: string) => {
    setSelectedPaymentId(id);
    selectedPaymentIdRef.current = id;
  }, []);

  const handlePay = useCallback(async () => {
    if (!selectedPaymentId || !orderId) {
      toast.error("Please select a payment method");
      return;
    }

    let amount: number;
    if (urlParams.remaining && Number(urlParams.remaining) > 0) {
      amount = Math.round(Number(urlParams.remaining) * (1 + TAX_RATE));
    } else if (urlParams.paymentType === "prepaid" && urlParams.downPayment) {
      amount = Math.floor(Number(urlParams.downPayment) * (1 + TAX_RATE));
    } else if (urlParams.paymentType === "pending" && urlParams.amount) {
      amount = Math.round(Number(urlParams.amount) * (1 + TAX_RATE));
    } else {
      amount = totalWithTax;
    }

    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    try {
      await createInvoice({
        variables: {
          input: {
            amount,
            phone: currentUser?.phone || undefined,
            email: currentUser?.email || undefined,
            description: `Booking #${orderId}`,
            customerId: currentUser?.erxesCustomerId,
            customerType: currentUser?.erxesCustomerId ? "customer" : "visitor",
            contentTypeId: orderId,
            paymentIds: [selectedPaymentId],
          },
        },
      });
    } catch (error) {
      toast.error("Payment initialization failed", {
        description: "Unable to process payment. Please try again.",
      });
    }
  }, [
    selectedPaymentId,
    orderId,
    currentUser,
    totalWithTax,
    urlParams.remaining,
    urlParams.paymentType,
    urlParams.downPayment,
    urlParams.amount,
    createInvoice,
  ]);

  // Poll payment status
  useEffect(() => {
    if (!invoiceId || currentStep !== 2) return;

    let active = true;

    const pollPaymentStatus = async () => {
      try {
        const { data } = await checkInvoice({ variables: { id: invoiceId } });
        const isPaid = String(data?.cpInvoicesCheck).toLowerCase() === "paid";

        if (isPaid && active && orderId) {
          setPaidByCheck(true);

          if (urlParams.remaining) {
            await editOrder({
              variables: {
                id: orderId,
                order: { parent: "0", status: "paid" },
              },
            });
          } else if (
            urlParams.paymentType === "prepaid" &&
            urlParams.downPayment
          ) {
            const downPaymentBase = Number(urlParams.downPayment);
            const parent = String(Math.max(0, totalPrice - downPaymentBase));
            await editOrder({
              variables: {
                id: orderId,
                order: { parent, isChild: true },
              },
            });
          } else {
            await editOrder({
              variables: {
                id: orderId,
                order: { status: "paid" },
              },
            });
          }

          setCurrentStep(3);
        }
      } catch (error) {
        console.error("Payment check error:", error);
      }
    };

    const intervalId = setInterval(pollPaymentStatus, PAYMENT_CHECK_INTERVAL);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [
    invoiceId,
    currentStep,
    orderId,
    urlParams.remaining,
    urlParams.paymentType,
    urlParams.downPayment,
    totalPrice,
    checkInvoice,
    editOrder,
  ]);

  // Create additional customers
  const createAdditionalCustomers = useCallback(async (): Promise<string[]> => {
    const travelers = formData.additionalTravelers || [];
    const ids: string[] = [];

    for (const traveler of travelers) {
      try {
        let id: string | undefined;

        if (traveler.email) {
          const existing = await handleFindCustomer(traveler.email);
          if (existing?._id) {
            id = existing._id;
            if (traveler.passportNumber?.trim() && traveler.gender?.trim()) {
              await editCustomer({
                variables: {
                  id,
                  registrationNumber: traveler.passportNumber,
                  sex: traveler.gender === "female" ? 2 : 1,
                },
              });
            }
          }
        }

        if (!id) {
          const { data } = await addCustomer({
            variables: {
              firstName: traveler.firstName,
              lastName: traveler.lastName,
              primaryEmail: traveler.email || undefined,
              registrationNumber: traveler.passportNumber,
              state: "customer",
              sex: traveler.gender === "female" ? 2 : 1,
            },
          });
          id = data?.customersAdd?._id;
        }

        if (id) ids.push(id);
      } catch {
        // Continue with next traveler
      }
    }
    return ids;
  }, [
    formData.additionalTravelers,
    addCustomer,
    editCustomer,
    handleFindCustomer,
  ]);

  // Create or find lead customer
  const setupLeadCustomer = useCallback(async (): Promise<
    string | undefined
  > => {
    let leadCustomerId = currentUser?.erxesCustomerId;
    const lead = formData.leadTraveler;

    if (!leadCustomerId) {
      if (lead.email?.trim()) {
        const existing = await handleFindCustomer(lead.email);
        if (existing?._id) {
          leadCustomerId = existing._id;
        }
      }

      if (!leadCustomerId) {
        try {
          const { data: cpData } = await addCpUser({
            variables: {
              clientPortalId: process.env.ERXES_CP_ID,
              type: "customer",
              disableVerificationMail: false,
              password: generateRandomPassword(),
              firstName: lead.firstName,
              lastName: lead.lastName,
              phone: lead.phone,
              email: lead.email,
            },
          });
          leadCustomerId = cpData?.clientPortalUserRegister?.erxesCustomerId;
        } catch {
          // Continue without customer ID
        }
      }
    }

    if (leadCustomerId) {
      const passportNum = lead.passportNumber?.trim();
      const needsRegNumber = !serverRegNumber && !!passportNum;
      const needsSex = serverSex === 0 && !!lead.gender?.trim();

      if (needsRegNumber || needsSex) {
        try {
          await editCustomer({
            variables: {
              id: leadCustomerId,
              ...(needsRegNumber && { registrationNumber: passportNum }),
              ...(needsSex && {
                sex: lead.gender === "female" ? 2 : 1,
              }),
            },
          });
          await changeState({
            variables: { _id: leadCustomerId, value: "customer" },
          });
          if (needsRegNumber) setServerRegNumber(passportNum!);
        } catch {
          // Ignore update errors
        }
      }
    }

    return leadCustomerId;
  }, [
    currentUser,
    formData.leadTraveler,
    serverRegNumber,
    serverSex,
    handleFindCustomer,
    addCpUser,
    editCustomer,
    changeState,
  ]);

  const validateStep1 = useCallback(() => {
    const res = validateBookingStepOne(formData);
    if (!res.ok) {
      toast.error(`Please fill: ${res.errors.join(", ")}`);
      return false;
    }
    return true;
  }, [formData]);

  const handleContinue = useCallback(async () => {
    if (currentStep === 1) {
      if (nextLoading || creatingOrder) return;

      if (!validateStep1()) {
        setShowErrors(true);
        return;
      }
      setShowErrors(false);

      if (!orderId) {
        try {
          setNextLoading(true);

          const leadCustomerId = await setupLeadCustomer();
          if (!leadCustomerId) return;

          const additionalCustomerIds = await createAdditionalCustomers();

          const orderStatus =
            urlParams.paymentType === "prepaid" ? "prepaid" : "pending";
          const downPaymentBase = urlParams.downPayment
            ? Number(urlParams.downPayment)
            : 0;
          const orderAmount =
            urlParams.paymentType === "prepaid" && urlParams.downPayment
              ? downPaymentBase
              : totalPrice;
          const parentRemaining =
            urlParams.paymentType === "prepaid" && urlParams.downPayment
              ? String(Math.max(0, totalPrice - downPaymentBase))
              : undefined;

          const { data } = await orderAddMutation({
            variables: {
              order: {
                tourId: selectedItem?._id,
                branchId: selectedItem?.branchId,
                customerId: leadCustomerId,
                amount: orderAmount,
                numberOfPeople: formData.travelers,
                note: formData.additionalInfo,
                type: formData.paymentType,
                status: orderStatus,
                parent: parentRemaining,
                isChild:
                  urlParams.paymentType === "prepaid" && urlParams.downPayment
                    ? false
                    : undefined,
                additionalCustomers:
                  additionalCustomerIds.length > 0
                    ? additionalCustomerIds
                    : undefined,
              },
            },
          });

          const newOrderId = data?.cpBmsOrderAdd?._id;
          if (newOrderId) {
            setOrderId(newOrderId);
          }
        } catch (error) {
          const message =
            error && typeof error === "object" && "message" in error
              ? String((error as { message: unknown }).message)
              : "Please try again";
          toast.error("Failed to start booking", { description: message });
          return;
        } finally {
          setNextLoading(false);
        }
      }
    }

    setCurrentStep((prev) => prev + 1);
  }, [
    currentStep,
    nextLoading,
    creatingOrder,
    validateStep1,
    orderId,
    setupLeadCustomer,
    createAdditionalCustomers,
    urlParams.paymentType,
    urlParams.downPayment,
    totalPrice,
    selectedItem,
    formData.travelers,
    formData.additionalInfo,
    formData.paymentType,
    orderAddMutation,
  ]);

  const handleBack = useCallback(() => {
    setCurrentStep((prev) => prev - 1);
  }, []);

  const updateFormData = useCallback((newData: Partial<BookingFormData>) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  }, []);

  const handleBooking = useCallback(() => {
    toast.success("Booking submitted!", {
      description: "Thank you for your booking.",
      duration: 6000,
    });
  }, []);

  const isPaymentSuccess = paidByCheck;

  const steps = [
    { label: "Select Tour", num: 1 },
    { label: "Payment", num: 2 },
    { label: "Complete", num: 3 },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero + Stepper */}
      <div
        className="relative w-full h-[360px] bg-center bg-cover"
        style={{
          backgroundImage: getFileUrl(selectedItem?.imageThumbnail || "")
            ? `url("${getFileUrl(selectedItem?.imageThumbnail || "")}")`
            : `url("/images/tour-bg.jpg")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
          <div className="container mx-auto max-w-5xl">
            <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-4">
              {selectedItem?.name || "Tour Booking"}
            </h1>

            {/* Stepper */}
            <div className="flex items-center gap-2">
              {steps.map((step, idx) => (
                <div key={step.num} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex justify-center items-center w-8 h-8 text-xs font-bold rounded-full transition-all duration-300"
                      style={
                        currentStep > step.num
                          ? { backgroundColor: "var(--primary)", color: "#fff" }
                          : currentStep === step.num
                            ? { backgroundColor: "#fff", color: "var(--primary)" }
                            : { backgroundColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.6)" }
                      }
                    >
                      {currentStep > step.num ? <Check className="w-4 h-4" /> : String(step.num)}
                    </span>
                    <span
                      className={`text-sm font-semibold whitespace-nowrap transition-colors duration-300 ${
                        currentStep >= step.num ? "text-white" : "text-white/50"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className="w-8 h-0.5 mx-1 transition-all duration-300 sm:w-12"
                      style={{ backgroundColor: currentStep > step.num ? "var(--primary)" : "rgba(255,255,255,0.2)" }}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <TravelerDetailsAndSummary
                formData={formData}
                updateFormData={updateFormData}
                selectedItem={selectedItem}
                urlStartDate={urlParams.startDate}
                pricePerPerson={pricePerPerson}
                totalPrice={totalPrice}
                handleContinue={handleContinue}
                showErrors={showErrors}
                leadDisabled={!!currentUser}
                leadPassportDisabled={
                  !!serverRegNumber &&
                  formData.leadTraveler.passportNumber === serverRegNumber
                }
                leadGenderDisabled={!!currentUser && serverSex !== 0}
              />
            )}

            {currentStep === 2 && (
              <PaymentSection
                paymentUrl={paymentUrl}
                transaction={transaction}
                loading={creatingInvoice}
                payments={payments}
                selectedPaymentId={selectedPaymentId}
                onSelectPayment={handleSelectPayment}
                onPay={handlePay}
              />
            )}

            {currentStep === 3 && <CompleteSection />}
          </div>

          <div className="lg:col-span-1">
            <BookingSummarySidebar
              selectedItem={selectedItem}
              formData={formData}
              pricePerPerson={pricePerPerson}
              totalPrice={totalPrice}
              currentStep={currentStep}
              onNext={handleContinue}
              onSubmit={handleBooking}
              onBack={handleBack}
              nextLoading={nextLoading || creatingOrder}
              submitDisabled={currentStep === 2 && !isPaymentSuccess}
              groupTourItems={groupTourItems}
              paymentType={urlParams.paymentType}
              downPayment={urlParams.downPayment}
              remainingPayment={urlParams.remaining}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
