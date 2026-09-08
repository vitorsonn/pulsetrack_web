import { OrderStatus } from '../enums/order-status';

export interface Order {
  id: number;
  customerName: string;
  deliveryAddress: string;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt: string;
}