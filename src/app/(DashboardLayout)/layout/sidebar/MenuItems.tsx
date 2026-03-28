'use client';

import {
  IconBallBasketball,
  IconTypography,
  IconUser,
  IconUsersGroup,
  IconTrophy,
  type TablerIcon,
  IconShirtSport,
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
};

const MenuItemsComponent = (): MenuItem[] => {
  const { t } = useTranslation();

  const menuItems: MenuItem[] = [
    {
      id: uniqueId(),
      title: t('tests'),
      icon: IconBallBasketball,
      href: '/utilities/test',
    },
    { navlabel: true, subheader: t('Games') },
    {
      id: uniqueId(),
      title: t('Games'),
      icon: IconBallBasketball,
      href: '/utilities/games',
    },
    { navlabel: true, subheader: t('Practices') },
    {
      id: uniqueId(),
      title: t('Microciclos'),
      icon: IconBallBasketball,
      href: '/utilities/cycles/microcycles',
    },
    {
      id: uniqueId(),
      title: t('Mesociclos'),
      icon: IconBallBasketball,
      href: '/utilities/cycles/mesocycles',
    },
    {
      id: uniqueId(),
      title: t('Macrociclos'),
      icon: IconBallBasketball,
      href: '/utilities/cycles/macrocycles',
    },
    {
      id: uniqueId(),
      title: t('Drills'),
      icon: IconBallBasketball,
      href: '',
      onClick: openDrillsPage,
    },
    { navlabel: true, subheader: t('Settings') },
    {
      id: uniqueId(),
      title: t('Athletes'),
      icon: IconUser,
      href: '/utilities/athletes',
    },
    {
      id: uniqueId(),
      title: t('Opponents'),
      icon: IconUsersGroup,
      href: '/utilities/opponents',
    },
    {
      id: uniqueId(),
      title: t('Teams'),
      icon: IconUsersGroup,
      href: '/utilities/teams',
    },

    {
      id: uniqueId(),
      title: t('Echelons'),
      icon: IconBallBasketball,
      href: '/utilities/echelons',
    },
    {
      id: uniqueId(),
      title: t('Competitions'),
      icon: IconTrophy,
      href: '/utilities/competitions',
    },
    {
      id: uniqueId(),
      title: t('Equipments'),
      icon: IconShirtSport,
      href: '/utilities/equipments',
    },
    { navlabel: true, subheader: t('Configurations') },
    {
      id: uniqueId(),
      title: t('Club'),
      icon: IconTypography,
      href: '/utilities/club',
    },
    {
      id: uniqueId(),
      title: t('Seasons'),
      icon: IconTypography,
      href: '/utilities/seasons',
    },
  ];

  return menuItems;
};

export default MenuItemsComponent;
