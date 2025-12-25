// src/components/AppSidebar.tsx
import { useLayout } from '@/context/layout-provider';
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from '@/components/ui/sidebar';
import { NavGroup } from './nav-group';
import { sidebarData } from './data/sidebar-data';
import { useTranslation } from 'react-i18next';

export function AppSidebar() {
  const { t } = useTranslation();
  const { collapsible, variant } = useLayout();

  const translatedSidebarData = {
    ...sidebarData,
    teams: sidebarData.teams.map((team) => ({
      ...team,
      name: t(`sidebar.teams.${team.nameKey}`),
      plan: t(`sidebar.teams.plan.${team.planKey}`),
    })),
    navGroups: sidebarData.navGroups.map((group) => ({
      ...group,
      title: t(`sidebar.navGroups.${group.titleKey}`),
      items: group.items.map((item) => ({
        ...item,
        title: t(`sidebar.nav.${item.titleKey}`),
      })),
    })),
  };

  return (
    <Sidebar collapsible={collapsible} variant={variant}>
      <SidebarHeader />
      <SidebarContent>
        {translatedSidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}
