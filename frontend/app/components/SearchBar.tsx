import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Autocomplete,
  Box,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { type ForumResponseModel } from '~/generated/models/ForumResponseModel';
import { useForumSearch } from '~/hooks/api/useForumSearch';

export default function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data, isLoading } = useForumSearch(inputValue);

  const options = data?.content ?? [];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <Autocomplete<ForumResponseModel, false, false, true>
      freeSolo
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
      options={options}
      getOptionLabel={(option) =>
        typeof option === 'string' ? option : (option.name ?? '')
      }
      filterOptions={(x) => x}
      loading={isLoading && inputValue.length >= 1}
      loadingText="Searching..."
      noOptionsText={
        inputValue.length >= 1 ? 'No forums found' : 'Type to search'
      }
      inputValue={inputValue}
      onInputChange={(_event, newValue, reason) => {
        if (reason !== 'reset') {
          setInputValue(newValue);
        }
      }}
      onChange={(_event, value) => {
        if (value && typeof value !== 'string' && value.slug) {
          void navigate(`/forums/${value.slug}`);
          setInputValue('');
          setOpen(false);
          inputRef.current?.blur();
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          inputRef={inputRef}
          placeholder="Search forums... (Ctrl+K)"
          size="small"
          aria-label="Search forums"
          slotProps={{
            input: {
              ...params.InputProps,
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon
                    sx={{ color: 'inherit', opacity: 0.7 }}
                    aria-hidden="true"
                  />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              bgcolor: 'rgba(255, 255, 255, 0.15)',
              color: 'inherit',
              borderRadius: 1,
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              '&.Mui-focused': {
                bgcolor: 'rgba(255, 255, 255, 0.25)',
              },
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.3)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.5)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.7)',
              },
            },
            '& .MuiInputBase-input::placeholder': {
              color: 'inherit',
              opacity: 0.7,
            },
          }}
        />
      )}
      renderOption={(props, option) => {
        const { key, ...rest } = props;
        return (
          <Box component="li" key={key} {...rest}>
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {option.name}
              </Typography>
              {option.description && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: 300,
                  }}
                >
                  {option.description}
                </Typography>
              )}
            </Box>
          </Box>
        );
      }}
      sx={{
        width: '100%',
        maxWidth: 400,
      }}
    />
  );
}
