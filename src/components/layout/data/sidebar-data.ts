import { Users, AudioWaveform, Command, GalleryVerticalEnd, ClipboardList, Store, Building2 } from 'lucide-react';
import { type SidebarData } from '../types';

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      nameKey: 'mainApp',
      name: 'Restricted Parts Tracker',
      logo: Command,
      planKey: 'viteShadcn',
      plan: 'Vite + ShadcnUI',
    },
    {
      nameKey: 'acmeInc',
      name: 'Acme Inc',
      planKey: 'enterprise',
      plan: 'Enterprise',
      logo: GalleryVerticalEnd,
    },
    {
      nameKey: 'acmeCorp',
      name: 'Acme Corp.',
      planKey: 'startup',
      plan: 'Startup',
      logo: AudioWaveform,
    },
  ],
  navGroups: [
    {
      titleKey: 'partsAndServices',
      title: 'Parts & Services',
      items: [
        { titleKey: 'partsOrders', title: 'Parts Orders', url: '/admin/parts_orders', icon: ClipboardList },
        { titleKey: 'manageShops', title: 'Manage Shops', url: '/admin/shops', icon: Store },
        { titleKey: 'manageDealers', title: 'Manage Dealers', url: '/admin/dealerships', icon: Building2 },
        // { titleKey: 'manageRepairOrders', title: 'Manage Repair Orders', url: '/admin/repair_orders', icon: Command },
        { titleKey: 'manageNetworkUsers', title: 'Manage Network Users', url: '/admin/users', icon: Users },
      ],
    },
  ],
};
