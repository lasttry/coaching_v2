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
  onItemClick?: () => void;
}

const ListItemStyled = styled(ListItemButton)(({ theme }) => ({
  whiteSpace: 'nowrap',
  marginBottom: '2px',
  padding: '5px 10px',
  borderRadius: '30px',
  backgroundColor: 'inherit',
  color: theme.palette.text.secondary,

  '&:hover': {
    backgroundColor: 'transparent !important',
  },
}));

export default function NavCollapse({
  item,
  pathDirect,
  hideMenu = false,
  onItemClick,
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
        <List component="div" disablePadding sx={{ pl: 4 }}>
          {item.children?.map((child) => (
            <NavItem
              key={child.id}
              item={child}
              pathDirect={pathDirect}
              level={2}
              hideMenu={hideMenu}
              onClick={() => onItemClick?.()}
            />
          ))}
        </List>
      </Collapse>
    </>
  );
}
