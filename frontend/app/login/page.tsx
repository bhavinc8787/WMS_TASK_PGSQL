'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { login as loginThunk } from '@/store/authSlice';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Checkbox,
  FormControlLabel,
  InputAdornment,
  IconButton,
} from '@mui/material';
import Link from 'next/link';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const validationSchema = Yup.object({
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');

  const formik = useFormik({
    initialValues: { email: '', password: '' },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        await dispatch(loginThunk({ email: values.email, password: values.password })).unwrap();
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Login failed');
      }
    },
  });

  const handleForgot = () => {
    setProgressMsg('⚠ Forgot password feature currently work in progress...');
    setTimeout(() => setProgressMsg(''), 3000);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%' }}>

      {/* LEFT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          background: '#fff',
          px: 3,
        }}
      >

        {/* LOGO */}
        <Box sx={{ mb: 2 }}>
          <img src="/logo.4c5287a0.svg" alt="Logo" style={{ width: '120px', height: 'auto' }} />
        </Box>

        {/* CARD */}
        <Box
          sx={{
            width: '100%',
            maxWidth: 550,  // increased card width
            p: 4,
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
            background: '#fff',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'left', fontWeight: 'bold' }}>
            Login 
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {progressMsg && <Alert severity="warning" sx={{ mb: 2 }}>{progressMsg}</Alert>}

          <form onSubmit={formik.handleSubmit}>
            <TextField
              fullWidth
              id="email"
              name="email"
              label="Email"
              placeholder="Enter Email"
              type="email"
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              margin="normal"
              sx={{ '& .MuiInputBase-root': { height: 55 } }} // bigger width & height
            />

            <TextField
              fullWidth
              id="password"
              name="password"
              label="Password"
              placeholder="Enter Password"
              type={showPassword ? 'text' : 'password'}
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              margin="normal"
              sx={{ '& .MuiInputBase-root': { height: 55 } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Remember me + Forgot */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
              <FormControlLabel control={<Checkbox />} label="Remember Me" />
              <Typography
                variant="body2"
                sx={{ color: '#1976D2', fontWeight: 600, cursor: 'pointer' }}
                onClick={handleForgot}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, borderRadius: '10px', height: '50px' }}
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Login'}
            </Button>
          </form>

          <Box sx={{ textAlign: 'center', mt: 1 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/signup" style={{ color: '#1976D2', textDecoration: 'none', fontWeight: 600 }}>
                Sign up here
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Bottom Left Footer */}
        <Typography sx={{ position: 'absolute', bottom: 10, left: 20, fontSize: 13, color: '#555' }}>
          This site is protected by Privacy Policy
        </Typography>
      </Box>

      {/* RIGHT SIDE */}
      <Box
        sx={{
          flex: 1,
          display: { xs: 'none', md: 'flex' },
          justifyContent: 'center',
          alignItems: 'center',
          background: '#fafafa',
          height: '100vh',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src="/auth-bg.2cdc28ca.jpg"
          alt="Login Image"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Bottom Right Links */}
<Box
  sx={{
    position: 'absolute',
    bottom: 10,
    right: 20,
    display: 'flex',
    gap: 3,  // spacing between items
  }}
>
  <Typography variant="body2" sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>
    Terms and Conditions
  </Typography>
  <Typography variant="body2" sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>
    Privacy Policy
  </Typography>
  <Typography variant="body2" sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>
    About Us
  </Typography>
</Box>
      </Box>

    </Box>
  );
}
