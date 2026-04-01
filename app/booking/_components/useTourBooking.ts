"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { gql, useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import { mutations as tmsMutations, queries as tmsQueries } from "../../../graphql/tms";
import { mutations as customerMutations } from "../../../graphql/customers";
import paymentMutations from "../../../graphql/payment/mutations";
import paymentQueries from "../../../graphql/payment/queries";
import authQueries from "../../../graphql/auth/queries";
import { validateBookingStepOne } from "./bookingSchemas";
import type { BookingFormData } from "./BookingForm";
import type { BmTour } from "../../../types/tours";
import generateRandomPassword from "../../../lib/password-generator";

const TAX_RATE = 0.04;
const PAYMENT_CHECK_INTERVAL = 3000;

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
      return;
    }
  },
};

export default function useTourBooking() {
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
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [paidByCheck, setPaidByCheck] = useState(false);
  const [serverRegNumber, setServerRegNumber] = useState<string | null>(null);
  const [serverSex, setServerSex] = useState<number | null>(null);
  const selectedPaymentIdRef = useRef<string | null>(null);

  const { data: userData } = useQuery(authQueries.currentUser);
  const currentUser = userData?.clientPortalCurrentUser || null;

  const { data: groupToursData } = useQuery(tmsQueries.TOUR_GROUP_DETAIL_QUERY, {
    variables: { status: "published", groupCode: urlParams.tourId || "" },
    skip: !urlParams.tourId,
  });
  const groupTourItems = useMemo(
    () => (groupToursData?.cpBmToursGroupDetail?.items ?? []) as BmTour[],
    [groupToursData],
  );
  const selectedItem = useMemo(
    () =>
      urlParams.startDate
        ? groupTourItems.find(
            (it) => it?.startDate && it.startDate.slice(0, 10) === urlParams.startDate!.slice(0, 10),
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

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      selectedDate: urlParams.startDate || prev.selectedDate,
      travelers: Number(urlParams.travelers || prev.travelers || 1),
    }));
  }, [urlParams.startDate, urlParams.travelers]);

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

  useEffect(() => {
    if (!urlParams.orderId) return;
    setOrderId(urlParams.orderId);
    setCurrentStep(2);
    const needsFreshPayment =
      urlParams.paymentType === "pending" ||
      (!!urlParams.remaining && Number(urlParams.remaining) > 0);
    if (!needsFreshPayment) {
      const savedInvoice = safeSessionStorage.get(`invoice:${urlParams.orderId}`);
      const savedPayUrl = safeSessionStorage.get(`payurl:${urlParams.orderId}`);
      if (savedInvoice) setInvoiceId(savedInvoice);
      if (savedPayUrl) setPaymentUrl(savedPayUrl);
    }
  }, [urlParams.orderId, urlParams.paymentType, urlParams.remaining]);

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
          passportNumber: prev.leadTraveler.passportNumber || customer.registrationNumber || "",
        },
      }));
    });
  }, [currentUser?.erxesCustomerId, fetchCustomersByIds]);

  const pricePerPerson = useMemo(
    () => Number(urlParams.pricePerPerson || 0) || groupTourItems[0]?.cost || 0,
    [urlParams.pricePerPerson, groupTourItems],
  );
  const { totalPrice, totalWithTax } = useMemo(() => {
    const basePrice =
      !!urlParams.remaining && Number(urlParams.remaining) > 0
        ? Number(urlParams.remaining)
        : Math.max(0, formData.travelers * pricePerPerson);
    return {
      totalPrice: basePrice,
      totalWithTax: Math.round(basePrice * (1 + TAX_RATE)),
    };
  }, [formData.travelers, pricePerPerson, urlParams.remaining]);

  const [orderAddMutation, { loading: creatingOrder }] = useMutation(tmsMutations.BM_ORDER_ADD);
  const [editOrder] = useMutation(tmsMutations.BM_ORDER_EDIT);
  const [addCpUser] = useMutation(customerMutations.addCpUser);
  const [addCustomer] = useMutation(customerMutations.addCustomer);
  const [editCustomer] = useMutation(customerMutations.editCustomer);
  const [changeState] = useMutation(customerMutations.customersChangeState);
  const [addTransaction] = useMutation(paymentMutations.transactionsAdd);
  const [checkInvoice] = useMutation(paymentMutations.checkInvoice);
  const { data: paymentsData } = useQuery(paymentQueries.payments);

  const [createInvoice, { loading: creatingInvoice }] = useMutation(
    paymentMutations.invoiceCreate,
    {
      onCompleted: async (data) => {
        const created = data?.cpInvoiceCreate;
        const newInvoiceId = created?._id;
        if (!newInvoiceId) return;
        setInvoiceId(newInvoiceId);
        if (orderId) safeSessionStorage.set(`invoice:${orderId}`, newInvoiceId);

        const paymentId = created?.transactions?.[0]?.paymentId || selectedPaymentIdRef.current;
        if (!paymentId) return;

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
          if (!newTx) return;
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
            if (orderId) safeSessionStorage.set(`payurl:${orderId}`, payUrl);
          }
        } catch {
          return;
        }
      },
    },
  );

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
      return list.find((c: any) => c.primaryEmail?.toLowerCase() === email.toLowerCase()) || null;
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
    const amount =
      urlParams.remaining && Number(urlParams.remaining) > 0
        ? Math.round(Number(urlParams.remaining) * (1 + TAX_RATE))
        : urlParams.paymentType === "prepaid" && urlParams.downPayment
          ? Math.floor(Number(urlParams.downPayment) * (1 + TAX_RATE))
          : urlParams.paymentType === "pending" && urlParams.amount
            ? Math.round(Number(urlParams.amount) * (1 + TAX_RATE))
            : totalWithTax;

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
    } catch {
      toast.error("Payment initialization failed", {
        description: "Unable to process payment. Please try again.",
      });
    }
  }, [createInvoice, currentUser, orderId, selectedPaymentId, totalWithTax, urlParams.amount, urlParams.downPayment, urlParams.paymentType, urlParams.remaining]);

  useEffect(() => {
    if (!invoiceId || currentStep !== 2) return;
    let active = true;
    const intervalId = setInterval(async () => {
      try {
        const { data } = await checkInvoice({ variables: { id: invoiceId } });
        const isPaid = String(data?.cpInvoicesCheck).toLowerCase() === "paid";
        if (!isPaid || !active || !orderId) return;
        setPaidByCheck(true);
        if (urlParams.remaining) {
          await editOrder({ variables: { id: orderId, order: { parent: "0", status: "paid" } } });
        } else if (urlParams.paymentType === "prepaid" && urlParams.downPayment) {
          const parent = String(Math.max(0, totalPrice - Number(urlParams.downPayment)));
          await editOrder({ variables: { id: orderId, order: { parent, isChild: true } } });
        } else {
          await editOrder({ variables: { id: orderId, order: { status: "paid" } } });
        }
        setCurrentStep(3);
      } catch {
        return;
      }
    }, PAYMENT_CHECK_INTERVAL);
    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [checkInvoice, currentStep, editOrder, invoiceId, orderId, totalPrice, urlParams.downPayment, urlParams.paymentType, urlParams.remaining]);

  const createAdditionalCustomers = useCallback(async (): Promise<string[]> => {
    const ids: string[] = [];
    for (const traveler of formData.additionalTravelers || []) {
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
        continue;
      }
    }
    return ids;
  }, [addCustomer, editCustomer, formData.additionalTravelers, handleFindCustomer]);

  const setupLeadCustomer = useCallback(async () => {
    let leadCustomerId = currentUser?.erxesCustomerId;
    const lead = formData.leadTraveler;
    if (!leadCustomerId && lead.email?.trim()) {
      const existing = await handleFindCustomer(lead.email);
      if (existing?._id) leadCustomerId = existing._id;
    }
    if (!leadCustomerId) {
      try {
        const { data } = await addCpUser({
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
        leadCustomerId = data?.clientPortalUserRegister?.erxesCustomerId;
      } catch {
        return undefined;
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
              ...(needsSex && { sex: lead.gender === "female" ? 2 : 1 }),
            },
          });
          await changeState({ variables: { _id: leadCustomerId, value: "customer" } });
          if (needsRegNumber) setServerRegNumber(passportNum!);
        } catch {
          return leadCustomerId;
        }
      }
    }
    return leadCustomerId;
  }, [addCpUser, changeState, currentUser, editCustomer, formData.leadTraveler, handleFindCustomer, serverRegNumber, serverSex]);

  const handleContinue = useCallback(async () => {
    if (currentStep !== 1) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    if (nextLoading || creatingOrder) return;
    const validation = validateBookingStepOne(formData);
    if (!validation.ok) {
      setShowErrors(true);
      toast.error(`Please fill: ${validation.errors.join(", ")}`);
      return;
    }
    setShowErrors(false);
    if (orderId) {
      setCurrentStep((prev) => prev + 1);
      return;
    }
    try {
      setNextLoading(true);
      const leadCustomerId = await setupLeadCustomer();
      if (!leadCustomerId) return;
      const additionalCustomerIds = await createAdditionalCustomers();
      const downPaymentBase = urlParams.downPayment ? Number(urlParams.downPayment) : 0;
      const isPrepaid = urlParams.paymentType === "prepaid" && urlParams.downPayment;
      const { data } = await orderAddMutation({
        variables: {
          order: {
            tourId: selectedItem?._id,
            branchId: selectedItem?.branchId,
            customerId: leadCustomerId,
            amount: isPrepaid ? downPaymentBase : totalPrice,
            numberOfPeople: formData.travelers,
            note: formData.additionalInfo,
            type: formData.paymentType,
            status: urlParams.paymentType === "prepaid" ? "prepaid" : "pending",
            parent: isPrepaid ? String(Math.max(0, totalPrice - downPaymentBase)) : undefined,
            isChild: isPrepaid ? false : undefined,
            additionalCustomers: additionalCustomerIds.length ? additionalCustomerIds : undefined,
          },
        },
      });
      const newOrderId = data?.cpBmsOrderAdd?._id;
      if (newOrderId) setOrderId(newOrderId);
      setCurrentStep((prev) => prev + 1);
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Please try again";
      toast.error("Failed to start booking", { description: message });
    } finally {
      setNextLoading(false);
    }
  }, [createAdditionalCustomers, creatingOrder, currentStep, formData, nextLoading, orderAddMutation, orderId, selectedItem, setupLeadCustomer, totalPrice, urlParams.downPayment, urlParams.paymentType]);

  return {
    creatingInvoice,
    creatingOrder,
    currentStep,
    currentUser,
    formData,
    groupTourItems,
    handleBack: () => setCurrentStep((prev) => prev - 1),
    handleBooking: () =>
      toast.success("Booking submitted!", {
        description: "Thank you for your booking.",
        duration: 6000,
      }),
    handleContinue,
    handlePay,
    handleSelectPayment,
    isPaymentSuccess: paidByCheck,
    nextLoading,
    payments: paymentsData?.cpPayments || [],
    paymentUrl,
    pricePerPerson,
    selectedItem,
    selectedPaymentId,
    serverRegNumber,
    serverSex,
    showErrors,
    totalPrice,
    transaction,
    updateFormData: (newData: Partial<BookingFormData>) =>
      setFormData((prev) => ({ ...prev, ...newData })),
    urlParams,
  };
}
