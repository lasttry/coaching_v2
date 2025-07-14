import React, { ReactElement } from 'react';
import PropTypes from 'prop-types';
// mui imports
import { ListSubheader, styled } from '@mui/material';

type NavGroup = {
  navlabel?: boolean;
  subheader?: string;
};

interface ItemType {
  item: NavGroup;
}

const NavGroup = ({ item }: ItemType): ReactElement => {
  const ListSubheaderStyle = styled(ListSubheader)(({ theme }) => ({
    ...theme.typography.overline,
    fontWeight: 700,
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(0),
    color: theme.palette.text.primary,
    lineHeight: '26px',
    padding: '3px 12px',
  }));

  return <ListSubheaderStyle disableSticky>{item.subheader}</ListSubheaderStyle>;
};

NavGroup.propTypes = {
  item: PropTypes.object,
};

export default NavGroup;
