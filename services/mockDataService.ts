
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

export const USERS: User[] = [
  { id: 'u1', name: 'Admin User', businessName: 'Platform Zero', role: UserRole.ADMIN, email: 'admin@pz.com', favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u2', name: 'Sarah Wholesaler', businessName: 'Fresh Wholesalers', role: UserRole.WHOLESALER, email: 'sarah@fresh.com', dashboardVersion: 'v2', activeSellingInterests: ['Tomatoes', 'Lettuce', 'Eggplants'], activeBuyingInterests: ['Potatoes', 'Apples'], businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u3', name: 'Bob Farmer', businessName: 'Green Valley Farms', role: UserRole.FARMER, email: 'bob@greenvalley.com', dashboardVersion: 'v2', activeSellingInterests: ['Potatoes', 'Apples'], activeBuyingInterests: [], businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'u4', name: 'Alice Consumer', businessName: 'The Morning Cafe', role: UserRole.CONSUMER, email: 'alice@cafe.com', phone: '0412 345 678', industry: 'Cafe', smsNotificationsEnabled: true, businessProfile: { isComplete: true } as any, favoriteProductIds: ['p1', 'p2', 'p-banana-cav'], isConfirmed: true, hasSetCredentials: true },
  { id: 'u5', name: 'Gary Grocer', businessName: 'Local Corner Grocers', role: UserRole.GROCERY, email: 'gary@grocer.com', phone: '0411 222 333', industry: 'Grocery Store', smsNotificationsEnabled: true, businessProfile: { isComplete: true } as any, favoriteProductIds: [], isConfirmed: true, hasSetCredentials: true },
  { id: 'rep1', name: 'Alex Johnson', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep1@pz.com', commissionRate: 5.0, isConfirmed: true, hasSetCredentials: true },
  { id: 'rep2', name: 'Sam Taylor', businessName: 'Platform Zero', role: UserRole.PZ_REP, email: 'rep2@pz.com', commissionRate: 5.0, isConfirmed: true, hasSetCredentials: true },
];

export const INDUSTRIES: Industry[] = [
  'Cafe', 'Restaurant', 'Pub', 'Hotel', 'Sporting Club', 'RSL', 'Casino', 
  'Catering', 'Grocery Store', 'Airlines', 'School', 'Aged Care', 'Hospital'
];

class MockDataService {
  private users: User[] = [...USERS];
  private portalInvites: PortalInvite[] = [];
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
    { id: 'u4', businessName: 'The Morning Cafe', contactName: 'Alice Consumer', category: 'Restaurant', industry: 'Cafe', commonProducts: 'Bananas, Potatoes, Lettuce', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'alice@cafe.com', phone: '0412 345 678', pzMarkup: 15, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14, issueReportingWindowMinutes: 60 },
    { id: 'u5', businessName: 'Local Corner Grocers', contactName: 'Gary Grocer', category: 'Grocery', industry: 'Grocery Store', commonProducts: 'Everything', location: 'Fitzroy', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'gary@grocer.com', phone: '0411 222 333', pzMarkup: 12, assignedPzRepId: 'rep2', assignedPzRepName: 'Sam Taylor', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14, issueReportingWindowMinutes: 90 },
    { id: 'c1', businessName: 'Fresh Market Co', contactName: 'Sarah Johnson', category: 'Retail', industry: 'Grocery Store', commonProducts: 'Tomatoes, Lettuce, Apples', location: 'Richmond', connectedSupplierId: 'u2', connectedSupplierName: 'Fresh Wholesalers', connectionStatus: 'Active', email: 'sarah@freshmarket.com', phone: '0400 999 888', pzMarkup: 15, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14, issueReportingWindowMinutes: 60 },
    { id: 'c2', businessName: 'Healthy Eats', contactName: 'Chef Mario', category: 'Restaurant', industry: 'Restaurant', commonProducts: 'Tomatoes, Eggplant, Broccoli', location: 'South Yarra', connectedSupplierId: 'u3', connectedSupplierName: 'Green Valley Farms', connectionStatus: 'Active', email: 'mario@healthy.com', phone: '0455 111 222', pzMarkup: 18, assignedPzRepId: 'rep1', assignedPzRepName: 'Alex Johnson', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14, issueReportingWindowMinutes: 60 },
    { id: 'c3', businessName: 'Richmond Corner Pub', contactName: 'Dave Smith', category: 'Pub/Bar', industry: 'Pub', location: 'Richmond', connectedSupplierId: 'u2', connectionStatus: 'Pricing Pending', email: 'dave@richmondpub.com', phone: '0488 777 666', pzMarkup: 15, assignedPzRepId: 'rep2', assignedPzRepName: 'Sam Taylor', pzPaymentTermsDays: 7, supplierPaymentTermsDays: 14, issueReportingWindowMinutes: 120 },
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
          repStatus: 'UNSEEN'
      });
  }

  // CORE USER LOGIC
  getAllUsers() { return this.users; }
  getPzRepresentatives() { return this.users.filter(u => u.role === UserRole.PZ_REP); }
  getWholesalers() { return this.users.filter(u => u.role === UserRole.WHOLESALER); }
  
  updateUserVersion(userId: string, version: 'v1' | 'v2') {
    const user = this.users.find(u => u.id === userId);
    if (user) user.dashboardVersion = version;
  }

  addEmployee(user: User) {
    this.users.push(user);
  }

  deleteUser(userId: string) {
    this.users = this.users.filter(u => u.id !== userId);
  }

  updateBusinessProfile(userId: string, profile: BusinessProfile) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
        user.businessProfile = profile;
        user.businessName = profile.companyName || user.businessName;
    }
  }

  updateUserCredentials(userId: string, email: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.email = email;
      user.hasSetCredentials = true;
      user.isConfirmed = false; 
    }
  }

  confirmUser(userId: string) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      user.isConfirmed = true;
    }
  }

  // INVENTORY
  getAllProducts() { return this.products; }
  getProduct(id: string) { return this.products.find(p => p.id === id); }
  addProduct(p: Product) { this.products.push(p); }
  
  getInventory(userId: string) {
    return this.inventory.filter(i => i.ownerId === userId);
  }
  getAllInventory() { return this.inventory; }
  
  addInventoryItem(item: InventoryItem) {
    this.inventory.push(item);
  }

  updateInventoryStatus(id: string, status: any) {
    const item = this.inventory.find(i => i.id === id);
    if (item) item.status = status;
  }

  generateLotId() {
      return `PZ-LOT-${1000 + this.inventory.length + 1}`;
  }

  updateProductPricing(id: string, price: number, unit: any) {
      const p = this.products.find(prod => prod.id === id);
      if (p) {
          p.defaultPricePerKg = price;
          p.unit = unit;
      }
  }

  updateProductPrice(id: string, price: number) {
      const p = this.products.find(prod => prod.id === id);
      if (p) p.defaultPricePerKg = price;
  }

  // ORDERS & DISPUTES
  getOrders(userId: string) {
    return this.orders;
  }

  acceptOrderV2(orderId: string) {
    const order = this.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'Confirmed';
        order.confirmedAt = new Date().toISOString();
    }
  }

  packOrder(orderId: string, packerName: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Ready for Delivery';
          order.packedAt = new Date().toISOString();
          order.logistics = { ...order.logistics, instructions: `Packed by ${packerName}` };
      }
  }

  deliverOrder(orderId: string, driverName: string, photo: string) {
      const order = this.orders.find(o => o.id === orderId);
      if (order) {
          order.status = 'Delivered';
          order.deliveredAt = new Date().toISOString();
          order.logistics = { ...order.logistics, driverName, deliveryPhoto: photo };
      }
  }

  submitOrderIssue(orderId: string, type: string, desc: string) {
      const issue: OrderIssue = {
          id: `iss-${Date.now()}`,
          orderId,
          type,
          description: desc,
          reportedAt: new Date().toISOString(),
          supplierStatus: 'PENDING',
          repStatus: 'UNSEEN'
      };
      this.issues.push(issue);
      const order = this.orders.find(o => o.id === orderId);
      if (order) order.issue = issue;
  }

  getTodayIssues() { return this.issues; }

  // CUSTOMERS
  getCustomers() { return this.customers; }
  
  updateCustomerMarkup(id: string, markup: number) {
      const c = this.customers.find(cust => cust.id === id);
      if (c) c.pzMarkup = markup;
  }

  updateCustomerRep(id: string, repId: string) {
      const c = this.customers.find(cust => cust.id === id);
      const rep = this.users.find(u => u.id === repId);
      if (c && rep) {
          c.assignedPzRepId = repId;
          c.assignedPzRepName = rep.name;
      }
  }

  // REGISTRATIONS & INVITES
  getRegistrationRequests() { return this.registrationRequests; }

  submitSignup(data: { businessName: string, firstName: string, lastName: string, email: string, mobile: string, requestedRole: UserRole }) {
      const req: RegistrationRequest = {
          id: `req-${Date.now()}`,
          ...data,
          status: 'Pending',
          submittedDate: new Date().toISOString()
      };
      this.registrationRequests.push(req);
      return req;
  }

  approveRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) {
          req.status = 'Approved';
          if (!req.temporaryCode) {
              req.temporaryCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          }
          
          if (!this.users.some(u => u.email.toLowerCase() === req.email.toLowerCase())) {
              const newUser: User = {
                  id: req.id,
                  name: `${req.firstName} ${req.lastName}`,
                  businessName: req.businessName,
                  email: req.email,
                  phone: req.mobile,
                  role: req.requestedRole,
                  favoriteProductIds: [],
                  isConfirmed: true, 
                  hasSetCredentials: true
              };
              this.users.push(newUser);

              if (req.requestedRole === UserRole.CONSUMER || req.requestedRole === UserRole.GROCERY) {
                  this.customers.push({
                      id: newUser.id,
                      businessName: newUser.businessName,
                      contactName: newUser.name,
                      email: newUser.email,
                      phone: newUser.phone,
                      category: req.requestedRole === UserRole.GROCERY ? 'Grocery' : 'Restaurant',
                      connectionStatus: 'Pricing Pending',
                      pzPaymentTermsDays: 7,
                      supplierPaymentTermsDays: 14,
                      pzMarkup: 15
                  });
              }
          }
      }
  }

  rejectRegistration(id: string) {
      const req = this.registrationRequests.find(r => r.id === id);
      if (req) req.status = 'Rejected';
  }

  verifyCodeLogin(code: string): User | null {
      const req = this.registrationRequests.find(r => r.temporaryCode?.toUpperCase().trim() === code.toUpperCase().trim() && r.status === 'Approved');
      if (req) {
          let user = this.users.find(u => u.id === req.id);
          if (!user) {
              user = {
                  id: req.id,
                  name: `${req.firstName} ${req.lastName}`,
                  businessName: req.businessName,
                  email: req.email,
                  phone: req.mobile,
                  role: req.requestedRole,
                  favoriteProductIds: [],
                  isConfirmed: false,
                  hasSetCredentials: false
              };
              this.users.push(user);
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

    const newUser: User = {
        id: invite.id,
        name: `${data.firstName} ${data.lastName}`,
        businessName: data.businessName,
        email: data.email,
        phone: data.mobile,
        role: data.role,
        favoriteProductIds: [],
        isConfirmed: false,
        hasSetCredentials: false
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

    return invite;
  }

  onboardNewBusiness(data: any) {
    const newUser: User = {
      id: `u-${Date.now()}`,
      name: data.businessName,
      businessName: data.businessName,
      email: data.email,
      role: data.role,
      favoriteProductIds: [],
      isConfirmed: true,
      hasSetCredentials: true
    };
    this.users.push(newUser);
    return newUser;
  }

  // NOTIFICATIONS
  getAppNotifications(userId: string) {
      return this.notifications.filter(n => n.userId === userId);
  }

  addAppNotification(userId: string, title: string, message: string, type: any) {
      this.notifications.push({
          id: `notif-${Date.now()}`,
          userId, title, message, type,
          timestamp: new Date().toISOString(),
          isRead: false
      });
  }

  markNotificationAsRead(id: string) {
      const n = this.notifications.find(notif => notif.id === id);
      if (n) n.isRead = true;
  }

  markAllNotificationsRead(userId: string) {
      this.notifications.filter(n => n.userId === userId).forEach(n => n.isRead = true);
  }

  // CHAT
  getChatMessages(u1: string, u2: string) {
      return this.chatMessages.filter(m => (m.senderId === u1 && m.receiverId === u2) || (m.senderId === u2 && m.receiverId === u1));
  }

  sendChatMessage(senderId: string, receiverId: string, text: string) {
      this.chatMessages.push({
          id: `msg-${Date.now()}`,
          senderId, receiverId, text,
          timestamp: new Date().toISOString()
      });
  }

  // SETTLEMENT LOGIC
  markOrderAsPaid(id: string, receiptUrl: string) {
      const o = this.orders.find(ord => ord.id === id);
      if (o) {
          o.paymentStatus = 'Paid';
          o.customerReceiptUrl = receiptUrl;
      }
  }

  markOrderAsRemitted(id: string, receiptUrl: string) {
      const o = this.orders.find(ord => ord.id === id);
      if (o) {
          o.supplierPayoutStatus = 'Remitted';
          o.supplierReceiptUrl = receiptUrl;
      }
  }

  hasOutstandingInvoices(userId: string) {
      return this.orders.some(o => o.buyerId === userId && o.paymentStatus === 'Overdue');
  }

  // INCENTIVES
  getRoleIncentives() { return this.roleIncentives; }
  getIndustryIncentives() { return this.industryIncentives; }
  
  updateRoleIncentive(role: string, data: RoleIncentive) {
      this.roleIncentives[role] = data;
  }

  updateIndustryIncentive(ind: Industry, val: number) {
      this.industryIncentives[ind] = val;
  }

  updateUserSmsPreference(id: string, enabled: boolean, phone: string) {
      const u = this.users.find(user => user.id === id);
      if (u) {
          u.smsNotificationsEnabled = enabled;
          u.phone = phone;
      }
  }

  updateUserInterests(id: string, selling: string[], buying: string[]) {
      const u = this.users.find(user => user.id === id);
      if (u) {
          u.activeSellingInterests = selling;
          u.activeBuyingInterests = buying;
      }
  }

  toggleFavorite(userId: string, productId: string) {
      const u = this.users.find(user => user.id === userId);
      if (!u) return;
      if (!u.favoriteProductIds) u.favoriteProductIds = [];
      
      if (u.favoriteProductIds.includes(productId)) {
          u.favoriteProductIds = u.favoriteProductIds.filter(id => id !== productId);
      } else {
          u.favoriteProductIds.push(productId);
      }
  }

  // HELPER FOR SEARCHING
  findBuyersForProduct(productName: string) {
    return this.customers.filter(c => 
        c.commonProducts?.toLowerCase().includes(productName.toLowerCase()) || 
        INDUSTRIES.some(ind => c.category.includes(ind) && productName.length > 3)
    );
  }

  // PROCUREMENT / NEGOTIATIONS
  getAllSupplierPriceRequests() { return this.supplierPriceRequests; }
  getSupplierPriceRequests(whId: string) { return this.supplierPriceRequests.filter(r => r.supplierId === whId); }

  createSupplierPriceRequest(req: SupplierPriceRequest) {
      this.supplierPriceRequests.push(req);
  }

  updateSupplierPriceRequestResponse(reqId: string, items: SupplierPriceRequestItem[]) {
      const req = this.supplierPriceRequests.find(r => r.id === reqId);
      if (req) {
          req.items = items;
          req.status = 'SUBMITTED';
      }
  }

  finalizeDeal(reqId: string) {
      const req = this.supplierPriceRequests.find(r => r.id === reqId);
      if (req) {
          req.status = 'WON';
          const supplier = this.users.find(u => u.id === req.supplierId);
          
          const newCust: Customer = {
              id: `c-win-${Date.now()}`,
              businessName: req.customerContext,
              contactName: 'Pending Onboarding',
              category: 'General',
              location: req.customerLocation,
              connectedSupplierId: req.supplierId,
              connectedSupplierName: supplier?.businessName,
              connectionStatus: 'Pending Connection',
              pzMarkup: 15,
              pzPaymentTermsDays: 7,
              supplierPaymentTermsDays: 14
          };
          this.customers.push(newCust);
          return newCust;
      }
      return null;
  }

  sendOnboardingComms(id: string) {
      const c = this.customers.find(cust => cust.id === id);
      if (c) c.connectionStatus = 'Pricing Pending';
  }

  // DRIVERS & PACKERS
  getDrivers(whId: string) { return this.drivers.filter(d => d.wholesalerId === whId); }
  addDriver(d: Driver) { this.drivers.push(d); }
  getPackers(whId: string) { return this.packers.filter(p => p.wholesalerId === whId); }
  addPacker(p: Packer) { this.packers.push(p); }

  getDriverOrders(driverId: string) {
      const driver = this.drivers.find(d => d.id === driverId);
      return this.orders.filter(o => o.status === 'Shipped' && o.logistics?.driverName === driver?.name);
  }

  getPackerOrders(packerId: string) {
      const packer = this.packers.find(p => p.id === packerId);
      return this.orders.filter(o => o.status === 'Confirmed');
  }

  // INTERNAL HELPER FOR DEMO DASHBOARD
  getRepCustomers(repId: string) { return this.customers.filter(c => c.assignedPzRepId === repId); }
  getRepIssues(repId: string) { 
      const myCustIds = this.getRepCustomers(repId).map(c => c.id);
      return this.orders.filter(o => myCustIds.includes(o.buyerId) && o.issue);
  }
  getRepStats(repId: string) {
      const myCustomers = this.getRepCustomers(repId);
      const myCustIds = myCustomers.map(c => c.id);
      const myOrders = this.orders.filter(o => myCustIds.includes(o.buyerId));
      
      const rep = this.users.find(u => u.id === repId);
      const rate = (rep?.commissionRate || 5) / 100;
      
      const commissionMade = myOrders.filter(o => o.paymentStatus === 'Paid').reduce((sum, o) => sum + (o.totalAmount * rate), 0);
      const commissionComing = myOrders.filter(o => o.paymentStatus !== 'Paid').reduce((sum, o) => sum + (o.totalAmount * rate), 0);
      
      return {
          totalSales: myOrders.reduce((sum, o) => sum + o.totalAmount, 0),
          commissionMade,
          commissionComing,
          customerCount: myCustomers.length,
          orders: myOrders
      };
  }

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
      return order;
  }

  createInstantOrder(buyerId: string, item: InventoryItem, qty: number, price: number) {
      const order: Order = {
          id: `o-ins-${Date.now()}`,
          buyerId,
          sellerId: item.ownerId,
          items: [{ productId: item.productId, quantityKg: qty, pricePerKg: price }],
          totalAmount: (qty * price) + (item.logisticsPrice || 0),
          status: 'Confirmed',
          date: new Date().toISOString(),
          paymentStatus: 'Unpaid',
          supplierPayoutStatus: 'Pending',
          source: 'Marketplace'
      };
      this.orders.push(order);
      return order;
  }

  uploadToDeli(data: any, businessName: string) {
      console.log(`Synced ${data.productName} to The Deli storefront for ${businessName}`);
  }
}

export const mockService = new MockDataService();
