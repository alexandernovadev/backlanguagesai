import User from "../../db/models/User";
import { IUser } from "../../../../types/models";
import bcrypt from "bcryptjs";

import { Request } from "express";

export class UserService {
  // Listar usuarios con filtros y paginación
  async getUsers(filters: {
    page?: number;
    limit?: number;
    username?: string;
    email?: string;
    role?: string | string[];
    language?: string | string[];
    isActive?: string;
    createdAfter?: string;
    createdBefore?: string;
    updatedAfter?: string;
    updatedBefore?: string;
    phone?: string;
    address?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) {
    const {
      page = 1,
      limit = 10,
      username,
      email,
      role,
      language,
      isActive,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      phone,
      address,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = filters;

    const filter: Record<string, any> = {};

    if (username) filter.username = { $regex: username, $options: "i" };
    if (email) filter.email = { $regex: email, $options: "i" };
    if (role) {
      if (Array.isArray(role)) filter.role = { $in: role };
      else if (typeof role === "string" && role.includes(",")) filter.role = { $in: role.split(",") };
      else filter.role = role;
    }
    if (language) {
      if (Array.isArray(language)) filter.language = { $in: language };
      else if (typeof language === "string" && language.includes(",")) filter.language = { $in: language.split(",") };
      else filter.language = language;
    }
    if (isActive !== undefined) filter.isActive = isActive === "true";
    if (phone) filter.phone = { $regex: phone, $options: "i" };
    if (address) filter.address = { $regex: address, $options: "i" };

    // Fechas
    if (createdAfter || createdBefore) {
      const createdAtFilter: Record<string, Date> = {};
      if (createdAfter) createdAtFilter.$gte = new Date(createdAfter);
      if (createdBefore) createdAtFilter.$lte = new Date(createdBefore);
      filter.createdAt = createdAtFilter;
    }
    if (updatedAfter || updatedBefore) {
      const updatedAtFilter: Record<string, Date> = {};
      if (updatedAfter) updatedAtFilter.$gte = new Date(updatedAfter);
      if (updatedBefore) updatedAtFilter.$lte = new Date(updatedBefore);
      filter.updatedAt = updatedAtFilter;
    }

    const total = await User.countDocuments(filter);
    const pages = Math.ceil(total / limit);
    const sortDirection = sortOrder === "asc" ? 1 : -1;
    const sortOptions: Record<string, 1 | -1> = {};
    sortOptions[sortBy] = sortDirection;

    const data = await User.find(filter)
      .sort(sortOptions)
      .skip((page - 1) * limit)
      .limit(limit)
      .select("-password") // nunca enviar el password
      .exec();

    return { data, total, page, pages };
  }

  // Obtener usuario por ID
  async getUserById(id: string) {
    return User.findById(id).select("-password");
  }

  // Crear usuario
  async createUser(data: Partial<IUser> & { password: string }, req?: Request, performedBy?: string) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = new User({ ...data, password: hashedPassword });
    await user.save();
    

    
    return user.toObject();
  }

  // Editar usuario
  async updateUser(id: string, data: Partial<IUser> & { password?: string }, req?: Request, performedBy?: string) {
    const oldUser = await User.findById(id);
    if (!oldUser) return null;
    
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      delete data.password;
    }
    
    const user = await User.findByIdAndUpdate(id, data, { new: true }).select("-password");
    

    
    return user;
  }

  // Eliminar usuario
  async deleteUser(id: string, req?: Request, performedBy?: string) {
    const user = await User.findByIdAndDelete(id);
    

    
    return user;
  }

  // Export all users for backup/transfer
  async getAllUsersForExport(): Promise<IUser[]> {
    return (await User.find({})
      .select("-password") // Never export passwords
      .sort({ createdAt: -1 })
      .lean()
      .exec()) as unknown as IUser[];
  }

  // Import users from JSON data
  async importUsers(users: any[], config: {
    duplicateStrategy: 'skip' | 'overwrite' | 'error' | 'merge';
    batchSize?: number;
  }): Promise<{
    totalItems: number;
    totalInserted: number;
    totalUpdated: number;
    totalSkipped: number;
    totalErrors: number;
    batches: any[];
    summary: {
      success: boolean;
      message: string;
      duration: number;
    };
  }> {
    const startTime = Date.now();
    const batches: any[] = [];
    let totalInserted = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    const batchSize = config.batchSize || 10;

    for (let i = 0; i < users.length; i += batchSize) {
      const batchUsers = users.slice(i, i + batchSize);
      const batchIndex = Math.floor(i / batchSize);
      let batchInserted = 0;
      let batchUpdated = 0;
      let batchSkipped = 0;
      let batchErrors = 0;

      for (const userData of batchUsers) {
        try {
          // Check for duplicates by email
          const existingUser = await User.findOne({
            email: userData.email
          });

          if (existingUser) {
            switch (config.duplicateStrategy) {
              case 'error':
                batchErrors++;
                totalErrors++;
                break;
              case 'skip':
                batchSkipped++;
                totalSkipped++;
                break;
              case 'overwrite':
              case 'merge':
                // Remove _id and password to avoid conflicts
                const { _id, password, ...updateData } = userData;
                // Hash password if provided
                if (userData.password) {
                  updateData.password = await bcrypt.hash(userData.password, 10);
                }
                await User.findByIdAndUpdate(existingUser._id, updateData, { new: true });
                batchUpdated++;
                totalUpdated++;
                break;
            }
          } else {
            // Create new user
            const { _id, ...userDataWithoutId } = userData;
            // Hash password if provided
            if (userData.password) {
              userDataWithoutId.password = await bcrypt.hash(userData.password, 10);
            }
            const newUser = new User(userDataWithoutId);
            await newUser.save();
            batchInserted++;
            totalInserted++;
          }
        } catch (error) {
          batchErrors++;
          totalErrors++;
        }
      }

      batches.push({
        batchIndex,
        processed: batchUsers.length,
        inserted: batchInserted,
        updated: batchUpdated,
        skipped: batchSkipped,
        errors: batchErrors,
      });
    }

    const duration = Date.now() - startTime;
    return {
      totalItems: users.length,
      totalInserted,
      totalUpdated,
      totalSkipped,
      totalErrors,
      batches,
      summary: {
        success: totalErrors === 0,
        message: `Import completed. ${totalInserted} inserted, ${totalUpdated} updated, ${totalSkipped} skipped, ${totalErrors} errors`,
        duration,
      },
    };
  }
} 