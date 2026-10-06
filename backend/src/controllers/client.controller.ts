import { Request, Response, NextFunction } from 'express';
import { ClientService } from '../services/client.service';

export class ClientController {
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const { page, pageSize } = req.query;
      const clients = await ClientService.getAllClients({
        page: page as string,
        pageSize: pageSize as string
      });
      res.json(clients);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const client = await ClientService.getClientById(req.params.id);
      res.json(client);
    } catch (err) {
      next(err);
    }
  }

  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const created = await ClientService.createClient(req.body);
      res.status(201).json(created);
    } catch (err) {
      next(err);
    }
  }

  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await ClientService.updateClient(req.params.id, req.body);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  }

  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await ClientService.deleteClient(req.params.id);
      res.json({ message: 'Cliente eliminado correctamente.' });
    } catch (err) {
      next(err);
    }
  }
}
