import React, { ReactElement } from 'react';
import Link from 'next/link';
import { Chip, List, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

export type NavGroup = {
  id?: string;
  disabled?: boolean;
  navlabel?: boolean;
  subheader?: string;
  title?: string;
  icon?: React.ElementType;
  href?: string;
  children?: NavGroup[];
  chip?: string;
  chipColor?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  variant?: 'filled' | 'outlined' | 'ghost';
  external?: boolean;
  level?: number;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  bgcolor?: string;
  subtitle?: string;
};

export interface ItemType {
  item: NavGroup;
  onClick: (event: React.MouseEvent<HTMLElement>) => void;
  hideMenu?: boolean;
  level?: number;
  pathDirect: string;
}

// ✅ move styled component OUTSIDE render
const ListItemStyled = styled(ListItemButton, {
  shouldForwardProp: (prop) => prop !== 'level' && prop !== 'selectedPath' && prop !== 'hideMenu',
})<{
  level?: number;
  selectedPath?: boolean;
  hideMenu?: boolean;
}>(({ theme, level = 1, selectedPath, hideMenu }) => ({
  whiteSpace: 'nowrap',
  marginBottom: '2px',
  padding: '5px 10px',
  borderRadius: '30px',
  backgroundColor: level > 1 ? 'transparent !important' : 'inherit',
  color:
    level > 1 && selectedPath
      ? `${theme.palette.primary.main}!important`
      : theme.palette.text.secondary,
  fontWeight: level > 1 && selectedPath ? '600 !important' : '400',
  paddingLeft: hideMenu ? '10px' : level > 2 ? `${level * 15}px` : level > 1 ? '10px' : '10px',

  '&:before': {
    content: '""',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '-20px',
    height: '100%',
    zIndex: '-1',
    borderRadius: '0 24px 24px 0',
    transition: 'all .3s ease-in-out',
    width: '0',
  },

  '&:hover::before': {
    width: 'calc(100% + 20px)',
    backgroundColor: theme.palette.primary.light,
  },

  '& > .MuiListItemIcon-root': {
    width: 45,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    marginRight: '8px',
    transition: 'all .3s ease-in-out',
  },

  '&:hover': {
    backgroundColor: 'transparent !important',
  },

  '&.Mui-selected': {
    backgroundColor: 'transparent !important',
    '.MuiListItemIcon-root': {
      color: theme.palette.primary.main,
    },
    '&:before': {
      backgroundColor: theme.palette.primary.light,
      width: 'calc(100% + 16px)',
    },
    '&:hover': {
      color: theme.palette.text.primary,
    },
  },
}));

export default function NavItem({
  item,
  level = 1,
  pathDirect,
  hideMenu = false,
  onClick,
}: ItemType): ReactElement {
  const theme = useTheme();
  const Icon = item.icon;
  const itemIcon = Icon ? <Icon stroke={1.5} size="1.3rem" /> : null;

  const selected = pathDirect === item?.href;

  const handleClick = (): void => {
    onClick?.({} as React.MouseEvent<HTMLElement>);
  };

  return (
    <List component="li" disablePadding key={item?.id && item.title}>
      <Link href={item.href || '#'} style={{ textDecoration: 'none' }} onClick={handleClick}>
        <ListItemStyled
          disabled={item?.disabled}
          selected={selected}
          selectedPath={selected}
          level={level}
          hideMenu={hideMenu}
        >
          <ListItemIcon
            sx={{
              minWidth: '36px',
              p: '3px 0',
              color: level > 1 && selected ? `${theme.palette.primary.main}!important` : 'inherit',
            }}
          >
            {itemIcon}
          </ListItemIcon>

          <ListItemText>
            {!hideMenu && <>{item?.title}</>}
            {item?.subtitle && !hideMenu && (
              <Typography variant="caption">{item.subtitle}</Typography>
            )}
          </ListItemText>

          {!item?.chip || hideMenu ? null : (
            <Chip
              color={item?.chipColor}
              variant={item?.variant === 'outlined' ? 'outlined' : 'filled'}
              size="small"
              label={item?.chip}
            />
          )}
        </ListItemStyled>
      </Link>
    </List>
  );
}
