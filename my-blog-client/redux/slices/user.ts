import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { IUser } from "../../types";

export interface UserState {
  isSignedIn: boolean;
  isLoading: boolean;
  data: IUser | null;
}

const initialState: UserState = {
  isSignedIn: false,
  isLoading: false,
  data: null
}

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    logout: (state) => {
      state.data = null
      state.isSignedIn = false
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.pending, (state) => {
      state.isLoading = true
      state.isSignedIn = false
    }),
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      state.data = action.payload
      state.isSignedIn = true
      state.isLoading = false
    }),
    builder.addCase(fetchUser.rejected, (state) => {
      state.isLoading = true
      state.isSignedIn = false
    })
  }
})

export const { logout } = userSlice.actions

export default userSlice.reducer

export const fetchUser = createAsyncThunk('products/fetchuser', async () => {
  const jwt = localStorage.getItem('jwt')

  if(jwt){
    const obj = JSON.parse(window.atob(jwt.split('.')[1]))

    try {
      const { data } = await axios.get(`http://localhost:1337/api/users/${obj.id}?populate=*`)
      const { avatarurl, email, username, id, about, articles } = data
      return { avatarurl, email, username, id, about, articles }
    } catch (e) {
      return null
    }
  } else {
    return null
  }
})