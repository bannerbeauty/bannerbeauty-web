import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import OrdersClient from './OrdersClient';

export interface AdminOrder {
  orderId: string;
  orderNumber: string;
  createdOn: string;
  firstName: string;
  lastName: string;
  phone: string;
  total: number;
  paymentStatus: number;
  statusCode: number;
  isBannerBump: boolean;
  neighborId: string;
}

const PAYMENT_STATUS_LABELS: Record<number, string> = {
  121120000: 'Pending',
  121120001: 'Paid',
  121120002: 'Failed',
  121120003: 'Refunded',
};

export { PAYMENT_STATUS_LABELS };

export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_orders?$filter=statecode eq 0` +
      `&$select=bb_orderid,bb_ordernumber,createdon,bb_firstname,bb_lastname,bb_phone,bb_grandtotal,bb_paymentstatus,statuscode,bb_isbannerbump,_bb_neighbor_value` +
      `&$orderby=createdon desc&$top=200`
    );

    const orders: AdminOrder[] = (res.value ?? []).map((o: any) => ({
      orderId: o.bb_orderid,
      orderNumber: o.bb_ordernumber ?? '',
      createdOn: o.createdon ?? '',
      firstName: o.bb_firstname ?? '',
      lastName: o.bb_lastname ?? '',
      phone: o.bb_phone ?? '',
      total: o.bb_grandtotal ?? 0,
      paymentStatus: o.bb_paymentstatus ?? 121120000,
      statusCode: o.statuscode ?? 1,
      isBannerBump: o.bb_isbannerbump ?? false,
      neighborId: o._bb_neighbor_value ?? '',
    }));

    return <OrdersClient orders={orders} />;
  } catch (err) {
    console.error('Admin orders fetch failed:', err);
    return <OrdersClient orders={[]} />;
  }
}
