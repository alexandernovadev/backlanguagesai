import User, { IUser } from "../../db/models/User";
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
} 