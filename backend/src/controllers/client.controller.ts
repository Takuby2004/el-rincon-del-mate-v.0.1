import { Request, Response } from 'express';
import { ClientService } from '../services/client.service';

export class ClientController {
  public static async getAll(req: Request, res: Response) {
    try {
      const clients = await ClientService.getAllClients();
      res.json(clients);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }

  public static async getById(req: Request, res: Response) {
    try {
      const client = await ClientService.getClientById(req.params.id);
      res.json(client);
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  }

  public static async create(req: Request, res: Response) {
    try {
      const created = await ClientService.createClient(req.body);
      res.status(201).json(created);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async update(req: Request, res: Response) {
    try {
      const updated = await ClientService.updateClient(req.params.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      await ClientService.deleteClient(req.params.id);
      res.json({ message: 'Cliente eliminado correctamente.' });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }
}
