export type HotelRoom = {
  _id: string;
  name?: string | null;
  unitPrice?: number | null;
  description?: string | null;
  category?: { name?: string | null } | null;
  attachment?: { url?: string | null } | null;
  uom?: string | null;
};

export type ParsedPipelineConfig = {
  pipelineId?: string;
};

export type HotelGuestFormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  additionalInfo: string;
  isPrepayment: boolean;
};

export type HotelSummary = {
  title: string;
  checkIn: string | null;
  checkOut: string | null;
  nights: number;
  rooms: Array<{
    _id: string;
    name: string;
    unitPrice?: number | null;
    quantity?: number | null;
  }>;
  adultCount: number;
  childCount: number;
  totalPrice: number;
  payNowAmount?: number;
  isPrepayment?: boolean;
};
