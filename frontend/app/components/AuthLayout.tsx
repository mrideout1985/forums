import {
  Box,
  Card,
  CardContent,
  Link as MuiLink,
  Typography,
} from '@mui/material';
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  heading: string;
  subtitle: string;
}

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
        {/* ── Branding panel (hidden on small screens) ── */}
        <Box
          sx={{
            display: { xs: 'none', md: 'flex' },
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flex: '0 0 45%',
            background: (t) =>
              `linear-gradient(145deg, ${t.palette.primary.main} 0%, ${t.palette.secondary.main} 100%)`,
            color: '#ffffff',
            px: 6,
            position: 'relative',
            overflow: 'hidden',
          }}
          aria-hidden="true"
        >
          {/* Decorative circles */}
          <Box
            sx={{
              position: 'absolute',
              width: 340,
              height: 340,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.22)',
              top: -60,
              left: -80,
            }}
          />
          <Box
            sx={{
              position: 'absolute',
              width: 220,
              height: 220,
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.18)',
              bottom: 80,
              right: -40,
            }}
          />

          <Typography
            variant="h2"
            fontWeight={700}
            sx={{ mb: 2, textAlign: 'center', position: 'relative' }}
          >
            Rideout Forums
          </Typography>
          <Typography
            variant="body1"
            sx={{
              opacity: 0.85,
              maxWidth: 320,
              textAlign: 'center',
              lineHeight: 1.7,
              position: 'relative',
            }}
          >
            Join the conversation. Share ideas, ask questions, and connect with
            like-minded people.
          </Typography>
        </Box>

        {/* ── Form panel ── */}
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
              {/* Mobile-only brand name */}
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
