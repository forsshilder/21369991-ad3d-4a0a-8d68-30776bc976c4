import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly databaseService: DatabaseService) { }

  async findAllPaginated(page: number, pageSize: number, search?: string) {
    const client = this.databaseService.getClient();
    const offset = (page - 1) * pageSize;

    let query = 'SELECT * FROM users';
    let countQuery = 'SELECT COUNT(*) FROM users';
    const queryParams = [];
    const countParams = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR email ILIKE $1';
      countQuery += ' WHERE name ILIKE $1 OR email ILIKE $1';
      queryParams.push(`%${search}%`);
      countParams.push(`%${search}%`);
    }
    if (page && pageSize) {
      query += ` ORDER BY id LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}`;
      queryParams.push(pageSize, offset);
    } else {
      query += ' ORDER BY id';
    }

    const dataResult = await client.query(query, queryParams);
    const countResult = await client.query(countQuery, countParams);

    const totalRows = parseInt(countResult.rows[0].count, 10);
    const totalPages = Math.ceil(totalRows / pageSize);

    return {
      data: dataResult.rows,
      totalRows,
      totalPages,
      currentPage: page,
      pageSize,
    };
  }


  async findOne(id: number) {
    const client = this.databaseService.getClient();
    const result = await client.query('SELECT * FROM users WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return result.rows[0];
  }

  async deleteOne(id: number) {
    const client = this.databaseService.getClient();
    const user = await this.findOne(id);
    await client.query('DELETE FROM users WHERE id = $1', [id]);

    return { message: `User with ID ${id} deleted successfully`, user };
  }


  async saveUser(data: any) {
    const client = this.databaseService.getClient();
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const result = await client.query(
      `
      INSERT INTO users (name, surname, email, password, phone, age, country, district, role)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
      `,
      [
        data.name,
        data.surname,
        data.email,
        hashedPassword,
        data.phone,
        data.age,
        data.country,
        data.district,
        data.role,
      ],
    );

    return result.rows[0];
  }

  async updateUser(data: any) {
    const client = this.databaseService.getClient();
    const hashedPassword = data.password ? await bcrypt.hash(data.password, 10) : null;

    const result = await client.query(
      `
      UPDATE users
      SET
        name = COALESCE($1, name),
        surname = COALESCE($2, surname),
        email = COALESCE($3, email),
        password = COALESCE($4, password),
        phone = COALESCE($5, phone),
        age = COALESCE($6, age),
        country = COALESCE($7, country),
        district = COALESCE($8, district),
        role = COALESCE($9, role),
        updatedAt = CURRENT_TIMESTAMP
      WHERE id = $10
      RETURNING *;
      `,
      [
        data.name,
        data.surname,
        data.email,
        hashedPassword,
        data.phone,
        data.age,
        data.country,
        data.district,
        data.role,
        data.id,
      ],
    );

    if (result.rowCount === 0) {
      throw new NotFoundException(`User with ID ${data.id} not found`);
    }

    return result.rows[0];
  }
}
