import React, { ReactElement, useState } from 'react';
import { List, ListItemButton, ListItemIcon, Collapse, Typography, Box } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import NavItem from '../NavItem';
import type { NavGroup } from '../NavItem';

export interface NavCollapseProps {
  item: NavGroup;
  pathDirect: string;
  hideMenu?: boolean;
}

const ListItemStyled = styled(ListItemButton)(({ theme }) => ({
  whiteSpace: 'nowrap',
  marginBottom: '2px',
  padding: '5px 10px 5px 0',
  borderRadius: '30px',
  backgroundColor: 'inherit',
  color: theme.palette.text.secondary,
  paddingLeft: '0',

  '&:hover': {
    backgroundColor: 'transparent !important',
  },
}));

export default function NavCollapse({
  item,
  pathDirect,
  hideMenu = false,
}: NavCollapseProps): ReactElement {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const Icon = item.icon;
  const itemIcon = Icon ? <Icon stroke={1.5} size="1.3rem" /> : null;

  const isChildActive = item.children?.some((child) => child.href === pathDirect);

  const handleClick = (): void => {
    setOpen(!open);
  };

  return (
    <>
      <List component="li" disablePadding>
        <ListItemStyled onClick={handleClick}>
          <ListItemIcon
            sx={{
              minWidth: '36px',
              p: '3px 0',
              color: isChildActive ? theme.palette.primary.main : 'inherit',
            }}
          >
            {itemIcon}
          </ListItemIcon>
          {!hideMenu && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Typography variant="body1">{item?.title}</Typography>
              {open ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
            </Box>
          )}
        </ListItemStyled>
      </List>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <List component="div" disablePadding sx={{ pl: 2 }}>
          {item.children?.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              pathDirect={pathDirect}
              level={2}
              hideMenu={hideMenu}
              onClick={() => {}}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}
