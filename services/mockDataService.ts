
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  SupplierPriceRequest, PricingRule,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem,
  Driver, Packer, RegistrationRequest, OnboardingFormTemplate,
  BusinessProfile, OrderIssue, Industry
} from '../types';
import { triggerNativeSms } from './smsService';

export interface RoleIncentive {
  amount: number;
  weeks: number;
  activationDays: number;
  minSpendPerWeek: number;
  referrerBonusEnabled: boolean;
  referrerBonusAmount: number;
}

export interface DeliAppItem {
    id: string;
    productName: string;
    description: string;
    price: number;
    quantity: number;
    vendorName: string;
    imageUrl: string;
    rating: number;
    distance: string;
    categories: string[];
    isLive: boolean;
}

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com' },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Eggplants'], activeBuyingInterests: ['Potatoes', 'Apples'], businessProfile: { isComplete: true } as any },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Potatoes', 'Apples'], activeBuyingInterests: [], businessProfile: { isComplete: true } as any },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com', phone: '0412 345 678', industry: 'Cafe', smsNotificationsEnabled: true },
  { id: 'u5', name: 'Gary Grocer', businessName: 'Local Corner Grocers', role: UserRole.GROCERY, email: 'gary@grocer.com', phone: '0411 222 333', industry: 'Grocery Store', smsNotificationsEnabled: true },
  { id: 'rep1', name: 'Alex Johnson', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0 },
  { id: 'rep2', name: 'Sam Taylor', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep2@pz.com', commissionRate: 5.0 },
];

export const INDUSTRIES: Industry[] = [
  'Cafe', 'Restaurant', 'Pub', 'Hotel', 'Sporting Club', 'RSL', 'Casino', 
  'Catering', 'Grocery Store', 'Airlines', 'School', 'Aged Care', 'Hospital'
];

class MockDataService {
  private users: User[] = [...USERS];
  private industryIncentives: Record<Industry, number> = {
    'Cafe': 10, 'Restaurant': 12, 'Pub': 8, 'Hotel': 15, 'Sporting Club': 5,
    'RSL': 7, 'Casino': 20, 'Catering': 10, 'Grocery Store': 10, 'Airlines': 25,
    'School': 5, 'Aged Care': 8, 'Hospital': 8
  };

  private roleIncentives: Record<string, RoleIncentive> = {
    [UserRole.FARMER]: { amount: 500, weeks: 4, activationDays: 7, minSpendPerWeek: 100, referrerBonusEnabled: true, referrerBonusAmount: 250 },
    [UserRole.WHOLESALER]: { amount: 1000, weeks: 8, activationDays: 14, minSpendPerWeek: 500, referrerBonusEnabled: true, referrerBonusAmount: 500 },
    [UserRole.CONSUMER]: { amount: 100, weeks: 2, activationDays: 3, minSpendPerWeek: 50, referrerBonusEnabled: true, referrerBonusAmount: 25 },
    [UserRole.GROCERY]: { amount: 250, weeks: 4, activationDays: 7, minSpendPerWeek: 150, referrerBonusEnabled: true, referrerBonusAmount: 100 },
  };

  private products: Product[] = [
    { id: 'p1', name: 'Organic Roma Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
    { id: 'p1-truss', name: 'Truss Vine Tomatoes', category: 'Vegetable', variety: 'Vine-Ripened', imageUrl: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 6.20, co2SavingsPerKg: 1.0 },
    { id: 'p2', name: 'Fresh Lettuce', category: 'Vegetable', variety: 'Cos', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 1.20, co2SavingsPerKg: 0.8 },
    { id: 'p3', name: 'Apples', category: 'Fruit', variety: 'Pink Lady', imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.80, co2SavingsPerKg: 1.5 },
    { id: 'p4', name: 'Eggplants', category: 'Vegetable', variety: 'Black Beauty', imageUrl: 'https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.50, co2SavingsPerKg: 1.1 },
    { id: 'p5', name: 'Dutch Cream Potatoes', category: 'Vegetable', variety: 'Grade A', imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 2.10, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-cav', name: 'Cavendish Bananas', category: 'Fruit', variety: 'Cavendish', imageUrl: 'https://images.unsplash.com/photo-1571771894821-ad9902537317?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 3.50, co2SavingsPerKg: 0.9 },
    { id: 'p-banana-lady', name: 'Lady Finger Bananas', category: 'Fruit', variety: 'Lady Finger', imageUrl: 'https://images.unsplash.com/photo-1603833665858-e61d17a86224?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 5.80, co2SavingsPerKg: 0.7 },
  ];

  private inventory: InventoryItem[] = [
    { id: 'i1', lotNumber: 'PZ-LOT-1001', productId: 'p1', ownerId: 'u3', quantityKg: 500, expiryDate: new Date(Date.now() + 86400000 * 5).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone A-4', discountAfterDays: 3, discountPricePerKg: 3.00, logisticsPrice: 15.00 },
    { id: 'i2', lotNumber: 'PZ-LOT-1002', productId: 'p2', ownerId: 'u2', quantityKg: 1000, expiryDate: new Date(Date.now() + 86400000 * 14).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date(Date.now() - 86400000).toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland', warehouseLocation: 'Cold Room 1', logisticsPrice: 20.00 },
    { id: 'i3', lotNumber: 'PZ-LOT-1003', productId: 'p4', ownerId: 'u2', quantityKg: 200, expiryDate: new Date(Date.now() + 86400000 * 3).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Green Valley Farms', harvestLocation: 'Yarra Valley', warehouseLocation: 'Zone C-2', logisticsPrice: 12.50 },
    { id: 'i4', lotNumber: 'PZ-LOT-1004', productId: 'p5', ownerId: 'u3', quantityKg: 800, expiryDate: new Date(Date.now() + 86400000 * 10).toISOString(), harvestDate: new Date().toISOString(), uploadedAt: new Date().toISOString(), status: 'Available', originalFarmerName: 'Bob\'s Spuds', harvestLocation: 'Gippsland', warehouseLocation: 'Zone D-1', logisticsPrice: 18.00 },
  ];

  private orders: Order[] = [];
  private issues: OrderIssue[] = [];
  private notifications: AppNotification[] = [];
  private customers: Customer[] = [
    { id: 'u4', businessName: 'The Morning Cafe', contactName: 'Alice Consumer', category: 'Restaurant', industry: 'Cafe', commonProducts: 'Bananas, Potatoes, Lettuce', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'alice@cafe.com', phone: '0412 345 678', pzMarkup: 15, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 },
    { id: 'u5', businessName: 'Local Corner Grocers', contactName: 'Gary Grocer', category: 'Grocery', industry: 'Grocery Store', commonProducts: 'Everything', location: 'Fitzroy', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'gary@grocer.com', phone: '0411 222 333', pzMarkup: 12, assignedPzRepId: 'rep2', assignedPzRepName: 'Sam Taylor', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 },
    { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', category: 'Retail', industry: 'Grocery Store', commonProducts: 'Tomatoes, Lettuce, Apples', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'sarah@freshmarket.com', phone: '0400 999 888', pzMarkup: 15, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 },
    { id: 'c2', businessName: 'Healthy Eats', contactName: 'Chef Mario', category: 'Restaurant', industry: 'Restaurant', commonProducts: 'Tomatoes, Eggplant, Broccoli', location: 'South Yarra', connectedSupplierId: 'u3', connectedSupplierName: 'Green Valley Farms', connectionStatus: 'Active', email: 'mario@healthy.com', phone: '0455 111 222', pzMarkup: 18, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 },
    { id: 'c3', businessName: 'Richmond Corner Pub', contactName: 'Dave Smith', category: 'Pub/Bar', industry: 'Pub', location: 'Richmond', connectedSupplierId: 'u2', connectionStatus: 'Pricing Pending', email: 'dave@richmondpub.com', phone: '0488 777 666', pzMarkup: 15, assignedPzRepId: 'rep2', assignedPzRepName: 'Sam Taylor', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 },
  ];

  private drivers: Driver[] = [];
  private packers: Packer[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private chatMessages: ChatMessage[] = [];

  constructor() {
      this.generateDemoOrders();
      this.generateDemoIssues();
  }

  private generateDemoOrders() {
      const now = new Date();
      this.orders.push({
          id: `o-today-1`, buyerId: 'u4', sellerId: 'u2', items: [{ productId: 'p1', quantityKg: 50, pricePerKg: 4.50 }], totalAmount: 225.00, status: 'Confirmed', date: now.toISOString(), paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', source: 'Direct'
      });
      this.orders.push({
          id: `o-today-2`, buyerId: 'u5', sellerId: 'u3', items: [{ productId: 'p5', quantityKg: 100, pricePerKg: 2.10 }], totalAmount: 210.00, status: 'Shipped', date: now.toISOString(), paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', logistics: { driverName: 'Dave Driver', deliveryTime: '2:30 PM' }, source: 'Marketplace'
      });
      const oneHourAgo = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      this.orders.push({
          id: `o-delivered-1`, buyerId: 'c1', sellerId: 'u2', items: [{ productId: 'p4', quantityKg: 20, pricePerKg: 5.50 }], totalAmount: 110.00, status: 'Delivered', date: oneHourAgo, deliveredAt: oneHourAgo, paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', source: 'Direct'
      });
      const eightyMinsAgo = new Date(Date.now() - 80 * 60 * 1000).toISOString();
      this.orders.push({
          id: `o-delivered-2`, buyerId: 'c2', sellerId: 'u3', items: [{ productId: 'p1', quantityKg: 40, pricePerKg: 4.50 }], totalAmount: 180.00, status: 'Delivered', date: eightyMinsAgo, deliveredAt: eightyMinsAgo, paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', source: 'Marketplace'
      });
  }

  private generateDemoIssues() {
      this.issues.push({
          id: 'iss-1',
          orderId: 'o-delivered-1',
          productId: 'p4',
          type: 'Quality/Bruising',
          description: '5kg of eggplants arrived with heavy bruising, unusable for service.',
          reportedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          supplierStatus: 'PENDING',
          repStatus: 'UNSEEN',
          assignedRepId: 'rep1'
      });
      this.issues.push({
          id: 'iss-2',
          orderId: 'o-delivered-2',
          productId: 'p1',
          type: 'Short Pick',
          description: 'Invoice says 40kg, but we only counted 35kg in the crates.',
          reportedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          supplierStatus: 'ACCEPTED',
          supplierAction: 'CREDIT',
          repStatus: 'ACTIONING',
          assignedRepId: 'rep1'
      });
  }

  getTodayIssues() { return this.issues; }
  
  updateIssueSupplierStatus(id: string, status: OrderIssue['supplierStatus'], action?: OrderIssue['supplierAction']) {
    const issue = this.issues.find(i => i.id === id);
    if (issue) {
        issue.supplierStatus = status;
        if (action) issue.supplierAction = action;
    }
  }

  updateIssueRepStatus(id: string, status: OrderIssue['repStatus']) {
    const issue = this.issues.find(i => i.id === id);
    if (issue) issue.repStatus = status;
  }

  getIndustryIncentives() { return this.industryIncentives; }
  updateIndustryIncentive(industry: Industry, percent: number) { this.industryIncentives[industry] = percent; }

  getRoleIncentives() { return this.roleIncentives; }
  updateRoleIncentive(role: string, data: RoleIncentive) { this.roleIncentives[role] = data; }

  getAllUsers() { return this.users; }
  getCustomers() { return this.customers; }
  getAppNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  markNotificationAsRead(id: string) { const n = this.notifications.find(x => x.id === id); if (n) n.isRead = true; }
  markAllNotificationsRead(userId: string) { this.notifications.forEach(n => { if (n.userId === userId) n.isRead = true; }); }
  getAllProducts() { return this.products; }
  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  addInventoryItem(item: InventoryItem) { this.inventory.push(item); }
  updateInventoryStatus(id: string, status: any) { const item = this.inventory.find(i => i.id === id); if (item) item.status = status; }
  getOrders(userId: string) { if (userId === 'u1') return this.orders; return this.orders.filter(o => o.buyerId === userId || o.sellerId === userId); }
  
  hasOutstandingInvoices(userId: string): boolean {
    return this.orders.some(o => o.buyerId === userId && (o.paymentStatus === 'Unpaid' || o.paymentStatus === 'Overdue'));
  }

  markOrderAsPaid(orderId: string, receiptUrl: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.paymentStatus = 'Paid';
        order.customerReceiptUrl = receiptUrl;
    }
  }

  markOrderAsRemitted(orderId: string, receiptUrl: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.supplierPayoutStatus = 'Remitted';
        order.supplierReceiptUrl = receiptUrl;
    }
  }

  createFullOrder(buyerId: string, items: OrderItem[], total: number) {
      const buyerProfile = this.customers.find(c => c.id === buyerId);
      const sellerId = buyerProfile?.connectedSupplierId || 'u2'; 
      const newOrder: Order = { id: `o-${Date.now()}`, buyerId, sellerId, items, totalAmount: total, status: 'Pending', date: new Date().toISOString(), paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', source: 'Direct' };
      this.orders.push(newOrder);
      this.addAppNotification(sellerId, 'New Order Received', `Order for $${total.toFixed(2)} received.`, 'ORDER');
      return newOrder;
  }

  createInstantOrder(buyerId: string, item: InventoryItem, quantity: number, price: number) {
    const newOrder: Order = { id: `o-inst-${Date.now()}`, buyerId, sellerId: item.ownerId, items: [{ productId: item.productId, quantityKg: quantity, pricePerKg: price }], totalAmount: quantity * price, status: 'Confirmed', date: new Date().toISOString(), paymentStatus: 'Unpaid', supplierPayoutStatus: 'Pending', source: 'Marketplace' };
    this.orders.push(newOrder);
    return newOrder;
  }

  acceptOrderV2(id: string) {
    const order = this.orders.find(o => o.id === id);
    if (order) { 
        order.status = 'Confirmed'; 
        order.confirmedAt = new Date().toISOString(); 
        const buyer = this.users.find(u => u.id === order.buyerId);
        if (buyer?.smsNotificationsEnabled && buyer.phone) {
            triggerNativeSms(buyer.phone, `PZ UPDATE: Your order #${order.id.split('-').pop()} has been confirmed by the supplier.`);
        }
    }
  }

  updateUserInterests(id: string, s: string[], b: string[]) {
    const u = this.users.find(x => x.id === id);
    if (u) { u.activeSellingInterests = s; u.activeBuyingInterests = b; }
  }

  updateProductPricing(id: string, price: number, unit: any) {
    const p = this.products.find(x => x.id === id);
    if (p) { p.defaultPricePerKg = price; p.unit = unit; }
  }

  generateLotId() { return `PZ-${Math.floor(1000 + Math.random() * 9000)}`; }
  findBuyersForProduct(name: string) { return this.customers.filter(c => c.commonProducts?.toLowerCase().includes(name.toLowerCase())); }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  getInventoryByOwner(ownerId: string) { return this.getInventory(ownerId); }
  addProduct(product: Product) { this.products.push(product); }
  updateProductPrice(id: string, price: number) { const p = this.products.find(x => x.id === id); if (p) p.defaultPricePerKg = price; }

  updateCustomerSupplier(customerId: string, supplierId: string) {
    const customer = this.customers.find(c => c.id === customerId);
    if (customer) {
      customer.connectedSupplierId = supplierId;
      const supplier = this.users.find(u => u.id === supplierId);
      if (supplier) { customer.connectedSupplierName = supplier.businessName; customer.connectedSupplierRole = supplier.role; }
    }
  }

  updateCustomerMarkup(customerId: string, markup: number) {
      const customer = this.customers.find(c => c.id === customerId);
      if (customer) {
          customer.pzMarkup = markup;
      }
  }

  updateCustomerRep(customerId: string, repId: string) {
      const customer = this.customers.find(c => c.id === customerId);
      const rep = this.users.find(u => u.id === repId);
      if (customer && rep) {
          customer.assignedPzRepId = repId;
          customer.assignedPzRepName = rep.name;
      }
  }

  getDrivers(wholesalerId: string) { return this.drivers.filter(d => d.wholesalerId === wholesalerId); }
  addDriver(driver: Driver) { this.drivers.push(driver); }
  getDriverOrders(driverId: string) { const driver = this.drivers.find(d => d.id === driverId); return this.orders.filter(o => o.logistics?.driverName === driver?.name); }
  deliverOrder(orderId: string, driverName: string, photo: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) { 
        order.status = 'Delivered'; 
        order.deliveredAt = new Date().toISOString(); 
        order.logistics = { ...order.logistics, driverName, deliveryPhoto: photo, deliveryDate: new Date().toISOString() }; 
        const buyer = this.users.find(u => u.id === order.buyerId);
        if (buyer?.smsNotificationsEnabled && buyer.phone) {
            triggerNativeSms(buyer.phone, `PZ DELIVERED: Order #${order.id.split('-').pop()} has arrived! Please verify the contents in your portal.`);
        }
    }
  }

  getPackers(wholesalerId: string) { return this.packers.filter(p => p.wholesalerId === wholesalerId); }
  addPacker(packer: Packer) { this.packers.push(packer); }
  getPackerOrders(packerId: string) { return this.orders.filter(o => o.status === 'Confirmed'); }
  
  packOrder(orderId: string, packerName: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Ready for Delivery';
        order.packedAt = new Date().toISOString();
        const buyer = this.users.find(u => u.id === order.buyerId);
        if (buyer?.smsNotificationsEnabled && buyer.phone) {
            triggerNativeSms(buyer.phone, `PZ UPDATE: Order #${order.id.split('-').pop()} has been packed and is ready for dispatch.`);
        }
    }
  }

  addAppNotification(userId: string, title: string, message: string, type: AppNotification['type']) {
    this.notifications.push({ id: `n-${Date.now()}`, userId, title, message, type, timestamp: new Date().toISOString(), isRead: false });
  }

  addEmployee(user: User) { this.users.push(user); }
  updateUserVersion(userId: string, version: 'v1' | 'v2') { const user = this.users.find(u => u.id === userId); if (user) user.dashboardVersion = version; }
  updateUserSmsPreference(userId: string, enabled: boolean, phone?: string) {
      const user = this.users.find(u => u.id === userId);
      if (user) {
          user.smsNotificationsEnabled = enabled;
          if (phone) user.phone = phone;
      }
  }
  getRegistrationRequests() { return this.registrationRequests; }
  approveRegistration(id: string) { const req = this.registrationRequests.find(r => r.id === id); if (req) req.status = 'Approved'; }
  rejectRegistration(id: string) { const req = this.registrationRequests.find(r => r.id === id); if (req) req.status = 'Rejected'; }
  
  deleteUser(id: string) { this.users = this.users.filter(u => u.id !== id); }

  createManualInvite(data: any): RegistrationRequest {
    const req: RegistrationRequest = { id: `req-${Date.now()}`, businessName: data.businessName, name: data.name, email: data.email, requestedRole: data.role || UserRole.CONSUMER, status: 'Pending', submittedDate: new Date().toISOString(), industry: data.industry, consumerData: { location: data.location, mobile: data.mobile } };
    this.registrationRequests.push(req);
    this.customers.push({ id: `c-${Date.now()}`, businessName: data.businessName, contactName: data.name, email: data.email, phone: data.mobile, category: 'Restaurant', industry: data.industry, connectionStatus: 'Pending Connection', connectedSupplierId: USERS[1].id, pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14 });
    return req;
  }
  deleteRegistrationRequest(id: string) { this.registrationRequests = this.registrationRequests.filter(r => r.id !== r.id); }
  
  onboardNewBusiness(data: any): User {
    const newUser: User = { id: data.id || `u-${Date.now()}`, name: data.name || 'New Lead', businessName: data.businessName, email: data.email, role: data.role || (data.type === 'Supplier' ? UserRole.WHOLESALER : UserRole.CONSUMER), industry: data.industry, phone: data.phone, businessProfile: { isComplete: false, abn: data.abn, businessLocation: data.address } as any };
    this.users.push(newUser);
    return newUser;
  }

  // Final Profile submission from landing flow
  submitFinalizedOnboarding(userId: string, profile: BusinessProfile) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
        user.businessProfile = { ...profile, isComplete: true };
        
        // 1. PZ admin receives high-priority notification in "New Leads" queue context
        this.addAppNotification('u1', 'New Lead: Trade Profile Finalized', `${user.businessName} has completed their trade identity. Review ABN/Logistics.`, 'APPLICATION');
        
        // 2. Add as a pending customer lead for reps
        this.customers.push({
            id: user.id,
            businessName: user.businessName,
            contactName: user.name,
            email: user.email,
            phone: user.phone,
            category: 'New Lead',
            industry: user.industry,
            connectionStatus: 'Pending Connection',
            pzPaymentTermsDays: 7,
            supplierPaymentTermsDays: 14
        });

        // 3. Simulated Email Connector
        this.triggerEmailConnector(user.email, user.name);
    }
  }

  private triggerEmailConnector(email: string, name: string) {
    console.log(`%c[EMAIL CONNECTOR] Dispatching confirmation to ${email}...`, 'color: #10b981; font-weight: bold;');
    // Simulate async email delivery
    setTimeout(() => {
        console.log(`%c[EMAIL DELIVERED] Message: "Hi ${name}, Platform Zero will be in contact within 1 business day."`, 'color: #3b82f6; font-style: italic;');
    }, 1000);
  }

  sendOnboardingComms(customerId: string) { }
  getRepCustomers(repId: string) { return this.customers.filter(c => c.assignedPzRepId === repId); }
  getRepIssues(repId: string) { return this.orders.filter(o => o.issue); }
  getRepStats(repId: string) {
    const customers = this.getRepCustomers(repId);
    const customerIds = customers.map(c => c.id);
    const repOrders = this.orders.filter(o => customerIds.includes(o.buyerId));
    return { totalSales: repOrders.reduce((sum, o) => sum + o.totalAmount, 0), commissionMade: repOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + o.totalAmount * 0.05, 0), commissionComing: repOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + o.totalAmount * 0.05, 0), customerCount: customers.length, orders: repOrders };
  }
  getSupplierPriceRequests(id: string) { return this.supplierPriceRequests.filter(r => r.supplierId === id); }
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  updateSupplierPriceRequest(id: string, req: SupplierPriceRequest) { const idx = this.supplierPriceRequests.findIndex(r => r.id === id); if (idx !== -1) this.supplierPriceRequests[idx] = req; }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); }
  
  updateSupplierPriceRequestResponse(requestId: string, updatedItems: SupplierPriceRequestItem[]) {
      const req = this.supplierPriceRequests.find(r => r.id === requestId);
      if (req) {
          req.items = updatedItems;
          req.status = 'SUBMITTED';
          this.addAppNotification('u1', 'Quote Received: Price Audit Complete', `Partner has responded to the quote request for ${req.customerContext}.`, 'PRICE_REQUEST');
      }
  }

  finalizeDeal(requestId: string): Customer | undefined {
    const req = this.supplierPriceRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'WON';
      const newCustomer: Customer = {
        id: `c-won-${Date.now()}`,
        businessName: req.customerContext,
        contactName: 'Procured Lead',
        location: req.customerLocation,
        connectedSupplierId: req.supplierId,
        connectionStatus: 'Active',
        category: 'Restaurant',
        pzPaymentTermsDays: 7,
        supplierPaymentTermsDays: 14
      };
      this.customers.push(newCustomer);
      return newCustomer;
    }
    return undefined;
  }

  getChatMessages(u1: string, u2: string) {
    return this.chatMessages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
  }
  sendChatMessage(senderId: string, receiverId: string, text: string) {
    this.chatMessages.push({ id: `chat-${Date.now()}`, senderId, receiverId, text, timestamp: new Date().toISOString() });
  }

  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER || u.role === UserRole.FARMER); }
  submitConsumerSignup(data: any) { 
    const req: RegistrationRequest = { id: data.id || `reg-${Date.now()}`, businessName: data.businessName, name: data.name, email: data.email, requestedRole: data.requestedRole || UserRole.CONSUMER, industry: data.industry, status: 'Pending', submittedDate: new Date().toISOString(), consumerData: { location: data.location, weeklySpend: data.weeklySpend, orderFrequency: data.orderFrequency, invoiceFile: data.invoiceFile, mobile: data.mobile } }; 
    this.registrationRequests.push(req); 
    this.onboardNewBusiness(data); // Also create a user record for onboarding
  }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  updateBusinessProfile(userId: string, profile: BusinessProfile) { 
    const user = this.users.find(u => u.id === userId); 
    if (user) {
        user.businessProfile = profile;
        this.submitFinalizedOnboarding(userId, profile);
    }
  }
  getFormTemplate(role: UserRole): OnboardingFormTemplate | undefined {
    return {
      id: `form-${role}`,
      role,
      sections: [
        {
          id: 's1',
          title: 'Business Basics',
          fields: [
            { id: 'f1', label: 'Company Name', type: 'text', required: true },
            { id: 'f2', label: 'ABN', type: 'text', required: true }
          ]
        }
      ]
    };
  }

  uploadToDeli(data: any, vendorName: string) {
    console.log(`Uploading to Deli: ${vendorName}`, data);
  }
}

export const mockService = new MockDataService();
