"use client";

import { useCallback, useEffect } from "react";
import { toast } from "sonner";
import { validateHotelBookingStepOne } from "../_components/bookingSchemas";
import type { HotelRoom } from "./types";
import { PAYMENT_CHECK_INTERVAL } from "./utils";

type Params = {
  adults: number;
  children: number;
  currentStep: number;
  currentUser: any;
  dealDetail: any;
  dealId: string | null;
  endDate: string | null;
  handleFindCustomer: (email: string) => Promise<any>;
  hotelData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    additionalInfo: string;
    isPrepayment: boolean;
  };
  invoiceId: string | null;
  labels: Array<{ _id: string; name?: string }>;
  nextLoading: boolean;
  nights: number;
  payNowAmount: number;
  pipelineId: string | null;
  refetchDeal: () => Promise<any>;
  requestedRooms: number;
  selectedPaymentId: string | null;
  selectedPaymentIdRef: React.MutableRefObject<string | null>;
  selectedRoomIds: string[];
  selectedRooms: HotelRoom[];
  setCurrentStep: (value: number) => void;
  setDealId: (value: string | null) => void;
  setInvoiceId: (value: string | null) => void;
  setNextLoading: (value: boolean) => void;
  setPaidByCheck: (value: boolean) => void;
  setPaymentUrl: (value: string | null) => void;
  setSelectedPaymentId: (value: string | null) => void;
  setShowErrors: (value: boolean) => void;
  setTransaction: (value: any) => void;
  stages: Array<{ _id: string; code?: string }>;
  startDate: string | null;
  tags: Array<{ _id: string; name?: string }>;
  mutations: {
    addCpUser: any;
    addLabel: any;
    addTag: any;
    addTransaction: any;
    checkInvoice: any;
    createInvoice: any;
    dealsAdd: any;
    dealsEdit: any;
  };
  paidByCheck: boolean;
};

export default function useHotelBookingActions(params: Params) {
  const {
    adults,
    children,
    currentStep,
    currentUser,
    dealDetail,
    dealId,
    endDate,
    handleFindCustomer,
    hotelData,
    invoiceId,
    labels,
    nextLoading,
    nights,
    payNowAmount,
    pipelineId,
    refetchDeal,
    requestedRooms,
    selectedPaymentId,
    selectedPaymentIdRef,
    selectedRoomIds,
    selectedRooms,
    setCurrentStep,
    setDealId,
    setInvoiceId,
    setNextLoading,
    setPaidByCheck,
    setPaymentUrl,
    setSelectedPaymentId,
    setShowErrors,
    setTransaction,
    stages,
    startDate,
    tags,
    mutations,
    paidByCheck,
  } = params;

  const handleSelectPayment = useCallback(
    (id: string) => {
      setSelectedPaymentId(id);
      selectedPaymentIdRef.current = id;
    },
    [selectedPaymentIdRef, setSelectedPaymentId],
  );

  const handleContinue = useCallback(async () => {
    if (currentStep !== 1 || nextLoading) return;

    const validation = validateHotelBookingStepOne({
      firstName: hotelData.firstName,
      lastName: hotelData.lastName,
      email: hotelData.email,
      phone: hotelData.phone,
      selectedRoomIds,
      requestedRoomCount: requestedRooms,
    });

    if (!validation.ok) {
      setShowErrors(true);
      toast.error(validation.errors.join(", "));
      return;
    }

    if (!pipelineId || !startDate || !endDate) {
      toast.error("Missing booking dates or pipeline configuration.");
      return;
    }

    try {
      setShowErrors(false);
      setNextLoading(true);

      let labelId =
        labels.find((label) => String(label.name || "").toLowerCase() === "web")
          ?._id || null;
      if (!labelId) {
        const { data } = await mutations.addLabel({
          variables: { name: "Web", colorCode: "#eb144c", pipelineId },
        });
        labelId = data?.salesPipelineLabelsAdd?._id || null;
      }

      const targetTagName = hotelData.isPrepayment ? "Pre payment" : "Full payment";
      let tagId = tags.find((tag) => tag.name === targetTagName)?._id || null;
      if (!tagId) {
        const { data } = await mutations.addTag({
          variables: {
            name: targetTagName,
            type: "sales:deal",
            colorCode: hotelData.isPrepayment ? "#63D2D6" : "#4BBF6B",
          },
        });
        tagId = data?.tagsAdd?._id || null;
      }

      const unconfirmedStageId =
        stages.find((stage) => stage.code === "unconfirmed")?._id || "";

      let customerId = currentUser?.erxesCustomerId || null;
      if (!customerId) {
        const existingCustomer = await handleFindCustomer(hotelData.email);
        customerId = existingCustomer?._id || null;
      }
      if (!customerId) {
        const { data } = await mutations.addCpUser({
          variables: {
            clientPortalId: process.env.ERXES_CP_ID,
            type: "customer",
            disableVerificationMail: false,
            password: Math.random().toString(36).slice(-10),
            firstName: hotelData.firstName,
            lastName: hotelData.lastName,
            phone: hotelData.phone,
            email: hotelData.email,
          },
        });
        customerId = data?.clientPortalUserRegister?.erxesCustomerId || null;
      }
      if (!customerId) {
        toast.error("Unable to resolve customer.");
        return;
      }

      const assignments = selectedRooms.map((room, index) => {
        const remainingRooms = selectedRooms.length - index;
        return {
          roomId: room._id,
          adults:
            remainingRooms > 0
              ? Math.ceil(Math.max(adults, 0) / remainingRooms)
              : 0,
          children:
            remainingRooms > 0
              ? Math.ceil(Math.max(children, 0) / remainingRooms)
              : 0,
        };
      });

      let remainingAdults = Math.max(adults, 0);
      let remainingChildren = Math.max(children, 0);
      const finalAssignments = assignments.map((assignment) => {
        const next = {
          ...assignment,
          adults: Math.min(assignment.adults, remainingAdults),
          children: Math.min(assignment.children, remainingChildren),
        };
        remainingAdults -= next.adults;
        remainingChildren -= next.children;
        return next;
      });

      const productsData = selectedRooms.map((room) => {
        const guestAssignment = finalAssignments.find((item) => item.roomId === room._id);
        return {
          productId: room._id,
          name: room.name,
          startDate,
          endDate,
          unitPrice: Number(room.unitPrice || 0),
          quantity: nights,
          amount: Number(room.unitPrice || 0) * nights,
          uom: room.uom || "day",
          tickUsed: true,
          information: {
            adults: guestAssignment?.adults || 0,
            children: guestAssignment?.children || 0,
          },
        };
      });

      const description = [
        `Guest: ${hotelData.firstName} ${hotelData.lastName}`,
        `Phone: ${hotelData.phone}`,
        `Email: ${hotelData.email}`,
        `${nights} night(s)`,
        `Payment type: ${hotelData.isPrepayment ? "Pre payment" : "Full payment"}`,
        hotelData.additionalInfo.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const variables: Record<string, unknown> = {
        name: `${hotelData.firstName} ${hotelData.lastName}`,
        productsData,
        customerIds: [customerId],
        stageId: unconfirmedStageId,
        startDate,
        closeDate: endDate,
        description,
        labelIds: labelId ? [labelId] : [],
        tagIds: tagId ? [tagId] : [],
      };

      if (currentUser?.erxesCompanyId) {
        variables.companyIds = [currentUser.erxesCompanyId];
      }

      const { data } = await mutations.dealsAdd({ variables });
      const newDealId = data?.dealsAdd?._id || null;
      if (!newDealId) {
        toast.error("Unable to create booking.");
        return;
      }

      setDealId(newDealId);
      setCurrentStep(2);
      toast.success("Booking created.");
    } catch (error) {
      const message =
        error && typeof error === "object" && "message" in error
          ? String((error as { message?: unknown }).message)
          : "Please try again.";
      toast.error(message);
    } finally {
      setNextLoading(false);
    }
  }, [adults, children, currentStep, currentUser, endDate, handleFindCustomer, hotelData, labels, mutations, nextLoading, nights, pipelineId, requestedRooms, selectedRoomIds, selectedRooms, setCurrentStep, setDealId, setNextLoading, setShowErrors, stages, startDate, tags]);

  const handlePay = useCallback(async () => {
    if (!dealId || !selectedPaymentId) {
      toast.error("Please select a payment method.");
      return;
    }

    try {
      const { data } = await mutations.createInvoice({
        variables: {
          input: {
            amount: payNowAmount,
            phone: hotelData.phone || currentUser?.phone || undefined,
            email: hotelData.email || currentUser?.email || undefined,
            description: `Booking #${dealDetail?.number || dealId}`,
            customerId:
              currentUser?.erxesCustomerId ||
              dealDetail?.customers?.[0]?._id ||
              undefined,
            customerType: "customer",
            contentType: "sales:deals",
            contentTypeId: dealId,
            paymentIds: [selectedPaymentId],
          },
        },
      });

      const created = data?.cpInvoiceCreate;
      const newInvoiceId = created?._id;
      if (!newInvoiceId) return;

      setInvoiceId(newInvoiceId);

      const { data: txData } = await mutations.addTransaction({
        variables: {
          input: {
            invoiceId: newInvoiceId,
            paymentId: selectedPaymentIdRef.current || selectedPaymentId,
            amount: Number(created.amount || payNowAmount),
          },
        },
      });

      const newTx = txData?.cpPaymentTransactionsAdd;
      if (!newTx) return;

      setTransaction(newTx);
      const res = newTx.response;
      setPaymentUrl(
        res?.invoice ||
          res?.redirectUrl ||
          res?.redirect_url ||
          res?.paymentUrl ||
          res?.payment_url ||
          res?.url ||
          newTx.details?.invoice ||
          newTx.details?.redirectUrl ||
          newTx.details?.url ||
          null,
      );
    } catch {
      toast.error("Payment initialization failed.");
    }
  }, [currentUser, dealDetail?.customers, dealDetail?.number, dealId, hotelData.email, hotelData.phone, mutations, payNowAmount, selectedPaymentId, selectedPaymentIdRef, setInvoiceId, setPaymentUrl, setTransaction]);

  useEffect(() => {
    if (!invoiceId || currentStep !== 2 || paidByCheck) return;

    let active = true;
    const intervalId = setInterval(async () => {
      try {
        const { data } = await mutations.checkInvoice({ variables: { id: invoiceId } });
        const isPaid = String(data?.cpInvoicesCheck).toLowerCase() === "paid";
        if (!isPaid || !active) return;

        setPaidByCheck(true);
        const futureStageId = stages.find((stage) => stage.code === "future")?._id || "";
        if (dealId && futureStageId) {
          await mutations.dealsEdit({ variables: { id: dealId, stageId: futureStageId } });
        }
        await refetchDeal();
        setCurrentStep(3);
        toast.success("Payment success!");
      } catch {
        return;
      }
    }, PAYMENT_CHECK_INTERVAL);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [currentStep, dealId, invoiceId, mutations, paidByCheck, refetchDeal, setCurrentStep, setPaidByCheck, stages]);

  useEffect(() => {
    if (!dealDetail?.paymentsData || currentStep !== 2 || paidByCheck) return;

    const futureStageId = stages.find((stage) => stage.code === "future")?._id || "";
    if (dealId && futureStageId) {
      mutations.dealsEdit({ variables: { id: dealId, stageId: futureStageId } }).catch(
        () => undefined,
      );
    }

    setPaidByCheck(true);
    setCurrentStep(3);
  }, [currentStep, dealDetail?.paymentsData, dealId, mutations, paidByCheck, setCurrentStep, setPaidByCheck, stages]);

  return { handleContinue, handlePay, handleSelectPayment };
}
