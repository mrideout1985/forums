import type { ReactNode } from 'react';
import { Box, Stack, Typography } from '@mui/material';

interface ContextHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export default function ContextHeader({
  title,
  description,
  action,
}: ContextHeaderProps) {
  return (
    <Box
      sx={{
        flexShrink: 0,
        borderBottom: 1,
        borderColor: 'divider',
        px: 3,
        py: 2,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <div>
          <Typography component="h1" variant="h5" fontWeight={600}>
            {title}
          </Typography>
          {description && (
            <Typography variant="body2" color="text.secondary">
              {description}
            </Typography>
          )}
        </div>
        {action}
      </Stack>
    </Box>
  );
}
