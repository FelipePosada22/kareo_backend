import { Response } from "express";
import { UserService } from "./user.service";

export class UserController {
  static async create(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const user = await UserService.create(req.body, tenantId);
      res.status(201).json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async findAll(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const users = await UserService.findAll(tenantId);
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: "Error fetching users" });
    }
  }

  static async findById(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const user = await UserService.findById(req.params.id, tenantId);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: "Error fetching user" });
    }
  }

  static async update(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const user = await UserService.update(req.params.id, req.body, tenantId);
      res.json(user);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  static async remove(req: any, res: Response) {
    try {
      const tenantId = req.user.tenantId;
      const requestingUserId = req.user.userId;
      await UserService.remove(req.params.id, tenantId, requestingUserId);
      res.json({ message: "User deleted" });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
