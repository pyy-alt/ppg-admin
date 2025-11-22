import {
  Users,
  AudioWaveform,
  Command,
  GalleryVerticalEnd,
  ClipboardList,
  Store,
  Building2,
} from 'lucide-react'
import { type SidebarData } from '../types'

export const sidebarData: SidebarData = {
  user: {
    name: 'satnaing',
    email: 'satnaingdev@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Shadcn Admin',
      logo: Command,
      plan: 'Vite + ShadcnUI',
    },
    {
      name: 'Acme Inc',
      logo: GalleryVerticalEnd,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: AudioWaveform,
      plan: 'Startup',
    },
  ],
  navGroups: [
    {
      title: 'Parts & Services',
      items: [
        { title: 'Parts Orders', url: '/admin/parts_orders', icon: ClipboardList },
        { title: 'Manage Shops', url: '/admin/shops', icon: Store },
        { title: 'Manage Dealers', url: '/admin/dealerships', icon: Building2 },
        { title: 'Manage Network Users', url: '/admin/users', icon: Users },
      ],
    },
  ],
}
