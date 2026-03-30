import React, { ReactElement } from 'react';
import MenuItemsComponent from './MenuItems';
import { usePathname } from 'next/navigation';
import { Box, List } from '@mui/material';
import NavItem from './NavItem';
import NavGroup from './NavGroup/NavGroup';
import NavCollapse from './NavCollapse';

type SidebarItemsProps = {
  toggleMobileSidebar?: () => void;
};

const SidebarItems = ({ toggleMobileSidebar }: SidebarItemsProps): ReactElement => {
  const pathname = usePathname();
  const pathDirect = pathname;

  return (
    <Box sx={{ px: '20px' }}>
      <List sx={{ pt: 0 }} className="sidebarNav" component="div">
        {MenuItemsComponent().map((item) => {
          if (item.subheader) {
            return <NavGroup item={item} key={item.subheader} />;
          } else if (item.children && item.children.length > 0) {
            return <NavCollapse item={item} key={item.id} pathDirect={pathDirect ?? ''} />;
          } else {
            return (
              <NavItem
                item={item}
                key={item.id}
                pathDirect={pathDirect ?? ''}
                onClick={(e) => {
                  e.preventDefault();
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
