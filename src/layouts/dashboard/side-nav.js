import NextLink from 'next/link';
import { usePathname } from 'next/navigation'; // Keep only one import for usePathname
import PropTypes from 'prop-types';
import ArrowTopRightOnSquareIcon from '@heroicons/react/24/solid/ArrowTopRightOnSquareIcon';
import {
  Box,
  Button,
  Divider,
  Drawer,
  Stack,
  SvgIcon,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { Logo } from 'src/components/logo';
import { Scrollbar } from 'src/components/scrollbar';
import { items, adminItems, leaderItems } from './config';
import { SideNavItem } from './side-nav-item';
import { useEffect, useState } from 'react'; // Import react related hooks separately

export const SideNav = (props) => {
  const { open, onClose } = props;
  const pathname = usePathname();
  const lgUp = useMediaQuery((theme) => theme.breakpoints.up('lg'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    const userString = window.sessionStorage.getItem('user');
    const parsedUser = userString ? JSON.parse(userString) : null;
    setUser(parsedUser);
  }, []);

  const content = (
    <Scrollbar
      sx={{
        height: '100%',
        '& .simplebar-content': {
          height: '100%',
        },
        '& .simplebar-scrollbar:before': {
          background: 'neutral.400',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          width: '100%',
        }}
      >
        <Box sx={{ p: 3 }}>
          <Box
            component={NextLink}
            href="/"
            sx={{
              display: 'inline-flex',
              height: 32,
              width: 32,
            }}
          >
            <Logo />
          </Box>
        </Box>
        <Divider sx={{ borderColor: 'neutral.700' }} />
        <Box
          component="nav"
          sx={{
            flexGrow: 1,
            px: 2,
            py: 3,
          }}
        >
          <Stack
            component="ul"
            spacing={0.5}
            sx={{
              listStyle: 'none',
              p: 0,
              m: 0,
            }}
          >
            {user &&
            ((user.accountType === 'admin' && adminItems) ||
              (user.accountType === 'leader' && leaderItems) ||
              user.accountType === 'operator')
              ? (user.accountType === 'admin'
                  ? adminItems
                  : user.accountType === 'leader'
                    ? leaderItems
                    : items
                ).map((item, index) => (
                  <SideNavItem
                    key={index}
                    active={pathname === item.path}
                    disabled={item.disabled}
                    external={item.external}
                    icon={item.icon}
                    path={item.path}
                    title={item.title}
                  />
                ))
              : items.map((item, index) => (
                  <SideNavItem
                    key={index}
                    active={pathname === item.path}
                    disabled={item.disabled}
                    external={item.external}
                    icon={item.icon}
                    path={item.path}
                    title={item.title}
                  />
                ))}
          </Stack>
        </Box>
        <Divider sx={{ borderColor: 'neutral.700' }} />
        <Box
          sx={{
            px: 2,
            py: 3,
          }}
        >
          Created by D03N | 2020-2024 | Programmering nettstudie | Fagskolen i Viken @ Kongsberg
          <Button
            color="primary"
            component="a"
            endIcon={
              <SvgIcon fontSize="small" sx={{ color: 'neutral.300' }}>
                <ArrowTopRightOnSquareIcon />
              </SvgIcon>
            }
            href="https://github.com/Bjorgeh/rapportsystem-frontend"
            size="small"
            target="_blank"
            variant="text"
          >
            @GitHub Repo
          </Button>
        </Box>
      </Box>
    </Scrollbar>
  );

  if (lgUp) {
    return (
      <Drawer
        anchor="left"
        open
        PaperProps={{
          sx: {
            backgroundColor: 'neutral.800',
            color: 'common.white',
            width: 280,
          },
        }}
        variant="permanent"
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Drawer
      anchor="left"
      onClose={onClose}
      open={open}
      PaperProps={{
        sx: {
          backgroundColor: 'neutral.800',
          color: 'common.white',
          width: 280,
        },
      }}
      sx={{ zIndex: (theme) => theme.zIndex.appBar + 100 }}
      variant="temporary"
    >
      {content}
    </Drawer>
  );
};

SideNav.propTypes = {
  onClose: PropTypes.func,
  open: PropTypes.bool,
};
