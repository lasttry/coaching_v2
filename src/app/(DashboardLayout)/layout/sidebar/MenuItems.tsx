import {
  IconAperture,
  IconBallBasketball,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUser,
  IconUserPlus,
  IconUsersGroup,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Home",
  },

  { id: uniqueId(), title: "Dashboard", icon: IconLayoutDashboard, href: "/", },
  { navlabel: true, subheader: "Jogos", },
  { id: uniqueId(), title: "Jogos", icon: IconBallBasketball, href: "/utilities/games", },
  { navlabel: true, subheader: "Definições", },
  { id: uniqueId(), title: "Atletas", icon: IconUser, href: "/utilities/athletes", },
  { id: uniqueId(), title: "Equipas", icon: IconUsersGroup, href: "/utilities/teams", },
  { id: uniqueId(), title: "Definições", icon: IconTypography, href: "/utilities/settings", },

  { navlabel: true, subheader: "Utilities", },
  { id: uniqueId(), title: "Typography", icon: IconTypography, href: "/utilities/typography", },
  {
    id: uniqueId(),
    title: "Shadow",
    icon: IconCopy,
    href: "/utilities/shadow",
  },
  {
    navlabel: true,
    subheader: "Auth",
  },
  {
    id: uniqueId(),
    title: "Login",
    icon: IconLogin,
    href: "/authentication/login",
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
  {
    navlabel: true,
    subheader: "Extra",
  },
  {
    id: uniqueId(),
    title: "Icons",
    icon: IconMoodHappy,
    href: "/icons",
  },
  {
    id: uniqueId(),
    title: "Sample Page",
    icon: IconAperture,
    href: "/sample-page",
  },
];

export default Menuitems;
