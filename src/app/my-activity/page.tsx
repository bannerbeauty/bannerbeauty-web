import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import MyActivityClient from './MyActivityClient';

interface DvNeighbor {
  bb_neighborid: string;
  bb_points?: number;
  bb_pointsalltime?: number;
}

interface DvOrder {
  bb_orderid: string;
  bb_ordernumber?: string;
  createdon?: string;
  bb_grandtotal?: number;
  statuscode?: number;
  statecode?: number;
}

interface DvBanner {
  bb_bannerid: string;
  bb_bannernumber?: string;
  createdon?: string;
  bb_banneroption?: number;
  bb_recipientcity?: string;
  bb_recipientstate?: string;
  bb_isletterprinted?: boolean;
  bb_qrtoken?: string;
  statuscode?: number;
  bb_recipientrespondeddatetime?: string;
}

interface DvPointsTransaction {
  bb_pointstransactionid: string;
  bb_pointstransactionnumber?: string;
  createdon?: string;
  bb_points?: number;
  bb_transactiontype?: number;
  bb_description?: string;
  bb_pointsyear?: number;
}

export interface Order {
  orderId: string;
  orderNumber: string;
  date: string;
  total: number;
  statusCode: number;
}

export interface BannerBump {
  bannerId: string;
  bannerNumber: string;
  date: string;
  bannerOption: number;
  recipientCity: string;
  recipientState: string;
  isLetterPrinted: boolean;
  qrToken: string;
  statusCode: number;
  recipientResponded: boolean;
}

export interface PointsTransaction {
  transactionId: string;
  transactionNumber: string;
  date: string;
  points: number;
  transactionType: number;
  description: string;
  pointsYear: number;
}

const ORDER_STATUS: Record<number, { label: string; color: string }> = {
  1:         { label: 'Pending',    color: '#C5A028' },
  121120001: { label: 'Processing', color: '#1B2A4A' },
  121120002: { label: 'Shipped',    color: '#0A7ABF' },
  2:         { label: 'Delivered',  color: '#1B7A3E' },
  121120003: { label: 'Returned',   color: '#B22234' },
  121120004: { label: 'Cancelled',  color: '#888888' },
};

const BANNER_STATUS: Record<number, { label: string; color: string }> = {
  1:         { label: 'Submitted',           color: '#C5A028' },
  121120001: { label: 'Fulfilled',           color: '#1B7A3E' },
  2:         { label: 'Recipient Responded', color: '#0A7ABF' },
  121120002: { label: 'Cancelled',           color: '#888888' },
  121120003: { label: 'Page Accessed',       color: '#0A7ABF' },
};

export { ORDER_STATUS, BANNER_STATUS };

export default async function MyActivityPage() {
  const session = await getSession();
  if (!session?.isLoggedIn) {
    redirect('/signin');
  }

  const neighborId = session.neighborId;

  let pointsBalance = 0;
  let pointsAllTime = 0;
  try {
    const res = await dataverse.get<{ value: DvNeighbor[] }>(
      `bb_neighbors?$filter=bb_neighborid eq '${neighborId}' and statecode eq 0&$select=bb_neighborid,bb_points,bb_pointsalltime&$top=1`
    );
    const neighbor = res.value?.[0] ?? null;
    pointsBalance = neighbor?.bb_points ?? 0;
    pointsAllTime = neighbor?.bb_pointsalltime ?? 0;
  } catch (err) {
    console.error('MyActivity neighbor fetch failed:', err);
  }

  let orders: Order[] = [];
  let bannerBumps: BannerBump[] = [];
  let pointsTransactions: PointsTransaction[] = [];

  if (neighborId) {
    try {
      const [ordersRes, bannersRes, pointsRes] = await Promise.all([
        dataverse.get<{ value: DvOrder[] }>(
          `bb_orders?$filter=_bb_neighbor_value eq '${neighborId}'` +
          `&$select=bb_orderid,bb_ordernumber,createdon,bb_grandtotal,statuscode,statecode` +
          `&$orderby=createdon desc`
        ),
        dataverse.get<{ value: DvBanner[] }>(
          `bb_banners?$filter=_bb_initiatingneighbor_value eq '${neighborId}'` +
          `&$select=bb_bannerid,bb_bannernumber,createdon,bb_banneroption,bb_recipientcity,bb_recipientstate,bb_isletterprinted,bb_qrtoken,statuscode,bb_recipientrespondeddatetime` +
          `&$orderby=createdon desc`
        ),
        dataverse.get<{ value: DvPointsTransaction[] }>(
          `bb_pointstransactions?$filter=_bb_neighbor_value eq '${neighborId}'` +
          `&$select=bb_pointstransactionid,bb_pointstransactionnumber,createdon,bb_points,bb_transactiontype,bb_description,bb_pointsyear` +
          `&$orderby=createdon desc&$top=50`
        ),
      ]);

      orders = (ordersRes.value ?? []).map(o => ({
        orderId: o.bb_orderid,
        orderNumber: o.bb_ordernumber ?? '',
        date: o.createdon ?? '',
        total: o.bb_grandtotal ?? 0,
        statusCode: o.statuscode ?? 1,
      }));

      bannerBumps = (bannersRes.value ?? []).map(b => ({
        bannerId: b.bb_bannerid,
        bannerNumber: b.bb_bannernumber ?? '',
        date: b.createdon ?? '',
        bannerOption: b.bb_banneroption ?? 121120000,
        recipientCity: b.bb_recipientcity ?? '',
        recipientState: b.bb_recipientstate ?? '',
        isLetterPrinted: b.bb_isletterprinted ?? false,
        qrToken: b.bb_qrtoken ?? '',
        statusCode: b.statuscode ?? 1,
        recipientResponded: !!b.bb_recipientrespondeddatetime,
      }));

      pointsTransactions = (pointsRes.value ?? []).map(p => ({
        transactionId: p.bb_pointstransactionid,
        transactionNumber: p.bb_pointstransactionnumber ?? '',
        date: p.createdon ?? '',
        points: p.bb_points ?? 0,
        transactionType: p.bb_transactiontype ?? 0,
        description: p.bb_description ?? '',
        pointsYear: p.bb_pointsyear ?? 0,
      }));
    } catch (err) {
      console.error('MyActivity data fetch failed:', err);
    }
  }

  return (
    <MyActivityClient
      orders={orders}
      bannerBumps={bannerBumps}
      pointsTransactions={pointsTransactions}
      pointsBalance={pointsBalance}
      pointsAllTime={pointsAllTime}
    />
  );
}
