import * as fs from 'fs';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private client: Client;

  async onModuleInit() {
    await this.initDatabase();
  }

  private async initDatabase() {
    const dbName = process.env.DB_NAME || 'usersdot';

    const adminClient = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '1410',
      database: 'postgres',
    });

    try {
      await adminClient.connect();

      const result = await adminClient.query(
        `SELECT 1 FROM pg_database WHERE datname = $1`,
        [dbName]
      );

      if (result.rowCount === 0) {
        console.log(`Database "${dbName}" does not exist. Creating...`);
        await adminClient.query(`CREATE DATABASE ${dbName}`);
        console.log(`Database "${dbName}" created successfully.`);
      } else {
        console.log(`Database "${dbName}" already exists.`);
      }
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    } finally {
      await adminClient.end();
    }


    this.client = new Client({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASS || '1410',
      database: dbName,
    });

    await this.client.connect();
    console.log(`Connected to database "${dbName}" successfully.`);


    await this.runMigrations();


    await this.seedMockData();
  }

  private async runMigrations() {
    const createTableSQL = fs.readFileSync(
      path.join(__dirname, '..', '..', 'src', 'database', 'migrations', 'create-user-table.sql'),
      'utf8',
    );
    await this.client.query(createTableSQL);
    console.log('Table migration completed.');
  }

  private async seedMockData() {
    const mockDataPath = path.join(__dirname, '..', '..', 'src', 'database', 'mock-data', 'users.mock.json');
    const mockUsers = JSON.parse(fs.readFileSync(mockDataPath, 'utf8'));

    for (const user of mockUsers) {

      const hashedPassword = await bcrypt.hash(user.password, 10);

      await this.client.query(
        `
        INSERT INTO users (name, surname, email, password, phone, age, country, district, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (email) DO NOTHING;
        `,
        [
          user.name,
          user.surname,
          user.email,
          hashedPassword,
          user.phone,
          user.age,
          user.country,
          user.district,
          user.role,
        ],
      );
    }

    console.log('Mock data seeded successfully with encrypted passwords.');
  }

  getClient(): Client {
    return this.client;
  }
}
