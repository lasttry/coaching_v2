import React, { ReactElement } from 'react';
import Menuitems from './MenuItems';
import { usePathname } from 'next/navigation';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';

type SidebarItemsProps = {
  toggleMobileSidebar?: () => void;
};

const SidebarItems = ({ toggleMobileSidebar }: SidebarItemsProps): ReactElement => {
  const pathname = usePathname();
  const pathDirect = pathname;

  return (
    <Box sx={{ px: '20px' }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {Menuitems.map((item) => {
          // {/********SubHeader**********/}
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;

            // {/********If Sub Menu**********/}
            /* eslint no-else-return: "off" */
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect ?? ''}
                onClick={(e) => {
                  e.preventDefault(); // optional: depends on your need
                  toggleMobileSidebar?.();
                }}
              />
            );
          }
        })}
      </List>
    </Box>
  );
};
export default SidebarItems;
