"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { toast } from "sonner";
import authQueries from "../../../graphql/auth/queries";
import customerMutations from "../../../graphql/customers/mutations";
import customerQueries from "../../../graphql/customers/queries";
import paymentMutations from "../../../graphql/payment/mutations";
import paymentQueries from "../../../graphql/payment/queries";
import pmsConfigQueries from "../../../graphql/pms/config/queries";
import pmsRoomQueries from "../../../graphql/pms/rooms/queries";
import pmsSalesMutations from "../../../graphql/pms/sales/mutations";
import pmsSalesQueries from "../../../graphql/pms/sales/queries";
import { validateHotelBookingStepOne } from "../_components/bookingSchemas";
import type { HotelGuestFormData, HotelSummary, HotelRoom } from "./types";
import {
  diffNights,
  parsePipelineConfig,
  PAYMENT_CHECK_INTERVAL,
  PREPAYMENT_RATIO,
  toIsoDate,
} from "./utils";

export default function useHotelBooking() {
  const params = useSearchParams();
  const startDateRaw = params.get("startDate") || params.get("sd");
  const endDateRaw = params.get("endDate") || params.get("ed");
  const adults = Number(params.get("adults") || params.get("adult") || 1);
  const children = Number(params.get("children") || params.get("child") || 0);
  const requestedRooms = Number(params.get("rooms") || params.get("roomCount") || 1);

  const startDate = toIsoDate(startDateRaw);
  const endDate = toIsoDate(endDateRaw);
  const nights = useMemo(() => diffNights(startDate, endDate), [startDate, endDate]);

  const [currentStep, setCurrentStep] = useState(1);
  const [showErrors, setShowErrors] = useState(false);
  const [selectedRoomIds, setSelectedRoomIds] = useState<string[]>([]);
  const [dealId, setDealId] = useState<string | null>(null);
  const [invoiceId, setInvoiceId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [transaction, setTransaction] = useState<any | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  const [nextLoading, setNextLoading] = useState(false);
  const [paidByCheck, setPaidByCheck] = useState(false);
  const [hotelData, setHotelData] = useState<HotelGuestFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    additionalInfo: "",
    isPrepayment: true,
  });
  const selectedPaymentIdRef = useRef<string | null>(null);

  const { data: userData } = useQuery(authQueries.currentUser);
  const currentUser = userData?.clientPortalCurrentUser || null;

  const { data: branchData, loading: branchLoading } = useQuery(
    pmsConfigQueries.PmsBranchList,
    { variables: { page: 1, perPage: 1 } },
  );
  const branch = branchData?.pmsBranchList?.[0] || null;
  const pipelineId =
    parsePipelineConfig(branch?.pipelineConfig)?.pipelineId || null;
  const roomCategoryId = branch?.roomCategories?.[0] || null;

  const { data: allRoomsData, loading: roomsLoading } = useQuery(
    pmsRoomQueries.rooms,
    {
      variables: {
        pipelineId,
        categoryId: roomCategoryId,
        perPage: 1000,
        page: 1,
      },
      skip: !pipelineId || !roomCategoryId,
    },
  );
  const allRooms = useMemo(
    () => ((allRoomsData?.products || []) as HotelRoom[]),
    [allRoomsData?.products],
  );

  const { data: availableRoomsData, loading: checkRoomsLoading, error: roomsError } =
    useQuery(pmsRoomQueries.checkRooms, {
      variables: {
        pipelineId,
        startDate,
        endDate,
        ids: allRooms.map((room) => room._id),
      },
      skip: !pipelineId || !startDate || !endDate || allRooms.length === 0,
      notifyOnNetworkStatusChange: true,
    });
  const availableRooms = useMemo(
    () => ((availableRoomsData?.pmsCheckRooms || []) as HotelRoom[]),
    [availableRoomsData?.pmsCheckRooms],
  );

  const { data: stagesData } = useQuery(pmsSalesQueries.stages, {
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const { data: labelsData } = useQuery(pmsSalesQueries.salesPipelineLabels, {
    variables: { pipelineId },
    skip: !pipelineId,
  });
  const { data: tagsData } = useQuery(pmsSalesQueries.tags, {
    variables: { type: "sales:deal" },
    skip: !pipelineId,
  });
  const { data: paymentsData } = useQuery(paymentQueries.payments);
  const { data: dealData, refetch: refetchDeal } = useQuery(
    pmsSalesQueries.dealDetail,
    {
      variables: { id: dealId },
      skip: !dealId,
      fetchPolicy: "no-cache",
      notifyOnNetworkStatusChange: true,
    },
  );
  const { data: invoiceLookupData } = useQuery(paymentQueries.invoices, {
    variables: { contentType: "sales:deals", contentTypeId: dealId },
    skip: !dealId,
    notifyOnNetworkStatusChange: true,
  });

  const dealDetail = dealData?.dealDetail;
  const existingInvoice = invoiceLookupData?.cpInvoices?.[0];

  const [findCustomerByEmail] = useLazyQuery(customerQueries.findCustomerByEmail, {
    fetchPolicy: "no-cache",
  });
  const [addCpUser] = useMutation(customerMutations.addCpUser);
  const [addLabel] = useMutation(pmsSalesMutations.addLabel);
  const [addTag] = useMutation(pmsSalesMutations.addTag);
  const [dealsAdd] = useMutation(pmsSalesMutations.dealsAdd);
  const [dealsEdit] = useMutation(pmsSalesMutations.dealsEdit);
  const [createInvoice, { loading: creatingInvoice }] = useMutation(
    paymentMutations.createInvoice,
  );
  const [addTransaction] = useMutation(paymentMutations.addTransaction);
  const [checkInvoice] = useMutation(paymentMutations.checkInvoice);

  const selectedRooms = useMemo(
    () => availableRooms.filter((room) => selectedRoomIds.includes(room._id)),
    [availableRooms, selectedRoomIds],
  );
  const totalPrice = useMemo(
    () =>
      selectedRooms.reduce(
        (sum, room) => sum + Number(room.unitPrice || 0) * nights,
        0,
      ),
    [selectedRooms, nights],
  );
  const payNowAmount = hotelData.isPrepayment
    ? Math.round(totalPrice * PREPAYMENT_RATIO)
    : totalPrice;

  const summary = useMemo<HotelSummary>(
    () => ({
      title: selectedRooms.length
        ? selectedRooms.map((room) => room.name).join(", ")
        : "Room Booking",
      checkIn: startDate,
      checkOut: endDate,
      nights,
      rooms: selectedRooms.map((room) => ({
        _id: room._id,
        name: room.name || "Room",
        unitPrice: Number(room.unitPrice || 0) * nights,
        quantity: nights,
      })),
      adultCount: adults,
      childCount: children,
      totalPrice,
      payNowAmount,
      isPrepayment: hotelData.isPrepayment,
    }),
    [adults, children, endDate, hotelData.isPrepayment, nights, payNowAmount, selectedRooms, startDate, totalPrice],
  );

  useEffect(() => {
    if (!currentUser) return;
    setHotelData((prev) => ({
      ...prev,
      firstName: currentUser.firstName || prev.firstName,
      lastName: currentUser.lastName || prev.lastName,
      email: currentUser.email || prev.email,
      phone: currentUser.phone || prev.phone,
    }));
  }, [currentUser]);

  useEffect(() => {
    if (existingInvoice?._id) setInvoiceId(existingInvoice._id);
  }, [existingInvoice?._id]);

  const handleFindCustomer = useCallback(
    async (email: string) => {
      const { data } = await findCustomerByEmail({ variables: { email } });
      return data?.cpCustomers?.list?.[0] || null;
    },
    [findCustomerByEmail],
  );

  const assignGuests = useCallback(() => {
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

    return assignments.map((assignment) => {
      const next = {
        ...assignment,
        adults: Math.min(assignment.adults, remainingAdults),
        children: Math.min(assignment.children, remainingChildren),
      };
      remainingAdults -= next.adults;
      remainingChildren -= next.children;
      return next;
    });
  }, [adults, children, selectedRooms]);

  return {
    adults,
    availableRooms,
    branchLoading,
    checkRoomsLoading,
    children,
    creatingInvoice,
    currentStep,
    currentUser,
    dealDetail,
    dealId,
    endDate,
    endDateRaw,
    handleFindCustomer,
    hotelData,
    invoiceId,
    nextLoading,
    nights,
    paidByCheck,
    payNowAmount,
    payments: paymentsData?.cpPayments || [],
    pipelineId,
    refetchDeal,
    requestedRooms,
    roomsError,
    roomsLoading,
    selectedPaymentId,
    selectedPaymentIdRef,
    selectedRoomIds,
    selectedRooms,
    showErrors,
    stages: stagesData?.salesStages || [],
    startDate,
    startDateRaw,
    summary,
    tags: tagsData?.tags || [],
    totalPrice,
    toggleRoom: (roomId: string) =>
      setSelectedRoomIds((prev) => {
        if (prev.includes(roomId)) return prev.filter((id) => id !== roomId);
        if (prev.length >= requestedRooms) {
          toast.error(`You can select up to ${requestedRooms} room(s).`);
          return prev;
        }
        return [...prev, roomId];
      }),
    setCurrentStep,
    setDealId,
    setHotelData,
    setInvoiceId,
    setNextLoading,
    setPaidByCheck,
    setPaymentUrl,
    setSelectedPaymentId,
    setShowErrors,
    setTransaction,
    labels: labelsData?.salesPipelineLabels || [],
    mutations: {
      addCpUser,
      addLabel,
      addTag,
      addTransaction,
      checkInvoice,
      createInvoice,
      dealsAdd,
      dealsEdit,
    },
    transaction,
    paymentUrl,
    helpers: {
      assignGuests,
      handleFindCustomer,
    },
  };
}
