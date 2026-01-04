
export enum UserRole {
  FARMER = 'FARMER',
  WHOLESALER = 'WHOLESALER',
  CONSUMER = 'CONSUMER',
  ADMIN = 'ADMIN',
  DRIVER = 'DRIVER',
  PZ_REP = 'PZ_REP',
  GROCERY = 'GROCERY'
}

export type Industry = 
  | 'Cafe' 
  | 'Restaurant' 
  | 'Pub' 
  | 'Hotel' 
  | 'Sporting Club' 
  | 'RSL' 
  | 'Casino' 
  | 'Catering' 
  | 'Grocery Store' 
  | 'Airlines' 
  | 'School' 
  | 'Aged Care' 
  | 'Hospital';

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'ORDER' | 'LEAD' | 'SYSTEM' | 'APPLICATION' | 'PRICE_REQUEST' | 'ISSUE';
  timestamp: string;
  isRead: boolean;
  link?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  isProductLink?: boolean;
  productId?: string;
}

export interface BusinessProfile {
  isComplete: boolean;
  abn?: string;
  businessLocation?: string;
  companyName?: string;
  bankName?: string;
  bsb?: string;
  accountNumber?: string;
  directorName?: string;
  directorEmail?: string;
  directorPhone?: string;
  accountsName?: string;
  accountsEmail?: string;
  accountsPhone?: string;
  productsSell?: string;
  productsGrow?: string;
  productsBuy?: string;
  hasLogistics?: boolean;
  isPzAgent?: boolean;
}

export interface User {
  id: string;
  name: string;
  businessName: string;
  role: UserRole;
  email: string;
  phone?: string;
  category?: string;
  industry?: Industry;
  dashboardVersion?: 'v1' | 'v2';
  businessProfile?: BusinessProfile;
  activeSellingInterests?: string[];
  activeBuyingInterests?: string[];
  commissionRate?: number;
  smsNotificationsEnabled?: boolean;
  favoriteProductIds?: string[];
  // New Onboarding Logic
  isConfirmed?: boolean;
  hasSetCredentials?: boolean;
}

export type ProductUnit = 'KG' | 'Tray' | 'Bin' | 'Tonne' | 'loose' | 'Each' | 'Bag';

export interface Product {
  id: string;
  name: string;
  category: 'Vegetable' | 'Fruit';
  variety: string;
  imageUrl: string;
  defaultPricePerKg: number;
  unit?: ProductUnit;
  co2SavingsPerKg?: number;
  waterSavingsPerKg?: number;
  wasteDivertedPerKg?: number;
}

export interface ParsedOrderItem {
    productName: string;
    quantity: number;
    unit: ProductUnit;
    isAmbiguous?: boolean;
    suggestedProductIds?: string[];
    selectedProductId?: string;
}

export interface InventoryItem {
  id: string;
  lotNumber: string; 
  productId: string;
  ownerId: string;
  quantityKg: number;
  unit?: ProductUnit;
  expiryDate: string;
  harvestDate: string;
  uploadedAt: string; 
  status: 'Available' | 'Sold' | 'Expired' | 'Pending Approval' | 'Rejected' | 'Donated';
  originalFarmerName?: string;
  harvestLocation?: string;
  warehouseLocation?: string; 
  discountAfterDays?: number;
  discountPricePerKg?: number;
  batchImageUrl?: string;
  lastPriceVerifiedDate?: string;
  notes?: string;
  logisticsPrice?: number;
}

export interface OrderItem {
  productId: string;
  quantityKg: number;
  pricePerKg: number;
  isVerified?: boolean;
  hasIssue?: boolean;
  unit?: ProductUnit;
}

export interface OrderIssue {
  id: string;
  orderId: string;
  productId?: string;
  type: string;
  description: string;
  reportedAt: string;
  images?: string[];
  replacementRequired?: 'URGENT' | 'NEXT_DELIVERY' | 'NONE';
  // HQ Admin Tracking
  supplierStatus: 'PENDING' | 'ACCEPTED' | 'FIXED' | 'DISPUTED';
  supplierAction?: 'REFUND' | 'REPLACEMENT' | 'CREDIT';
  repStatus: 'UNSEEN' | 'ACTIONING' | 'RESOLVED';
  assignedRepId?: string;
}

export interface Order {
  id: string;
  buyerId: string;
  sellerId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Ready for Delivery' | 'Shipped' | 'Delivered' | 'Cancelled';
  date: string;
  confirmedAt?: string;
  preparedAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  paymentStatus?: 'Paid' | 'Unpaid' | 'Overdue';
  supplierPayoutStatus?: 'Pending' | 'Remitted';
  customerReceiptUrl?: string;
  supplierReceiptUrl?: string;
  paymentMethod?: 'pay_now' | 'invoice' | 'amex';
  priority?: 'STANDARD' | 'HIGH' | 'URGENT';
  packedAt?: string;
  logistics?: {
    driverName?: string;
    deliveryTime?: string;
    deliveryLocation?: string;
    deliveryDate?: string;
    vehicleDetails?: string;
    deliveryPhoto?: string;
    instructions?: string;
  };
  issue?: OrderIssue;
  itemIssues?: OrderIssue[];
  isFullyVerified?: boolean;
  source?: 'Marketplace' | 'Direct';
}

export interface Customer {
  id: string;
  businessName: string;
  contactName: string;
  email?: string;
  phone?: string;
  category: string;
  industry?: Industry;
  location?: string;
  connectedSupplierId?: string;
  connectedSupplierName?: string;
  connectedSupplierRole?: string;
  pzMarkup?: number;
  pricingStatus?: string;
  assignedPzRepId?: string;
  assignedPzRepName?: string;
  commonProducts?: string;
  connectionStatus?: 'Active' | 'Pending Connection' | 'Pricing Pending' | 'Lead';
  onboardingData?: {
    deliveryAddress?: string;
  };
  issueReportingWindowMinutes?: number;
  // Financial Terms
  pzPaymentTermsDays?: number; // Days for customer to pay PZ
  supplierPaymentTermsDays?: number; // Days for PZ to pay Supplier
}

export interface SupplierPriceRequestItem {
  productId: string;
  productName: string;
  qty: number;
  invoicePrice: number;
  targetPrice: number;
  offeredPrice?: number;
  isMatchingTarget?: boolean;
}

export interface SupplierPriceRequest {
  id: string;
  supplierId: string;
  status: 'PENDING' | 'SUBMITTED' | 'WON' | 'LOST';
  createdAt: string;
  customerContext: string;
  customerLocation: string;
  items: SupplierPriceRequestItem[];
}

export interface PricingRule {
  id: string;
  ownerId: string;
  productId: string;
  category: string;
  strategy: 'FIXED' | 'PERCENTAGE_DISCOUNT';
  value: number;
  isActive: boolean;
}

export interface Driver {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleRegistration: string;
  vehicleType: 'Van' | 'Truck' | 'Refrigerated Truck';
  status: 'Active' | 'Inactive';
}

export interface Packer {
  id: string;
  wholesalerId: string;
  name: string;
  email: string;
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface LogisticsDetails {
  method: 'PICKUP' | 'LOGISTICS';
  deliveryDate?: string;
  deliveryTime?: string;
  deliveryLocation?: string;
}

export interface OnboardingFormTemplate {
  id: string;
  role: UserRole;
  sections: any[];
}

export interface RegistrationRequest {
  id: string;
  businessName: string;
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  requestedRole: UserRole;
  status: 'Pending' | 'Approved' | 'Rejected';
  submittedDate: string;
  temporaryCode?: string;
  // Fix: Added missing consumerData property used in various components
  consumerData?: {
    location?: string;
    invoiceFile?: string;
    mobile?: string;
  };
}

export interface Lead {
  id: string;
  businessName: string;
  contactName: string;
  email?: string;
  phone?: string;
  location: string;
  source: 'AI_SCAN' | 'MANUAL' | 'REFERRAL';
  status: 'NEW' | 'CONTACTED' | 'QUOTED' | 'CONVERTED';
}
