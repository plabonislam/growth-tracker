import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema/index';
import { clubsTable, usersTable } from './schema/index';

const FAKE_USERS = [
  {
    name: 'Aarav Sharma',
    email: 'aarav.sharma@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Aisha Rahman',
    email: 'aisha.rahman@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Akash Patel',
    email: 'akash.patel@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Amara Okafor',
    email: 'amara.okafor@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Amit Verma',
    email: 'amit.verma@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Ananya Das',
    email: 'ananya.das@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Arjun Mehta',
    email: 'arjun.mehta@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Ayesha Khan',
    email: 'ayesha.khan@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Bashir Ahmed',
    email: 'bashir.ahmed@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Bilal Hussain',
    email: 'bilal.hussain@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Chioma Eze',
    email: 'chioma.eze@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Daniel Nguyen',
    email: 'daniel.nguyen@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Deepak Singh',
    email: 'deepak.singh@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Divya Nair',
    email: 'divya.nair@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Elena Petrov',
    email: 'elena.petrov@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Emeka Obi',
    email: 'emeka.obi@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Fatima Al-Hassan',
    email: 'fatima.alhassan@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Farhan Hossain',
    email: 'farhan.hossain@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Gabriela Santos',
    email: 'gabriela.santos@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Hamid Rezaei',
    email: 'hamid.rezaei@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Hannah Kim',
    email: 'hannah.kim@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Hassan Omar',
    email: 'hassan.omar@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Imran Chowdhury',
    email: 'imran.chowdhury@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Isabel Ferreira',
    email: 'isabel.ferreira@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Ishaan Gupta',
    email: 'ishaan.gupta@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Ivan Sokolov',
    email: 'ivan.sokolov@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Jamal Williams',
    email: 'jamal.williams@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Jasmine Tran',
    email: 'jasmine.tran@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Jin-ho Park',
    email: 'jinho.park@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Karan Malhotra',
    email: 'karan.malhotra@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Kavya Reddy',
    email: 'kavya.reddy@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Kenji Watanabe',
    email: 'kenji.watanabe@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Khalid Mansour',
    email: 'khalid.mansour@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Kofi Asante',
    email: 'kofi.asante@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Layla Al-Amin',
    email: 'layla.alamin@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Lena Fischer',
    email: 'lena.fischer@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: "Liam O'Brien",
    email: 'liam.obrien@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Lucas Oliveira',
    email: 'lucas.oliveira@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Mei-Ling Chen',
    email: 'meiling.chen@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Mohamed Salah',
    email: 'mohamed.salah@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Mia Johansson',
    email: 'mia.johansson@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Mihail Popescu',
    email: 'mihail.popescu@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Nadia Kowalski',
    email: 'nadia.kowalski@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Nandini Iyer',
    email: 'nandini.iyer@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Ngozi Adeyemi',
    email: 'ngozi.adeyemi@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Nikhil Joshi',
    email: 'nikhil.joshi@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Noah Andersen',
    email: 'noah.andersen@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Omar Farouq',
    email: 'omar.farouq@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Pham Thi Lan',
    email: 'pham.thilan@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Priya Krishnan',
    email: 'priya.krishnan@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Rahul Bose',
    email: 'rahul.bose@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Rania Aziz',
    email: 'rania.aziz@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Rashida Mensah',
    email: 'rashida.mensah@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Ravi Shankar',
    email: 'ravi.shankar@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Rohan Kapoor',
    email: 'rohan.kapoor@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Sakura Yamamoto',
    email: 'sakura.yamamoto@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Samuel Bekele',
    email: 'samuel.bekele@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Sara Lindqvist',
    email: 'sara.lindqvist@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Shahnur Islam',
    email: 'shahnur.islam@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Shreya Pillai',
    email: 'shreya.pillai@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Sofia Rossi',
    email: 'sofia.rossi@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Sonia Mbeki',
    email: 'sonia.mbeki@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Soren Nielsen',
    email: 'soren.nielsen@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Suresh Babu',
    email: 'suresh.babu@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Tanvir Ahmed',
    email: 'tanvir.ahmed@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Tariq Siddiqui',
    email: 'tariq.siddiqui@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Tunde Adebayo',
    email: 'tunde.adebayo@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Uma Venkatesh',
    email: 'uma.venkatesh@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Valentina Cruz',
    email: 'valentina.cruz@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Vikram Bhatia',
    email: 'vikram.bhatia@dsinnovators.com',
    isAuthority: false,
  },
  { name: 'Wei Zhang', email: 'wei.zhang@dsinnovators.com', isAuthority: true },
  {
    name: 'Wanjiru Kamau',
    email: 'wanjiru.kamau@dsinnovators.com',
    isAuthority: false,
  },
  { name: 'Xia Liu', email: 'xia.liu@dsinnovators.com', isAuthority: false },
  {
    name: 'Yaw Darko',
    email: 'yaw.darko@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Yuki Tanaka',
    email: 'yuki.tanaka@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Zainab Suleiman',
    email: 'zainab.suleiman@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Zara Malik',
    email: 'zara.malik@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Zhen Wang',
    email: 'zhen.wang@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Abebe Girma',
    email: 'abebe.girma@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Aditi Bhatt',
    email: 'aditi.bhatt@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Alinta Watson',
    email: 'alinta.watson@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Amina Diallo',
    email: 'amina.diallo@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Andile Dlamini',
    email: 'andile.dlamini@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Baraka Njoroge',
    email: 'baraka.njoroge@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Chloe Dubois',
    email: 'chloe.dubois@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Diego Morales',
    email: 'diego.morales@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Elif Yilmaz',
    email: 'elif.yilmaz@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Femi Okonkwo',
    email: 'femi.okonkwo@dsinnovators.com',
    isAuthority: false,
  },
  { name: 'Gao Yan', email: 'gao.yan@dsinnovators.com', isAuthority: false },
  {
    name: 'Hana Tanaka',
    email: 'hana.tanaka@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Ibrahima Bah',
    email: 'ibrahima.bah@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Jana Novak',
    email: 'jana.novak@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Kwame Mensah',
    email: 'kwame.mensah@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Leila Nazari',
    email: 'leila.nazari@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Marco Ricci',
    email: 'marco.ricci@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Nina Eriksson',
    email: 'nina.eriksson@dsinnovators.com',
    isAuthority: true,
  },
  {
    name: 'Olumide Adeyinka',
    email: 'olumide.adeyinka@dsinnovators.com',
    isAuthority: false,
  },
  {
    name: 'Pilar Vega',
    email: 'pilar.vega@dsinnovators.com',
    isAuthority: false,
  },
  { name: 'Qing Li', email: 'qing.li@dsinnovators.com', isAuthority: false },
];

const FAKE_CLUBS = [
  {
    name: 'Web Development Club',
    coordinatorEmail: 'aarav.sharma@dsinnovators.com',
  },
  {
    name: 'Data Science Club',
    coordinatorEmail: 'amara.okafor@dsinnovators.com',
  },
  {
    name: 'DevOps & Cloud Club',
    coordinatorEmail: 'arjun.mehta@dsinnovators.com',
  },
  { name: 'Mobile App Club', coordinatorEmail: 'chioma.eze@dsinnovators.com' },
  {
    name: 'AI & Machine Learning Club',
    coordinatorEmail: 'elena.petrov@dsinnovators.com',
  },
  {
    name: 'Cybersecurity Club',
    coordinatorEmail: 'gabriela.santos@dsinnovators.com',
  },
  {
    name: 'Open Source Club',
    coordinatorEmail: 'imran.chowdhury@dsinnovators.com',
  },
  {
    name: 'UI/UX Design Club',
    coordinatorEmail: 'jasmine.tran@dsinnovators.com',
  },
  {
    name: 'Blockchain Club',
    coordinatorEmail: 'kenji.watanabe@dsinnovators.com',
  },
  {
    name: 'Game Development Club',
    coordinatorEmail: 'lena.fischer@dsinnovators.com',
  },
];

export async function seed(
  db: NodePgDatabase<typeof schema>,
  authorityEmail: string,
): Promise<void> {
  // seed users
  const users = FAKE_USERS.map((u) => ({
    ...u,
    avatarUrl: null as string | null,
    isAuthority: u.email === authorityEmail ? true : u.isAuthority,
  }));

  await db
    .insert(usersTable)
    .values(users)
    .onConflictDoUpdate({
      target: usersTable.email,
      set: { isAuthority: usersTable.isAuthority },
    });

  const authorityCount = users.filter((u) => u.isAuthority).length;
  console.log(
    `seed: inserted/updated ${users.length} users (${authorityCount} authority, ${users.length - authorityCount} members)`,
  );

  // seed clubs
  for (const club of FAKE_CLUBS) {
    const [coordinator] = await db
      .select({ id: usersTable.id })
      .from(usersTable)
      .where(eq(usersTable.email, club.coordinatorEmail))
      .limit(1);

    if (!coordinator) {
      console.warn(
        `seed: coordinator not found for club "${club.name}" — skipping`,
      );
      continue;
    }

    await db
      .insert(clubsTable)
      .values({ name: club.name, coordinatorId: coordinator.id })
      .onConflictDoNothing();
  }

  console.log(`seed: inserted ${FAKE_CLUBS.length} clubs`);
}

// standalone entrypoint — only runs when executed directly via db:seed script
if (require.main === module) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const db = drizzle(pool, { schema });
  seed(db, process.env.SEED_EMAIL!)
    .then(() => pool.end())
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
