'use client';

import {
  IconBallBasketball,
  IconTypography,
  IconUser,
  IconUsersGroup,
  IconTrophy,
  type TablerIcon,
  IconShirtSport,
  IconSwords,
  IconBuildingCommunity,
  IconRefresh,
  IconRocket,
  IconUsers,
  IconChartBar,
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';

import '@/lib/i18n.client';
import { useTranslation } from 'react-i18next';

const openDrillsPage = (): void => {
  const url = '/utilities/drills_v2'; // Update with the correct path to the Drills_v2 page
  const windowFeatures =
    'width=800,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no';
  window.open(url, 'Drills_v2', windowFeatures);
};

type MenuItem = {
  id?: string;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: TablerIcon;
  href?: string;
  onClick?: () => void;
  children?: MenuItem[];
};

const MenuItemsComponent = (): MenuItem[] => {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    { navlabel: true, subheader: t('game.title') },
    {
      id: uniqueId(),
      title: t('game.title'),
      icon: IconBallBasketball,
      href: '/utilities/games',
    },
    {
      id: uniqueId(),
      title: t('opponent.title'),
      icon: IconSwords,
      href: '/utilities/opponents',
    },
    { navlabel: true, subheader: t('menu.practices') },
    {
      id: uniqueId(),
      title: t('menu.drills'),
      icon: IconBallBasketball,
      href: '',
      onClick: openDrillsPage,
    },
    {
      id: uniqueId(),
      title: t('menu.cycles'),
      icon: IconRefresh,
      children: [
        {
          id: uniqueId(),
          title: t('cycles.microcycle.title'),
          icon: IconBallBasketball,
          href: '/utilities/cycles/microcycles',
        },
        {
          id: uniqueId(),
          title: t('cycles.mesocycle.title'),
          icon: IconBallBasketball,
          href: '/utilities/cycles/mesocycles',
        },
        {
          id: uniqueId(),
          title: t('cycles.macrocycle.title'),
          icon: IconBallBasketball,
          href: '/utilities/cycles/macrocycles',
        },
      ],
    },
    { navlabel: true, subheader: t('menu.statistics') },
    {
      id: uniqueId(),
      title: t('game.title'),
      icon: IconChartBar,
      href: '/utilities/athletes/statistics',
    },
    { navlabel: true, subheader: t('club.singular') },
    {
      id: uniqueId(),
      title: t('athlete.title'),
      icon: IconUser,
      href: '/utilities/athletes',
    },
    {
      id: uniqueId(),
      title: t('team.title'),
      icon: IconUsersGroup,
      href: '/utilities/teams',
    },
    {
      id: uniqueId(),
      title: t('equipment.title'),
      icon: IconShirtSport,
      href: '/utilities/equipments',
    },
    {
      id: uniqueId(),
      title: t('staff.title'),
      icon: IconUsers,
      href: '/utilities/staff',
    },
    { navlabel: true, subheader: t('menu.settings') },
    {
      id: uniqueId(),
      title: t('echelon.title'),
      icon: IconBallBasketball,
      href: '/utilities/echelons',
    },
    {
      id: uniqueId(),
      title: t('competition.title'),
      icon: IconTrophy,
      href: '/utilities/competitions',
    },
    { navlabel: true, subheader: t('menu.configuration') },
    {
      id: uniqueId(),
      title: t('club.settings'),
      icon: IconBuildingCommunity,
      href: '/utilities/club',
    },
    {
      id: uniqueId(),
      title: t('season.title'),
      icon: IconTypography,
      href: '/utilities/seasons',
    },
    {
      id: uniqueId(),
      title: t('menu.deploy'),
      icon: IconRocket,
      href: '/utilities/admin/deploy',
    },
  ];

  return menuItems;
};

export default MenuItemsComponent;
