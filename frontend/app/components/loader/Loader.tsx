import { Box, CircularProgress } from '@mui/material';

const Loader = ({
  ready,
  render,
}: {
  ready: boolean;
  render: () => React.ReactNode;
}) => {
  if (!ready) {
    return (
      <Box
        component="main"
        id="maincontent"
        tabIndex={-1}
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  return <>{render()}</>;
};

export default Loader;
