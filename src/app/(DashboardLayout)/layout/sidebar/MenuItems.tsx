import {
  IconBallBasketball,
  IconTypography,
  IconUser,
  IconUserHexagon,
  IconUsersGroup,
  IconTrophy,
} from '@tabler/icons-react';
import { uniqueId } from 'lodash';

const openDrillsPage = (): void => {
  const url = '/utilities/drills_v2'; // Update with the correct path to the Drills_v2 page
  const windowFeatures =
    'width=800,height=600,menubar=no,toolbar=no,location=no,status=no,resizable=no,scrollbars=no';
  window.open(url, 'Drills_v2', windowFeatures);
};

const Menuitems = [
  {
    id: uniqueId(),
    title: 'testes',
    icon: IconBallBasketball,
    href: '/utilities/test',
  },
  { navlabel: true, subheader: 'Jogos' },
  {
    id: uniqueId(),
    title: 'Jogos',
    icon: IconBallBasketball,
    href: '/utilities/games',
  },
  { navlabel: true, subheader: 'Treinos' },
  {
    id: uniqueId(),
    title: 'Microciclos',
    icon: IconBallBasketball,
    href: '/utilities/cycles/microcycles',
  },
  {
    id: uniqueId(),
    title: 'Mesociclos',
    icon: IconBallBasketball,
    href: '/utilities/cycles/mesocycles',
  },
  {
    id: uniqueId(),
    title: 'Macrociclos',
    icon: IconBallBasketball,
    href: '/utilities/cycles/macrocycles',
  },
  {
    id: uniqueId(),
    title: 'Drills',
    icon: IconBallBasketball,
    href: '',
    onClick: openDrillsPage,
  },
  { navlabel: true, subheader: 'Definições' },
  {
    id: uniqueId(),
    title: 'Atletas',
    icon: IconUser,
    href: '/utilities/athletes',
  },
  {
    id: uniqueId(),
    title: 'Oponentes',
    icon: IconUsersGroup,
    href: '/utilities/opponents',
  },
  {
    id: uniqueId(),
    title: 'Equipas',
    icon: IconUsersGroup,
    href: '/utilities/teams',
  },
  {
    id: uniqueId(),
    title: 'Clube',
    icon: IconTypography,
    href: '/utilities/club',
  },
  {
    id: uniqueId(),
    title: 'Escalões',
    icon: IconBallBasketball,
    href: '/utilities/echelons',
  },
  {
    id: uniqueId(),
    title: 'Competições',
    icon: IconTrophy,
    href: '/utilities/competitions',
  },
  { navlabel: true, subheader: 'Configurações' },
  {
    id: uniqueId(),
    title: 'Contas',
    icon: IconUserHexagon,
    href: '/utilities/accounts',
  },
];

export default Menuitems;
