import { PrismaClient, SegmentType } from '@prisma/client';
import { faker } from '@faker-js/faker';
import { HabbitDTO } from 'src/simulation/habbit.dto';

const prisma = new PrismaClient();

const SIM_START_DATE = new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 120);

function daysBeforeStart(days: number): Date {
  const d = new Date(SIM_START_DATE);
  d.setDate(d.getDate() - days);
  return d;
}

function randomBetween(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateHabbits(): HabbitDTO {
  const roll = Math.random();
  
  if (roll < 0.3) {
    // high spender - likely to hit VIP
    return {
      spendFrequencyMultiplier: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)), // 1.5 - 2.0
      spendAmountMultiplier: parseFloat((Math.random() * 0.5 + 1.5).toFixed(2)),    // 1.5 - 2.0
    };
  } else if (roll < 0.6) {
    // average spender
    return {
      spendFrequencyMultiplier: parseFloat((Math.random() * 0.4 + 0.8).toFixed(2)), // 0.8 - 1.2
      spendAmountMultiplier: parseFloat((Math.random() * 0.4 + 0.8).toFixed(2)),    // 0.8 - 1.2
    };
  } else {
    // low/infrequent spender - likely to drift into risk group
    return {
      spendFrequencyMultiplier: parseFloat((Math.random() * 0.3 + 0.1).toFixed(2)), // 0.1 - 0.4
      spendAmountMultiplier: parseFloat((Math.random() * 0.5 + 0.5).toFixed(2)),    // 0.5 - 1.0
    };
  }
}

async function main() {
  console.log('🌱 Seeding...');

  // cleanup in correct order
  await prisma.deltaLog.deleteMany();
  await prisma.segmentMembership.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.segment.deleteMany();
  await prisma.user.deleteMany();

  // ─── USERS ───────────────────────────────────────────
  const users = await Promise.all(
    Array.from({ length: 500 }).map((_, i) => {
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email: faker.internet.email(),
          createdAt: daysBeforeStart(randomBetween(30, 120)),
          habits: generateHabbits() as object,
        },
      });
    })
  );

  console.log(`✅ Created ${users.length} users`);

  // ─── TRANSACTIONS ─────────────────────────────────────
  // split users into 3 groups
  const veryActive = users.slice(0, 150);    // 30% - recent transactions
  const somewhatActive = users.slice(150, 350); // 40% - older transactions
  const inactive = users.slice(350);         // 30% - no recent transactions

  // very active: 5-15 transactions in last 30 days
  for (const user of veryActive) {
    const count = randomBetween(5, 15);
    for (let i = 0; i < count; i++) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: randomBetween(100, 1500),
          createdAt: daysBeforeStart(randomBetween(0, 29)),
        },
      });
    }
  }

  // somewhat active: 1-3 transactions between 31-90 days ago
  for (const user of somewhatActive) {
    const count = randomBetween(1, 3);
    for (let i = 0; i < count; i++) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: randomBetween(50, 800),
          createdAt: daysBeforeStart(randomBetween(31, 90)),
        },
      });
    }
  }

  // inactive: last transaction was 91-180 days ago
  // but they were active before (needed for risk group segment)
  for (const user of inactive) {
    const count = randomBetween(1, 5);
    for (let i = 0; i < count; i++) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: randomBetween(50, 500),
          createdAt: daysBeforeStart(randomBetween(91, 180)),
        },
      });
    }
  }

  console.log(`✅ Created transactions`);

  // ─── SEGMENTS ─────────────────────────────────────────
  const activeBuyers = await prisma.segment.create({
    data: {
      name: 'Active Buyers',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          {
            type: 'field',
            field: 'transactionCount',
            operator: 'greaterThan',
            value: 0,
            periodDays: 30,
          },
        ],
      },
    },
  });

  const vipClients = await prisma.segment.create({
    data: {
      name: 'VIP Clients',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          {
            type: 'field',
            field: 'totalSpend',
            operator: 'greaterThan',
            value: 5000,
            periodDays: 60,
          },
        ],
      },
    },
  });

  const riskGroup = await prisma.segment.create({
    data: {
      name: 'Risk Group',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          {
            type: 'field',
            field: 'daysSinceLastTransaction',
            operator: 'greaterThan',
            value: 90,
          },
          {
            type: 'field',
            field: 'transactionCount',
            operator: 'greaterThan',
            value: 0,
            periodDays: 365,
          },
        ],
      },
    },
  });

  // segment inside segment — VIP clients who are also in risk group
  const vipAtRisk = await prisma.segment.create({
    data: {
      name: 'VIP at Risk',
      type: SegmentType.DYNAMIC,
      rules: {
        operator: 'AND',
        conditions: [
          {
            type: 'segment',
            segmentId: vipClients.id,
            segmentName: vipClients.name
          },
          {
            type: 'segment',
            segmentId: riskGroup.id,
            segmentName: riskGroup.name
          },
        ],
      },
    },
  });

  console.log(`✅ Created dynamic segments`);

  // ─── STATIC SEGMENT ───────────────────────────────────
  // take first 100 very active users and freeze them
  const marchCampaign = await prisma.segment.create({
    data: {
      name: 'March Campaign Audience',
      type: SegmentType.STATIC,
      createdAt: daysBeforeStart(10),
    },
  });

  await prisma.segmentMembership.createMany({
    data: veryActive.slice(0, 100).map((user) => ({
      segmentId: marchCampaign.id,
      userId: user.id,
      addedAt: daysBeforeStart(10),
    })),
  });

  console.log(`✅ Created static segment with 100 frozen members`);

  console.log('🎉 Seed complete');
  console.log('Note: dynamic segment memberships will be populated on first evaluation');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });