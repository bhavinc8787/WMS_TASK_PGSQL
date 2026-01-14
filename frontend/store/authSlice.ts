import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User } from '@/types';
import { authAPI } from '@/lib/api';
import { setToken, removeToken, getToken } from '@/lib/auth';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  error?: string | null;
};

const initialState: AuthState = {
  user: null,
  // start as loading so app can block redirects until we verify token on mount
  isLoading: true,
  error: null,
};

export const verifyToken = createAsyncThunk('auth/verifyToken', async (_, { rejectWithValue }) => {
  const token = getToken();
  if (!token) return rejectWithValue('no-token');
  try {
    const response = await authAPI.verifyToken();
    return response.data.data as User;
  } catch (err: any) {
    removeToken();
    return rejectWithValue(err?.message || 'verify-failed');
  }
});

export const login = createAsyncThunk('auth/login', async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(email, password);
    const { token, user } = response.data.data;
    setToken(token);
    return user as User;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'login-failed');
  }
});

export const signup = createAsyncThunk('auth/signup', async ({ email, name, password }: { email: string; name: string; password: string }, { rejectWithValue }) => {
  try {
    const response = await authAPI.signup(email, name, password);
    const { token, user } = response.data.data;
    setToken(token);
    return user as User;
  } catch (err: any) {
    return rejectWithValue(err?.message || 'signup-failed');
  }
});

const slice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout(state) {
      removeToken();
      state.user = null;
      state.isLoading = false;
      state.error = null;
    },
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(verifyToken.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyToken.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(verifyToken.rejected, (state) => {
        state.user = null;
        state.isLoading = false;
      })

      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload as string | null;
      })

      .addCase(signup.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signup.fulfilled, (state, action: PayloadAction<User>) => {
        state.user = action.payload;
        state.isLoading = false;
      })
      .addCase(signup.rejected, (state, action) => {
        state.user = null;
        state.isLoading = false;
        state.error = action.payload as string | null;
      });
  },
});

export const { logout, setUser } = slice.actions;
export default slice.reducer;
