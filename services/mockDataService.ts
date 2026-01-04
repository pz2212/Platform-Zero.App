
import { 
  User, UserRole, Product, InventoryItem, Order, Customer, 
  SupplierPriceRequest, PricingRule,
  SupplierPriceRequestItem, AppNotification, ChatMessage, OrderItem,
  Driver, Packer, RegistrationRequest, OnboardingFormTemplate,
  BusinessProfile, OrderIssue, Industry, ProductUnit
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

export interface PortalInvite {
  id: string;
  code: string;
  businessName: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  email: string;
  mobile: string;
  status: 'Pending' | 'Claimed';
  createdAt: string;
}

// Added INDUSTRIES constant for the Growth Hub and other components
export const INDUSTRIES: Industry[] = [
  'Cafe', 'Restaurant', 'Pub', 'Hotel', 'Sporting Club', 'RSL', 'Casino', 
  'Catering', 'Grocery Store', 'Airlines', 'School', 'Aged Care', 'Hospital'
];

export const USERS_INITIAL: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com', favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Eggplants'], activeBuyingInterests: ['Potatoes', 'Apples'], businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Potatoes', 'Apples'], activeBuyingInterests: [], businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com', phone: '0412 345 678', industry: 'Cafe', smsNotificationsEnabled: true, businessProfile: { isComplete: true } as any, favoriteProductIds: ['p1', 'p2', 'p-banana-cav'], isConfirmed: true, hasSetCredentials: true },
  { id: 'u5', name: 'Gary Grocer', businessName: 'Local Corner Grocers', role: UserRole.GROCERY, email: 'gary@grocer.com', phone: '0411 222 333', industry: 'Grocery Store', smsNotificationsEnabled: true, businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'rep1', name: 'Alex Johnson', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0, isConfirmed: true, hasSetCredentials: true },
  { id: 'rep2', name: 'Sam Taylor', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep2@pz.com', commissionRate: 5.0, isConfirmed: true, hasSetCredentials: true },
];

class MockDataService {
  private users: User[] = [...USERS_INITIAL];
  private portalInvites: PortalInvite[] = [];
  private registrationRequests: RegistrationRequest[] = [];
  private roleIncentives: Record<string, RoleIncentive> = {
    [UserRole.FARMER]: { amount: 500, weeks: 4, activationDays: 7, minSpendPerWeek: 100, referrerBonusEnabled: true, referrerBonusAmount: 250 },
    [UserRole.WHOLESALER]: { amount: 1000, weeks: 8, activationDays: 14, minSpendPerWeek: 500, referrerBonusEnabled: true, referrerBonusAmount: 500 },
    [UserRole.CONSUMER]: { amount: 100, weeks: 2, activationDays: 3, minSpendPerWeek: 50, referrerBonusEnabled: true, referrerBonusAmount: 25 },
    [UserRole.GROCERY]: { amount: 250, weeks: 4, activationDays: 7, minSpendPerWeek: 150, referrerBonusEnabled: true, referrerBonusAmount: 100 },
  };
  // Added industry incentives map
  private industryIncentives: Record<Industry, number> = {
    'Cafe': 15, 'Restaurant': 15, 'Pub': 15, 'Hotel': 15, 'Sporting Club': 15,
    'RSL': 15, 'Casino': 15, 'Catering': 15, 'Grocery Store': 15, 'Airlines': 15,
    'School': 15, 'Aged Care': 15, 'Hospital': 15
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
  private inventory: InventoryItem[] = [];
  private orders: Order[] = [];
  private issues: OrderIssue[] = [];
  private notifications: AppNotification[] = [];
  private customers: Customer[] = [];
  private supplierPriceRequests: SupplierPriceRequest[] = [];
  private chatMessages: ChatMessage[] = [];
  // Added drivers and packers lists
  private drivers: Driver[] = [];
  private packers: Packer[] = [];

  constructor() {
    this.loadFromStorage();
    if (this.products.length === 0) {
      this.products = [
        { id: 'p1', name: 'Organic Roma Tomatoes', category: 'Vegetable', variety: 'Roma', imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 4.50, co2SavingsPerKg: 1.2 },
        { id: 'p1-truss', name: 'Truss Vine Tomatoes', category: 'Vegetable', variety: 'Vine-Ripened', imageUrl: 'https://images.unsplash.com/photo-1582284540020-8acbe03f4924?auto=format&fit=crop&q=80&w=400&h=400', defaultPricePerKg: 6.20, co2SavingsPerKg: 1.0 },
      ];
    }
  }

  private saveToStorage() {
    const data = {
      users: this.users,
      portalInvites: this.portalInvites,
      registrationRequests: this.registrationRequests,
      roleIncentives: this.roleIncentives,
      industryIncentives: this.industryIncentives,
      products: this.products,
      inventory: this.inventory,
      orders: this.orders,
      issues: this.issues,
      customers: this.customers,
      supplierPriceRequests: this.supplierPriceRequests,
      chatMessages: this.chatMessages,
      notifications: this.notifications,
      drivers: this.drivers,
      packers: this.packers
    };
    localStorage.setItem('pz_platform_data', JSON.stringify(data));
  }

  private loadFromStorage() {
    const saved = localStorage.getItem('pz_platform_data');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.users = data.users || this.users;
        this.portalInvites = data.portalInvites || this.portalInvites;
        this.registrationRequests = data.registrationRequests || this.registrationRequests;
        this.roleIncentives = data.roleIncentives || this.roleIncentives;
        this.industryIncentives = data.industryIncentives || this.industryIncentives;
        this.products = data.products || this.products;
        this.inventory = data.inventory || this.inventory;
        this.orders = data.orders || this.orders;
        this.issues = data.issues || this.issues;
        this.customers = data.customers || this.customers;
        this.supplierPriceRequests = data.supplierPriceRequests || this.supplierPriceRequests;
        this.chatMessages = data.chatMessages || this.chatMessages;
        this.notifications = data.notifications || this.notifications;
        this.drivers = data.drivers || this.drivers;
        this.packers = data.packers || this.packers;
      } catch (e) {
        console.error("Failed to load PZ mock data", e);
      }
    }
  }

  verifyCodeLogin(code: string): User | null {
    this.loadFromStorage();
    const cleanCode = code.toUpperCase().trim();
    const req = this.registrationRequests.find(r => r.temporaryCode?.toUpperCase() === cleanCode && r.status === 'Approved');
    if (req) {
      let user = this.users.find(u => u.id === req.id);
      if (!user) {
        const bonus = this.roleIncentives[req.requestedRole]?.amount || 0;
        user = {
          id: req.id,
          name: `${req.firstName} ${req.lastName}`,
          businessName: req.businessName,
          email: req.email,
          phone: req.mobile,
          role: req.requestedRole,
          favoriteProductIds: [],
          isConfirmed: false,
          hasSetCredentials: false,
          // @ts-ignore
          incentiveBalance: bonus
        };
        this.users.push(user);
        this.saveToStorage();
      }
      return user;
    }
    return null;
  }

  createManualPortalInvite(data: any) {
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const invite: PortalInvite = {
      id: `inv-${Date.now()}`,
      code,
      businessName: data.businessName,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      email: data.email,
      mobile: data.mobile,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    this.portalInvites.push(invite);

    const req: RegistrationRequest = {
      id: invite.id,
      businessName: data.businessName,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      mobile: data.mobile,
      requestedRole: data.role,
      status: 'Approved',
      submittedDate: invite.createdAt,
      temporaryCode: code
    };
    this.registrationRequests.push(req);

    const bonus = this.roleIncentives[data.role]?.amount || 0;
    const newUser: User = {
      id: invite.id,
      name: `${data.firstName} ${data.lastName}`,
      businessName: data.businessName,
      email: data.email,
      phone: data.mobile,
      role: data.role,
      favoriteProductIds: [],
      isConfirmed: false,
      hasSetCredentials: false,
      // @ts-ignore
      incentiveBalance: bonus
    };
    this.users.push(newUser);

    if (data.role === UserRole.CONSUMER || data.role === UserRole.GROCERY) {
      this.customers.push({
        id: newUser.id,
        businessName: newUser.businessName,
        contactName: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        category: data.role === UserRole.GROCERY ? 'Grocery' : 'Restaurant',
        connectionStatus: 'Pricing Pending',
        pzPaymentTermsDays: 7,
        supplierPaymentTermsDays: 14,
        pzMarkup: 15
      });
    }

    this.saveToStorage();
    return invite;
  }

  updateUserCredentials(userId: string, email: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.email = email;
      user.hasSetCredentials = true;
      user.isConfirmed = false; 
      this.saveToStorage();
    }
  }

  confirmUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isConfirmed = true;
      this.saveToStorage();
    }
  }

  getAllUsers() { return this.users; }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER); }
  getOrders(userId: string) { return this.orders; }
  getRegistrationRequests() { return this.registrationRequests; }
  getCustomers() { return this.customers; }
  getInventory(userId: string) { return this.inventory.filter(i => i.ownerId === userId); }
  getAllInventory() { return this.inventory; }
  getAllProducts() { return this.products; }
  getRoleIncentives() { return this.roleIncentives; }
  
  updateRoleIncentive(role: string, data: RoleIncentive) {
    this.roleIncentives[role] = data;
    this.saveToStorage();
  }

  addProduct(p: Product) { this.products.push(p); this.saveToStorage(); }
  addInventoryItem(item: InventoryItem) { this.inventory.push(item); this.saveToStorage(); }
  
  createFullOrder(buyerId: string, items: any[], total: number) {
    const order: Order = {
      id: `o-${Date.now()}`,
      buyerId,
      sellerId: 'u2', 
      items,
      totalAmount: total,
      status: 'Pending',
      date: new Date().toISOString(),
      paymentStatus: 'Unpaid',
      supplierPayoutStatus: 'Pending',
      source: 'Marketplace'
    };
    this.orders.push(order);
    this.saveToStorage();
    return order;
  }

  generateLotId() { return `PZ-LOT-${1000 + this.inventory.length + 1}`; }
  
  updateUserInterests(id: string, selling: string[], buying: string[]) {
    const u = this.users.find(user => user.id === id);
    if (u) {
      u.activeSellingInterests = selling;
      u.activeBuyingInterests = buying;
      this.saveToStorage();
    }
  }

  getSupplierPriceRequests(whId: string) { return this.supplierPriceRequests.filter(r => r.supplierId === whId); }
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  createSupplierPriceRequest(req: SupplierPriceRequest) { this.supplierPriceRequests.push(req); this.saveToStorage(); }

  toggleFavorite(userId: string, productId: string) {
    const u = this.users.find(user => user.id === userId);
    if (!u) return;
    if (!u.favoriteProductIds) u.favoriteProductIds = [];
    if (u.favoriteProductIds.includes(productId)) {
        u.favoriteProductIds = u.favoriteProductIds.filter(id => id !== productId);
    } else {
        u.favoriteProductIds.push(productId);
    }
    this.saveToStorage();
  }

  markOrderAsPaid(id: string, receiptUrl: string) {
    const o = this.orders.find(ord => ord.id === id);
    if (o) {
        o.paymentStatus = 'Paid';
        o.customerReceiptUrl = receiptUrl;
        this.saveToStorage();
    }
  }

  markOrderAsRemitted(id: string, receiptUrl: string) {
    const o = this.orders.find(ord => ord.id === id);
    if (o) {
        o.supplierPayoutStatus = 'Remitted';
        o.supplierReceiptUrl = receiptUrl;
        this.saveToStorage();
    }
  }

  acceptOrderV2(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Confirmed';
        order.confirmedAt = new Date().toISOString();
        this.saveToStorage();
    }
  }

  packOrder(orderId: string, packerName: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Ready for Delivery';
        order.packedAt = new Date().toISOString();
        order.logistics = { ...order.logistics, instructions: `Packed by ${packerName}` };
        this.saveToStorage();
    }
  }

  deliverOrder(orderId: string, driverName: string, photo: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Delivered';
        order.deliveredAt = new Date().toISOString();
        order.logistics = { ...order.logistics, driverName, deliveryPhoto: photo };
        this.saveToStorage();
    }
  }

  submitOrderIssue(orderId: string, type: string, desc: string) {
    const issue: OrderIssue = {
        id: `iss-${Date.now()}`,
        orderId, type, description: desc,
        reportedAt: new Date().toISOString(),
        supplierStatus: 'PENDING',
        repStatus: 'UNSEEN'
    };
    this.issues.push(issue);
    const order = this.orders.find(o => o.id === orderId);
    if (order) order.issue = issue;
    this.saveToStorage();
  }

  getTodayIssues() { return this.issues; }
  findBuyersForProduct(productName: string) {
    const INDUSTRIES_FILTER = ['Cafe', 'Restaurant', 'Pub', 'Grocery Store'];
    return this.customers.filter(c => 
        c.commonProducts?.toLowerCase().includes(productName.toLowerCase()) || 
        INDUSTRIES_FILTER.some(ind => c.category.includes(ind) && productName.length > 3)
    );
  }

  hasOutstandingInvoices(userId: string) {
    return this.orders.some(o => o.buyerId === userId && o.paymentStatus === 'Overdue');
  }

  addAppNotification(userId: string, title: string, message: string, type: any) {
    this.notifications.push({
        id: `notif-${Date.now()}`,
        userId, title, message, type,
        timestamp: new Date().toISOString(),
        isRead: false
    });
    this.saveToStorage();
  }

  getAppNotifications(userId: string) { return this.notifications.filter(n => n.userId === userId); }
  markNotificationAsRead(id: string) {
    const n = this.notifications.find(notif => notif.id === id);
    if (n) { n.isRead = true; this.saveToStorage(); }
  }

  markAllNotificationsRead(userId: string) {
    this.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
    this.saveToStorage();
  }

  getChatMessages(u1: string, u2: string) {
    return this.chatMessages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
  }

  sendChatMessage(senderId: string, receiverId: string, text: string) {
    this.chatMessages.push({
        id: `msg-${Date.now()}`,
        senderId, receiverId, text,
        timestamp: new Date().toISOString()
    });
    this.saveToStorage();
  }

  submitSignup(data: any) {
    const req: RegistrationRequest = {
        id: `req-${Date.now()}`,
        ...data,
        status: 'Pending',
        submittedDate: new Date().toISOString()
    };
    this.registrationRequests.push(req);
    this.saveToStorage();
    return req;
  }

  approveRegistration(id: string) {
    const req = this.registrationRequests.find(r => r.id === id);
    if (req) {
      req.status = 'Approved';
      if (!req.temporaryCode) { req.temporaryCode = Math.random().toString(36).substring(2, 8).toUpperCase(); }
      this.saveToStorage();
    }
  }

  rejectRegistration(id: string) {
    const req = this.registrationRequests.find(r => r.id === id);
    if (req) { req.status = 'Rejected'; this.saveToStorage(); }
  }

  updateCustomerMarkup(id: string, markup: number) {
    const c = this.customers.find(cust => cust.id === id);
    if (c) { c.pzMarkup = markup; this.saveToStorage(); }
  }

  updateCustomerRep(id: string, repId: string) {
    const c = this.customers.find(cust => cust.id === id);
    const rep = this.users.find(u => u.id === repId);
    if (c && rep) {
        c.assignedPzRepId = repId;
        c.assignedPzRepName = rep.name;
        this.saveToStorage();
    }
  }

  // Fixed: Added missing methods for catalog, logistics, and personnel management
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  
  updateProductPricing(id: string, price: number, unit: ProductUnit) {
    const p = this.products.find(prod => prod.id === id);
    if (p) { p.defaultPricePerKg = price; p.unit = unit; this.saveToStorage(); }
  }

  updateProductPrice(id: string, price: number) {
    const p = this.products.find(prod => prod.id === id);
    if (p) { p.defaultPricePerKg = price; this.saveToStorage(); }
  }

  getDrivers(whId: string) { return this.drivers.filter(d => d.wholesalerId === whId); }
  addDriver(d: Driver) { this.drivers.push(d); this.saveToStorage(); }
  
  getDriverOrders(dId: string) {
    const driver = this.drivers.find(d => d.id === dId);
    if (!driver) return [];
    return this.orders.filter(o => o.logistics?.driverName === driver.name && o.status === 'Shipped');
  }

  getPackers(whId: string) { return this.packers.filter(p => p.wholesalerId === whId); }
  addPacker(p: Packer) { this.packers.push(p); this.saveToStorage(); }
  
  getPackerOrders(pkId: string) {
    const packer = this.packers.find(p => p.id === pkId);
    if (!packer) return [];
    return this.orders.filter(o => o.status === 'Confirmed' && o.sellerId === packer.wholesalerId);
  }

  addEmployee(u: User) { this.users.push(u); this.saveToStorage(); }

  updateUserVersion(id: string, v: 'v1' | 'v2') {
    const u = this.users.find(user => user.id === id);
    if (u) { u.dashboardVersion = v; this.saveToStorage(); }
  }

  updateUserSmsPreference(id: string, enabled: boolean, phone: string) {
    const u = this.users.find(user => user.id === id);
    if (u) { u.smsNotificationsEnabled = enabled; u.phone = phone; this.saveToStorage(); }
  }

  getIndustryIncentives() { return this.industryIncentives; }
  updateIndustryIncentive(ind: Industry, val: number) {
    this.industryIncentives[ind] = val;
    this.saveToStorage();
  }

  getRepCustomers(repId: string) { return this.customers.filter(c => c.assignedPzRepId === repId); }
  
  getRepIssues(repId: string) {
    return this.orders.filter(o => o.issue && o.issue.assignedRepId === repId);
  }

  getRepStats(repId: string) {
    const repOrders = this.orders.filter(o => {
        const customer = this.customers.find(c => c.id === o.buyerId);
        return customer?.assignedPzRepId === repId;
    });
    const commissionMade = repOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalAmount * 0.05), 0);
    const commissionComing = repOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + (o.totalAmount * 0.05), 0);
    return {
        totalSales: repOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        commissionMade,
        commissionComing,
        customerCount: this.customers.filter(c => c.assignedPzRepId === repId).length,
        orders: repOrders
    };
  }

  createInstantOrder(buyerId: string, item: InventoryItem, qty: number, price: number) {
    const order: Order = {
      id: `o-${Date.now()}`,
      buyerId,
      sellerId: item.ownerId,
      items: [{ productId: item.productId, quantityKg: qty, pricePerKg: price }],
      totalAmount: qty * price,
      status: 'Pending',
      date: new Date().toISOString(),
      paymentStatus: 'Unpaid',
      supplierPayoutStatus: 'Pending',
      source: 'Marketplace'
    };
    this.orders.push(order);
    this.saveToStorage();
    return order;
  }

  updateBusinessProfile(userId: string, profile: any) {
    const u = this.users.find(user => user.id === userId);
    if (u) { 
      u.businessProfile = { ...u.businessProfile, ...profile }; 
      const cust = this.customers.find(c => c.id === userId);
      if (cust) {
        cust.businessName = profile.companyName || u.businessName;
        cust.location = profile.businessLocation || '';
      }
      this.saveToStorage(); 
    }
  }

  onboardNewBusiness(data: any) {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.businessName,
      businessName: data.businessName,
      role: data.role,
      email: data.email,
      favoriteProductIds: [],
      isConfirmed: true,
      hasSetCredentials: true,
      businessProfile: { isComplete: true, businessLocation: data.address, abn: data.abn } as any
    };
    this.users.push(newUser);
    this.saveToStorage();
    return newUser;
  }

  deleteUser(id: string) {
    this.users = this.users.filter(u => u.id !== id);
    this.saveToStorage();
  }

  finalizeDeal(requestId: string) {
    const req = this.supplierPriceRequests.find(r => r.id === requestId);
    if (req) {
      req.status = 'WON';
      const newUser = this.users.find(u => u.id === req.supplierId);
      const customer: Customer = {
          id: `cust-${Date.now()}`,
          businessName: req.customerContext,
          contactName: 'Lead Customer',
          location: req.customerLocation,
          category: 'Restaurant',
          connectionStatus: 'Active',
          connectedSupplierId: req.supplierId,
          connectedSupplierName: newUser?.businessName || 'Supplier',
          pzMarkup: 15,
          pzPaymentTermsDays: 7,
          supplierPaymentTermsDays: 14
      };
      this.customers.push(customer);
      this.saveToStorage();
      return customer;
    }
    return null;
  }

  sendOnboardingComms(customerId: string) { console.debug("Onboarding comms sent for", customerId); }

  updateInventoryStatus(id: string, status: any) {
    const item = this.inventory.find(i => i.id === id);
    if (item) { item.status = status; this.saveToStorage(); }
  }

  uploadToDeli(data: any, businessName: string) { console.debug("Uploaded to deli", data, businessName); }

  updateSupplierPriceRequestResponse(requestId: string, items: SupplierPriceRequestItem[]) {
    const req = this.supplierPriceRequests.find(r => r.id === requestId);
    if (req) { req.items = items; req.status = 'SUBMITTED'; this.saveToStorage(); }
  }
}

export const mockService = new MockDataService();
