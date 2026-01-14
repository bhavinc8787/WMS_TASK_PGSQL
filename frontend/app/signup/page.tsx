'use client';

import React, { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { signup as signupThunk } from '@/store/authSlice';
import {
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import Link from 'next/link';
import { InputAdornment, IconButton } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';


const validationSchema = Yup.object({
  name: Yup.string().required('Name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Confirm password is required'),
});

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector((s) => s.auth.isLoading);
  const [error, setError] = useState('');
  const [strength, setStrength] = useState(0);
  const [strengthText, setStrengthText] = useState('');
  const [showPassword, setShowPassword] = useState(false);


  const checkPasswordStrength = (pass: string) => {
  let score = 0;
  if (pass.length >= 6) score += 33;
  if (/[A-Z]/.test(pass)) score += 33;
  if (/[^A-Za-z0-9]/.test(pass)) score += 34;

  setStrength(score);

  if (score <= 33) setStrengthText('Poor');
  else if (score <= 66) setStrengthText('Medium');
  else setStrengthText('Strong');
};
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setError('');
      try {
        await dispatch(signupThunk({ email: values.email, name: values.name, password: values.password })).unwrap();
        router.push('/dashboard');
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Signup failed');
      }
    },
  });

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
          position: 'relative',
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
            maxWidth: 500,
            p: 4,
            borderRadius: '16px',
            border: '1px solid rgba(0,0,0,0.1)',
            boxShadow: '0px 4px 12px rgba(0,0,0,0.08)',
            background: '#fff',
          }}
        >
          <Typography variant="h5" sx={{ mb: 2, textAlign: 'left', fontWeight: 'bold' }}>
            Sign up

          </Typography>

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

<form onSubmit={formik.handleSubmit}>

  {/* Name + Email Row */}
  <Box sx={{ display: 'flex', gap: 2 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, mb: 0.5, fontWeight: 200 }}>Full Name</Typography>
      <TextField
        fullWidth
        id="name"
        name="name"
        placeholder="Full Name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
        sx={{ '& .MuiInputBase-root': { height: 55 } }}
      />
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, mb: 0.5, fontWeight: 200 }}>Email</Typography>
      <TextField
        fullWidth
        id="email"
        name="email"
        placeholder="Email"
        type="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
        sx={{ '& .MuiInputBase-root': { height: 55 } }}
      />
    </Box>
  </Box>

  {/* Password + Confirm Password Row */}
  <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, mb: 0.5, fontWeight: 200 }}>Password</Typography>
      <TextField
        fullWidth
        id="password"
        name="password"
        placeholder="Password"
        type={showPassword ? 'text' : 'password'}
        value={formik.values.password}
        onChange={(e) => {
          formik.handleChange(e);
          checkPasswordStrength(e.target.value);
        }}
        onBlur={formik.handleBlur}
        error={formik.touched.password && Boolean(formik.errors.password)}
        helperText={formik.touched.password && formik.errors.password}
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

      {/* Strength Text */}
      {formik.values.password && strengthText && (
        <Typography sx={{ fontSize: 12, mt: 0.5, fontWeight: 200, color:
          strengthText === 'Poor' ? 'red' :
          strengthText === 'Medium' ? 'orange' :
          'green'
        }}>
          {strengthText}
        </Typography>
      )}
    </Box>

    <Box sx={{ flex: 1 }}>
      <Typography sx={{ fontSize: 14, mb: 0.5, fontWeight: 200 }}>Confirm Password</Typography>
      <TextField
        fullWidth
        id="confirmPassword"
        name="confirmPassword"
        placeholder="Confirm Password"
        type={showPassword ? 'text' : 'password'}
        value={formik.values.confirmPassword}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
        helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
        sx={{ '& .MuiInputBase-root': { height: 55 } }}
      />
    </Box>
  </Box>

  {/* Strength Progress Bar */}
  {formik.values.password && strength > 0 && (
    <Box sx={{ mt: 1 }}>
      <LinearProgress value={strength} variant="determinate" sx={{ height: 6, borderRadius: 3 }} />
    </Box>
  )}

  {/* Submit Button */}
  <Button
    fullWidth
    variant="contained"
    sx={{ mt: 3, mb: 2, borderRadius: '10px', height: '50px' }}
    type="submit"
    disabled={isLoading}
  >
    {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
  </Button>

</form>


          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/login" style={{ color: '#1976D2', textDecoration: 'none', fontWeight: 600 }}>
                Login here
              </Link>
            </Typography>
          </Box>
        </Box>

        {/* Bottom Left Footer */}
        <Typography sx={{ position: 'absolute', bottom: 10, left: 20, fontSize: 13, color: '#000' }}>
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
          alt="Signup Image"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />

        {/* Footer Links Row in Black */}
        <Box sx={{ position: 'absolute', bottom: 10, right: 20, display: 'flex', gap: 3 }}>
          <Typography sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>Terms and Conditions</Typography>
          <Typography sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>Privacy Policy</Typography>
          <Typography sx={{ fontSize: 13, color: '#000', cursor: 'pointer' }}>About Us</Typography>
        </Box>
      </Box>

    </Box>
  );
}
