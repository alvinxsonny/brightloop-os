import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting BrightLoop OS Database Seeding...");

  // Clear existing records in cascade order
  await prisma.payment.deleteMany();
  await prisma.invoiceLine.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.subscriptionLine.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.templateLine.deleteMany();
  await prisma.quotationTemplate.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.plan.deleteMany();
  await prisma.taxRule.deleteMany();
  await prisma.discountRule.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("Password@123", 10);

  // 1. Seed Users
  console.log("👤 Creating Users (Admin, Staff, Customer)...");
  const admin = await prisma.user.create({
    data: {
      name: "Alex Sterling (Admin)",
      email: "admin@brightloop.io",
      password: hashedPassword,
      role: "ADMIN",
      company: "Brightloop Software HQ",
      phone: "+1 (555) 019-2834",
      address: "100 Innovation Way, Suite 400, San Francisco, CA",
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: "Sarah Jenkins (Staff)",
      email: "staff@brightloop.io",
      password: hashedPassword,
      role: "STAFF",
      company: "Brightloop Software HQ",
      phone: "+1 (555) 019-5829",
      address: "100 Innovation Way, Suite 400, San Francisco, CA",
    },
  });

  const customerAcme = await prisma.user.create({
    data: {
      name: "Marcus Vance",
      email: "customer@acme.com",
      password: hashedPassword,
      role: "CUSTOMER",
      company: "Acme Industrial Technologies Ltd",
      phone: "+1 (555) 482-9912",
      address: "742 Evergreen Terrace, Springfield, OR",
    },
  });

  const customerBakery = await prisma.user.create({
    data: {
      name: "Elena Rostova",
      email: "shop@localbakery.com",
      password: hashedPassword,
      role: "CUSTOMER",
      company: "Golden Crust Artisan Bakery",
      phone: "+1 (555) 781-3049",
      address: "12 Harbor View Rd, Portland, ME",
    },
  });

  // 2. Seed Tax Rules
  console.log("🏛️ Creating Tax Rules...");
  const taxStandard = await prisma.taxRule.create({
    data: {
      name: "GST Standard (18%)",
      rate: 18.0,
      isDefault: true,
      description: "Standard Goods & Services Tax applicable to software licenses",
    },
  });

  const taxVat = await prisma.taxRule.create({
    data: {
      name: "EU VAT (10%)",
      rate: 10.0,
      isDefault: false,
      description: "Value Added Tax for cross-border digital services",
    },
  });

  const taxZero = await prisma.taxRule.create({
    data: {
      name: "Zero Tax (Export)",
      rate: 0.0,
      isDefault: false,
      description: "Zero-rated export tax exemption",
    },
  });

  // 3. Seed Discount Rules
  console.log("🎟️ Creating Discount Rules...");
  const discVolume = await prisma.discountRule.create({
    data: {
      code: "VOLUME10",
      name: "Volume 10% Off (5+ Seats)",
      type: "PERCENTAGE",
      value: 10.0,
      minQuantity: 5,
      appliesTo: "SUBSCRIPTION",
      isActive: true,
      timesUsed: 3,
    },
  });

  const discEnterprise = await prisma.discountRule.create({
    data: {
      code: "ENTERPRISE20",
      name: "Enterprise 20% Off ($5,000+)",
      type: "PERCENTAGE",
      value: 20.0,
      minPurchaseAmount: 5000.0,
      appliesTo: "SUBSCRIPTION",
      isActive: true,
      timesUsed: 1,
    },
  });

  const discFlat = await prisma.discountRule.create({
    data: {
      code: "LAUNCH100",
      name: "Launch Special $100 Flat",
      type: "FIXED",
      value: 100.0,
      minPurchaseAmount: 1000.0,
      appliesTo: "SUBSCRIPTION",
      isActive: true,
      timesUsed: 5,
    },
  });

  // 4. Seed Products and Variants
  console.log("📦 Creating Products & Variants (with +560 Odoo surcharge)...");
  const prodErp = await prisma.product.create({
    data: {
      name: "BrightLoop ERP Core",
      type: "SOFTWARE",
      salesPrice: 1200.0,
      costPrice: 300.0,
      notes: "Autonomous subscription & resource management core system",
    },
  });

  const varStandard = await prisma.productVariant.create({
    data: {
      productId: prodErp.id,
      name: "Standard Edition",
      surcharge: 0.0,
      sku: "BL-ERP-STD",
    },
  });

  const varOdoo = await prisma.productVariant.create({
    data: {
      productId: prodErp.id,
      name: "Odoo Brand Integration",
      surcharge: 560.0, // Explicitly +560 surcharge as required in problem statement
      sku: "BL-ERP-ODOO-560",
    },
  });

  const prodMultiEntity = await prisma.product.create({
    data: {
      name: "Multi-Entity Consolidation Add-on",
      type: "ADDON",
      salesPrice: 350.0,
      costPrice: 50.0,
      notes: "Consolidate ledgers and multi-currency billing across subsidiaries",
    },
  });

  const prodSupport = await prisma.product.create({
    data: {
      name: "Dedicated Cloud SLA Support",
      type: "SERVICE",
      salesPrice: 500.0,
      costPrice: 150.0,
      notes: "24/7 dedicated support engineer and 15-minute SLA guarantee",
    },
  });

  const prodApiSeat = await prisma.product.create({
    data: {
      name: "High-Frequency API Sync Seat",
      type: "ADDON",
      salesPrice: 80.0,
      costPrice: 12.0,
      notes: "10,000 automated webhook events per hour per seat",
    },
  });

  // 5. Seed Plans
  console.log("📅 Creating Plans (Monthly, Yearly, Weekly, Daily)...");
  const planMonthly = await prisma.plan.create({
    data: {
      name: "Growth Monthly",
      description: "Full billing lifecycle, ideal for rapidly growing businesses",
      frequency: "MONTHLY",
      price: 1200.0,
      minQuantity: 1,
      allowPause: true,
      allowRenew: true,
      allowEarlyClose: true,
      autoClose: false,
    },
  });

  const planYearly = await prisma.plan.create({
    data: {
      name: "Enterprise Annual Contract",
      description: "Dedicated account manager, customized billing terms, volume pricing",
      frequency: "YEARLY",
      price: 12000.0,
      minQuantity: 5,
      allowPause: true,
      allowRenew: true,
      allowEarlyClose: true,
      autoClose: false,
    },
  });

  const planWeekly = await prisma.plan.create({
    data: {
      name: "Pilot Sprint Weekly",
      description: "7-day evaluation period with automated cutoff",
      frequency: "WEEKLY",
      price: 350.0,
      minQuantity: 1,
      allowPause: false,
      allowRenew: true,
      allowEarlyClose: true,
      autoClose: true,
    },
  });

  // 6. Seed Quotation Templates
  console.log("📝 Creating Quotation Templates...");
  const quoteTemplate = await prisma.quotationTemplate.create({
    data: {
      name: "Enterprise ERP + Odoo Package Template",
      description: "Pre-configured bundle for medium & enterprise clients requiring Odoo sync",
      validityDays: 30,
      planId: planMonthly.id,
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: varOdoo.id,
            quantity: 5,
            unitPrice: 1200.0,
            discountPercent: 10.0,
          },
          {
            productId: prodMultiEntity.id,
            quantity: 1,
            unitPrice: 350.0,
            discountPercent: 0.0,
          },
          {
            productId: prodSupport.id,
            quantity: 1,
            unitPrice: 500.0,
            discountPercent: 0.0,
          },
        ],
      },
    },
  });

  // 7. Seed Active Subscriptions & Invoices
  console.log("⚡ Creating Sample Subscriptions & Invoices...");
  const now = new Date();
  const past30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const past45Days = new Date(Date.now() - 45 * 24 * 60 * 60 * 1000);
  const past15Days = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
  const future30Days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  const oneYearFromNow = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

  // Subscription 1: Acme Enterprise (Active, Odoo variant included)
  const subAcme = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0001",
      customerId: customerAcme.id,
      planId: planYearly.id,
      status: "ACTIVE",
      startDate: past30Days,
      expiryDate: oneYearFromNow,
      nextBillingDate: future30Days,
      lastBilledDate: past30Days,
      paymentTerms: "NET30",
      subtotal: 9300.0,
      taxAmount: 1674.0,
      discountAmount: 0.0,
      totalAmount: 10974.0,
      notes: "Annual enterprise contract with Odoo sync and 24/7 dedicated support",
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: varOdoo.id,
            quantity: 5,
            unitPrice: 1200.0,
            variantSurcharge: 560.0,
            taxRate: 18.0,
            taxAmount: 1584.0,
            subtotal: 8800.0,
            total: 10384.0,
          },
          {
            productId: prodSupport.id,
            quantity: 1,
            unitPrice: 500.0,
            variantSurcharge: 0.0,
            taxRate: 18.0,
            taxAmount: 90.0,
            subtotal: 500.0,
            total: 590.0,
          },
        ],
      },
    },
  });

  // Invoice 1: Acme's paid initial invoice
  const invAcmePaid = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0001",
      subscriptionId: subAcme.id,
      customerId: customerAcme.id,
      status: "PAID",
      issueDate: past30Days,
      dueDate: past15Days,
      periodStart: past30Days,
      periodEnd: future30Days,
      subtotal: 9300.0,
      taxAmount: 1674.0,
      discountAmount: 0.0,
      totalAmount: 10974.0,
      paidAmount: 10974.0,
      balanceDue: 0.0,
      notes: "Paid in full via Bank Wire Transfer",
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: varOdoo.id,
            description: "BrightLoop ERP Core (Odoo Brand Integration) x 5",
            quantity: 5,
            unitPrice: 1200.0,
            variantSurcharge: 560.0,
            subtotal: 8800.0,
            taxAmount: 1584.0,
            total: 10384.0,
          },
          {
            productId: prodSupport.id,
            description: "Dedicated Cloud SLA Support x 1",
            quantity: 1,
            unitPrice: 500.0,
            variantSurcharge: 0.0,
            subtotal: 500.0,
            taxAmount: 90.0,
            total: 590.0,
          },
        ],
      },
      payments: {
        create: {
          paymentNumber: "PAY-2026-0001",
          amount: 10974.0,
          paymentMethod: "BANK_TRANSFER",
          paymentDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
          transactionReference: "WIRE-ACH-8893129",
          notes: "Wire received from Acme Treasury",
        },
      },
    },
  });

  // Subscription 2: Local Bakery (Active, Next Billing Date is TODAY, so automated billing engine can pick it up!)
  const subBakery = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0002",
      customerId: customerBakery.id,
      planId: planMonthly.id,
      status: "ACTIVE",
      startDate: past30Days,
      expiryDate: future30Days,
      nextBillingDate: now, // Due right now for billing engine simulation!
      lastBilledDate: past30Days,
      paymentTerms: "NET15",
      subtotal: 1200.0,
      taxAmount: 216.0,
      discountAmount: 0.0,
      totalAmount: 1416.0,
      notes: "Single bakery outlet standard license",
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: varStandard.id,
            quantity: 1,
            unitPrice: 1200.0,
            variantSurcharge: 0.0,
            taxRate: 18.0,
            taxAmount: 216.0,
            subtotal: 1200.0,
            total: 1416.0,
          },
        ],
      },
    },
  });

  // Invoice 2: Overdue invoice for Local Bakery! (Due date 15 days ago, unpaid!)
  const invBakeryOverdue = await prisma.invoice.create({
    data: {
      invoiceNumber: "INV-2026-0002",
      subscriptionId: subBakery.id,
      customerId: customerBakery.id,
      status: "CONFIRMED",
      issueDate: past45Days,
      dueDate: past15Days, // Overdue by 15 days!
      periodStart: past45Days,
      periodEnd: past15Days,
      subtotal: 1200.0,
      taxAmount: 216.0,
      discountAmount: 0.0,
      totalAmount: 1416.0,
      paidAmount: 0.0,
      balanceDue: 1416.0, // Fully overdue!
      notes: "Invoice overdue. Reminder sent on Day 7.",
      lines: {
        create: [
          {
            productId: prodErp.id,
            variantId: varStandard.id,
            description: "BrightLoop ERP Core (Standard Edition) x 1",
            quantity: 1,
            unitPrice: 1200.0,
            variantSurcharge: 0.0,
            subtotal: 1200.0,
            taxAmount: 216.0,
            total: 1416.0,
          },
        ],
      },
    },
  });

  // Subscription 3: Draft/Quotation for demonstration
  const subDraft = await prisma.subscription.create({
    data: {
      subscriptionNumber: "SUB-2026-0003",
      customerId: customerAcme.id,
      planId: planWeekly.id,
      status: "QUOTATION",
      startDate: now,
      expiryDate: future30Days,
      nextBillingDate: now,
      paymentTerms: "IMMEDIATE",
      subtotal: 350.0,
      taxAmount: 63.0,
      discountAmount: 0.0,
      totalAmount: 413.0,
      notes: "Quotation for upcoming Sprint Pilot testing",
      lines: {
        create: [
          {
            productId: prodMultiEntity.id,
            quantity: 1,
            unitPrice: 350.0,
            variantSurcharge: 0.0,
            taxRate: 18.0,
            taxAmount: 63.0,
            subtotal: 350.0,
            total: 413.0,
          },
        ],
      },
    },
  });

  console.log("✅ Seeding completed successfully!");
  console.log("--------------------------------------------------");
  console.log("🔑 Default Test Credentials:");
  console.log("   Admin:    admin@brightloop.io     / Password@123");
  console.log("   Staff:    staff@brightloop.io     / Password@123");
  console.log("   Customer: customer@acme.com       / Password@123");
  console.log("   Customer: shop@localbakery.com    / Password@123");
  console.log("--------------------------------------------------");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
