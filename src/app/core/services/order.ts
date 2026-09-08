import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Injectable} from '@angular/core';
import {Order} from '../models/order';
import {OrderStatus} from '../enums/order-status';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
    private readonly API_URL = 'http://localhost:8080/orders '

  constructor(private http: HttpClient) { }

  getOrderById(id: number): Observable<Order> {
    return this.http.get<Order>(`${this.API_URL}/${id}`);
  }

  updateOrderStatus(id: number, status: OrderStatus): Observable<Order> {
    return this.http.patch<Order>(`${this.API_URL}/${id}/status?status=${status}`, {});
  }

}
