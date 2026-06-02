export type InquiryItem = {
  productId: string;
  productSlug: string;
  productName: string;
  productItemNo: string;
  productImage?: string;
  quantity: number;
  addedAt: string;
};

export type InquirySubmission = {
  companyName: string;
  contactName: string;
  email: string;
  phone?: string;
  country: string;
  message?: string;
  items: InquiryItem[];
};
