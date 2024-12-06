import {
  IconBallBasketball,
  IconTypography,
  IconUser,
  IconUsersGroup,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  { navlabel: true, subheader: "Jogos", },
  { id: uniqueId(), title: "Jogos", icon: IconBallBasketball, href: "/utilities/games", },
  { navlabel: true, subheader: "Treinos", },
  { id: uniqueId(), title: "Microciclos", icon: IconBallBasketball, href: "/utilities/cycles/microcycles", },
  { id: uniqueId(), title: "Mesociclos", icon: IconBallBasketball, href: "/utilities/cycles/mesocycles", },
  { id: uniqueId(), title: "Macrociclos", icon: IconBallBasketball, href: "/utilities/cycles/macrocycles", },
  { navlabel: true, subheader: "Definições", },
  { id: uniqueId(), title: "Atletas", icon: IconUser, href: "/utilities/athletes", },
  { id: uniqueId(), title: "Equipas", icon: IconUsersGroup, href: "/utilities/teams", },
  { id: uniqueId(), title: "Definições", icon: IconTypography, href: "/utilities/settings", },
];

export default Menuitems;
