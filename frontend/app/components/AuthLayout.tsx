import {
  Box,
  Card,
  CardContent,
  Link as MuiLink,
  Stack,
  Typography,
} from '@mui/material';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subtitle: string;
}

const features = [
  {
    icon: <ChatBubbleOutlineIcon />,
    text: 'Join a community of like-minded people',
  },
  { icon: <MenuBookIcon />, text: 'Share knowledge and ideas' },
  { icon: <ForumOutlinedIcon />, text: 'Discuss topics you love' },
  { icon: <GroupOutlinedIcon />, text: 'Make connections that last' },
];

export default function AuthLayout({
  children,
  heading,
  subtitle,
}: AuthLayoutProps) {
  return (
    <>
      {/* Skip navigation link */}
      <MuiLink
        href="#maincontent"
        sx={{
          position: 'absolute',
          left: '-9999px',
          '&:focus': {
            left: 0,
            top: 0,
            zIndex: 9999,
            p: 2,
            bgcolor: 'background.paper',
          },
        }}
      >
        Skip to main content
      </MuiLink>

      <Box
        component="main"
        id="maincontent"
        tabIndex={-1}
        sx={{
          display: 'flex',
          minHeight: '100vh',
        }}
      >
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            flex: '0 0 45%',
            background: (t) =>
              `linear-gradient(145deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
            color: '#ffffff',
            px: { md: 6, lg: 8 },
            position: 'relative',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* Subtle background pattern */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              opacity: 0.06,
              backgroundImage:
                'radial-gradient(circle at 25% 25%, #fff 1px, transparent 1px), radial-gradient(circle at 75% 75%, #fff 1px, transparent 1px)',
              backgroundSize: '32px 32px',
            }}
          />

          <Box sx={{ position: 'relative', maxWidth: 400 }}>
            <Typography
              variant="overline"
              sx={{ opacity: 0.7, letterSpacing: 3 }}
            >
              Welcome to
            </Typography>
            <Typography
              variant="h2"
              fontWeight={700}
              sx={{ mb: 1, lineHeight: 1.1 }}
            >
              Rideout Forums
            </Typography>
            <Typography
              variant="body1"
              sx={{ opacity: 0.8, mb: 5, lineHeight: 1.7 }}
            >
              Your space to discuss, learn, and connect.
            </Typography>

            <Stack spacing={3}>
              {features.map((feature) => (
                <Stack
                  key={feature.text}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {feature.text}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Box>

        <Box
          sx={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            bgcolor: 'background.default',
            px: 2,
            py: 4,
          }}
        >
          <Card
            sx={{
              width: '100%',
              maxWidth: 440,
              border: '1px solid transparent',
              boxShadow: (t) =>
                t.palette.mode === 'dark'
                  ? '0 4px 32px rgba(0,0,0,0.4)'
                  : '0 4px 32px rgba(0,0,0,0.08)',
            }}
          >
            <CardContent sx={{ p: { xs: 3, sm: 5 } }}>
              <Typography
                variant="overline"
                color="primary"
                sx={{ display: { xs: 'block', md: 'none' }, mb: 1 }}
              >
                Rideout Forums
              </Typography>

              <Typography component="h1" variant="h4" fontWeight={700} mb={0.5}>
                {heading}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                {subtitle}
              </Typography>

              {children}
            </CardContent>
          </Card>
        </Box>
      </Box>
    </>
  );
}
