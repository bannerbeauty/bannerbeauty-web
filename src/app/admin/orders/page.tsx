import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import OrdersClient from './OrdersClient';

export interface AdminOrder {
  orderId: string;
  orderNumber: string;
  createdOn: string;
  total: number;
  paymentStatus: number;
  statusCode: number;
  neighborId: string;
  isPatriotsClubPurchase: boolean;
}


export default async function AdminOrdersPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  try {
    const res = await dataverse.get<{ value: any[] }>(
      `bb_orders?$filter=statecode eq 0` +
      `&$select=bb_orderid,bb_ordernumber,createdon,bb_grandtotal,bb_paymentstatus,statuscode,_bb_neighbor_value,bb_ispatriotcluborder` +
      `&$orderby=createdon desc&$top=200`
    );

    const orders: AdminOrder[] = (res.value ?? []).map((o: any) => ({
      orderId: o.bb_orderid,
      orderNumber: o.bb_ordernumber ?? '',
      createdOn: o.createdon ?? '',
      total: o.bb_grandtotal ?? 0,
      paymentStatus: o.bb_paymentstatus ?? 121120000,
      statusCode: o.statuscode ?? 1,
      neighborId: o._bb_neighbor_value ?? '',
      isPatriotsClubPurchase: o.bb_ispatriotcluborder ?? false,
    }));

    return <OrdersClient orders={orders} />;
  } catch (err) {
    console.error('Admin orders fetch failed:', err);
    return <OrdersClient orders={[]} />;
  }
}
