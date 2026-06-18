import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import { dataverse } from '@/lib/dataverse';
import Link from 'next/link';

interface DashboardStats {
  totalBumps: number;
  bumpsToday: number;
  bumpsThisWeek: number;
  totalNeighbors: number;
  neighborsToday: number;
  totalBrigades: number;
  totalBlitzes: number;
  patriotsClubMembers: number;
  pendingModeration: number;
  totalPoints: number;
}

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session?.isLoggedIn || !session?.isAdmin) redirect('/');

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayIso = today.toISOString();

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoIso = weekAgo.toISOString();

  const [
    totalBumpsRes,
    bumpsTodayRes,
    bumpsWeekRes,
    totalNeighborsRes,
    neighborsTodayRes,
    totalBrigadesRes,
    totalBlitzesRes,
    pcMembersRes,
    pendingModerationRes,
  ] = await Promise.allSettled([
    dataverse.get<{ value: any[] }>(`bb_banners?$filter=statecode eq 0&$select=bb_bannerid`),
    dataverse.get<{ value: any[] }>(`bb_banners?$filter=statecode eq 0 and createdon gt '${todayIso}'&$select=bb_bannerid`),
    dataverse.get<{ value: any[] }>(`bb_banners?$filter=statecode eq 0 and createdon gt '${weekAgoIso}'&$select=bb_bannerid`),
    dataverse.get<{ value: any[] }>(`bb_neighbors?$filter=statecode eq 0&$select=bb_neighborid`),
    dataverse.get<{ value: any[] }>(`bb_neighbors?$filter=statecode eq 0 and createdon gt '${todayIso}'&$select=bb_neighborid`),
    dataverse.get<{ value: any[] }>(`bb_brigades?$filter=statecode eq 0&$select=bb_brigadeid`),
    dataverse.get<{ value: any[] }>(`bb_blitzs?$filter=statecode eq 0&$select=bb_blitzid`),
    dataverse.get<{ value: any[] }>(`bb_neighbors?$filter=statecode eq 0 and bb_ispatriotsclub eq true&$select=bb_neighborid`),
    dataverse.get<{ value: any[] }>(`bb_banners?$filter=statecode eq 0 and bb_isfeatureable eq false and bb_isrejected eq false&$select=bb_bannerid`),
  ]);

  const stats: DashboardStats = {
    totalBumps: (totalBumpsRes.status === 'fulfilled' ? totalBumpsRes.value.value?.length : 0) ?? 0,
    bumpsToday: (bumpsTodayRes.status === 'fulfilled' ? bumpsTodayRes.value.value?.length : 0) ?? 0,
    bumpsThisWeek: (bumpsWeekRes.status === 'fulfilled' ? bumpsWeekRes.value.value?.length : 0) ?? 0,
    totalNeighbors: (totalNeighborsRes.status === 'fulfilled' ? totalNeighborsRes.value.value?.length : 0) ?? 0,
    neighborsToday: (neighborsTodayRes.status === 'fulfilled' ? neighborsTodayRes.value.value?.length : 0) ?? 0,
    totalBrigades: (totalBrigadesRes.status === 'fulfilled' ? totalBrigadesRes.value.value?.length : 0) ?? 0,
    totalBlitzes: (totalBlitzesRes.status === 'fulfilled' ? totalBlitzesRes.value.value?.length : 0) ?? 0,
    patriotsClubMembers: (pcMembersRes.status === 'fulfilled' ? pcMembersRes.value.value?.length : 0) ?? 0,
    pendingModeration: (pendingModerationRes.status === 'fulfilled' ? pendingModerationRes.value.value?.length : 0) ?? 0,
    totalPoints: 0,
  };

  const statCardStyle = (color: string) => ({
    background: '#FFFFFF',
    borderRadius: 8,
    border: '1px solid #EEEEEE',
    padding: '20px 24px',
    borderTop: `3px solid ${color}`,
  });

  const adminPages = [
    { href: '/admin/moderation', label: '🖼️ Content Moderation', description: `${stats.pendingModeration} pending review`, color: '#C5A028' },
    { href: '/admin/neighbors', label: '👥 Neighbors', description: `${stats.totalNeighbors} total`, color: '#1B2A4A' },
    { href: '/admin/orders', label: '📦 Orders', description: 'View all orders', color: '#B22234' },
    { href: '/admin/faqs', label: '❓ FAQs', description: 'Manage FAQ entries', color: '#1B7A3E' },
    { href: '/admin/products', label: '🛍️ Products', description: 'Manage store products', color: '#7B3F99' },
    { href: '/admin/brigades', label: '⚡ Brigades', description: `${stats.totalBrigades} total`, color: '#E87722' },
    { href: '/admin/announcements', label: '📣 Announcements', description: 'Push to feed', color: '#0077CC' },
  ];

  return (
    <div style={{ background: '#FAF7F2', minHeight: '100vh' }}>

      {/* Header */}
      <div style={{ background: '#1B2A4A', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#C5A028' }}>
            Banner Beauty Admin
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', margin: 0 }}>
            Dashboard
          </h1>
        </div>
        <Link href="/" style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.82rem', textDecoration: 'none' }}>
          ← Back to Site
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 80px' }}>

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>

          <div style={statCardStyle('#B22234')}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 8 }}>Total Banner Bumps</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1B2A4A' }}>{stats.totalBumps.toLocaleString()}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 4 }}>+{stats.bumpsToday} today · +{stats.bumpsThisWeek} this week</div>
          </div>

          <div style={statCardStyle('#1B2A4A')}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 8 }}>Total Neighbors</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1B2A4A' }}>{stats.totalNeighbors.toLocaleString()}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 4 }}>+{stats.neighborsToday} today</div>
          </div>

          <div style={statCardStyle('#C5A028')}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 8 }}>Patriot's Club</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1B2A4A' }}>{stats.patriotsClubMembers.toLocaleString()}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 4 }}>Active members</div>
          </div>

          <div style={statCardStyle('#1B7A3E')}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 8 }}>Brigades</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: '#1B2A4A' }}>{stats.totalBrigades.toLocaleString()}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 4 }}>{stats.totalBlitzes} active blitzes</div>
          </div>

          <div style={statCardStyle('#E87722')}>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.7rem', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#888888', marginBottom: 8 }}>Pending Moderation</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: '2rem', fontWeight: 700, color: stats.pendingModeration > 0 ? '#B22234' : '#1B2A4A' }}>{stats.pendingModeration.toLocaleString()}</div>
            <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.75rem', color: '#888888', marginTop: 4 }}>
              <Link href="/admin/moderation" style={{ color: '#C5A028', textDecoration: 'none' }}>Review now →</Link>
            </div>
          </div>

        </div>

        {/* Admin pages grid */}
        <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.72rem', letterSpacing: '2px', textTransform: 'uppercase', color: '#888888', marginBottom: 16 }}>
          Admin Pages
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
          {adminPages.map(page => (
            <Link key={page.href} href={page.href} style={{ textDecoration: 'none' }}>
              <div style={{
                background: '#FFFFFF',
                borderRadius: 8,
                border: '1px solid #EEEEEE',
                padding: '16px 20px',
                borderLeft: `4px solid ${page.color}`,
              }}
              >
                <div style={{ fontFamily: 'Georgia, serif', fontSize: '0.95rem', fontWeight: 700, color: '#1B2A4A', marginBottom: 4 }}>
                  {page.label}
                </div>
                <div style={{ fontFamily: 'Trebuchet MS, sans-serif', fontSize: '0.78rem', color: '#888888' }}>
                  {page.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
