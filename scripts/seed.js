//import  * as pool  from '../app/lib/db.js';
//const { db } = require('@vercel/postgres');

const db = require('../app/lib/db.js');

const {
  invoices,
  customers,
  revenue,
  users,
} = require('../app/lib/placeholder-data.js');
const bcrypt = require('bcrypt');



async function seedUsers() {
  var createTable = null;
  var insertedUsers = null;
  db.connect(async (err, client, done) => {
    if (err) throw err;
    try {
      client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log('uuid-ossp criado');
        }
      });

      createTable = client.query(`
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );`, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log('users criado');
        }
      });

      // Insert data into the "users" table
      insertedUsers = await Promise.all(
        users.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return client.query(`
              INSERT INTO users (id, name, email, password)
              VALUES ($1, $2, $3, $4)
              ON CONFLICT (id) DO NOTHING;`, [user.id, user.name, user.email, hashedPassword], (err, res) => {
            if (err) {
              // We can just console.log any errors
              console.log(err.stack);
            } else {
              console.log('user criado');
            }
          });
        }),
      );


    } finally {
      done();
    }
  });

  return {
    createTable,
    users: insertedUsers,
  };
}

async function seedInvoices() {
  db.connect(async (err, client, done) => {
    if (err) throw err;
    try {

      client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log('uuid-ossp criado');
        }
      });

      createTable = client.query(`
            CREATE TABLE IF NOT EXISTS invoices (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            customer_id UUID NOT NULL,
            amount INT NOT NULL,
            status VARCHAR(255) NOT NULL,
            date DATE NOT NULL
          );
        `, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log('Created "invoices" table');
        }
      });


      // Insert data into the "invoices" table
      insertedUsers = await Promise.all(
        users.map(async (user) => {
          const hashedPassword = await bcrypt.hash(user.password, 10);
          return client.query(`
        INSERT INTO users (id, name, email, password)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;`, [user.id, user.name, user.email, hashedPassword], (err, res) => {
            if (err) {
              // We can just console.log any errors
              console.log(err.stack);
            } else {
              console.log('user criado');
            }
          });
        }),
      );

      const insertedInvoices = await Promise.all(
        invoices.map(
          (invoice) => client.query(`
        INSERT INTO invoices (customer_id, amount, status, date)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `, [invoice.customer_id, invoice.amount, invoice.status, invoice.date], (err, res) => {
            if (err) {
              // We can just console.log any errors
              console.log(err.stack);
            } else {
              console.log('inserting invoices');
            }
          }),
        ),
      );
      console.log(`Seeded ${insertedInvoices.length} invoices`);

      return {
        createTable,
        invoices: insertedInvoices,
      };
    } finally {
      done();
    }
  });
}

async function seedCustomers() {
  db.connect(async (err, client, done) => {
    if (err) throw err;
    try {

      client.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log('uuid-ossp criado');
        }
      });

      // Create the "customers" table if it doesn't exist
      createTable = client.query(`
    CREATE TABLE IF NOT EXISTS customers (
      id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL
    );
  `, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log(`Created "customers" table`);
        }
      });

      // Insert data into the "customers" table
      const insertedCustomers = await Promise.all(
        customers.map(
          (customer) => client.query(`
        INSERT INTO customers (id, name, email, image_url)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO NOTHING;
      `, [customer.id, customer.name, customer.email, customer.image_url], (err, res) => {
            if (err) {
              // We can just console.log any errors
              console.log(err.stack);
            } else {
              console.log('inserting customers');
            }
          }),
        ),
      );

      console.log(`Seeded ${insertedCustomers.length} customers`);

      return {
        createTable,
        customers: insertedCustomers,
      };

    } finally {
      done();
    }
  });
}

async function seedRevenue() {
  db.connect(async (err, client, done) => {
    if (err) throw err;
    try {

      // Create the "revenue" table if it doesn't exist
      createTable = client.query(`
      CREATE TABLE IF NOT EXISTS revenue (
        month VARCHAR(4) NOT NULL UNIQUE,
        revenue INT NOT NULL
      );
    `, (err, res) => {
        if (err) {
          // We can just console.log any errors
          console.log(err.stack);
        } else {
          console.log(`Created "revenue" table`);
        }
      });


      // Insert data into the "revenue" table
      const insertedRevenue = await Promise.all(
        revenue.map(
          (rev) => client.query(`
        INSERT INTO revenue (month, revenue)
        VALUES ($1, $2)
        ON CONFLICT (month) DO NOTHING;
      `, [rev.month, rev.revenue], (err, res) => {
            if (err) {
              // We can just console.log any errors
              console.log(err.stack);
            } else {
              console.log('inserting revenue');
            }
          }),
        ),
      );

      console.log(`Seeded ${insertedRevenue.length} revenue`);

      return {
        createTable,
        revenue: insertedRevenue,
      };
    } finally {
      done();
    }
  });
}

/*
async function main() {
  const client = await db.connect();
  //const client = query;
  try {
    await client.query('BEGIN');
    await seedUsers(client);
    await seedCustomers(client);
    await seedInvoices(client);
    await seedRevenue(client);
    await client.query('COMMIT');
  } finally {
    client.release();
  }
  //await client.end();
}

main().catch(async (err) => {
  console.log('erro: ' +  err)
  await client.query('ROLLBACK');
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});
*/

async function main() {
  await seedUsers();
  await seedCustomers();
  await seedInvoices();
  await seedRevenue();
}

main().catch(async (err) => {
  console.log('erro: ' + err)
  console.error(
    'An error occurred while attempting to seed the database:',
    err,
  );
});