import {createSlice} from '@reduxjs/toolkit'
import type {PayloadAction} from '@reduxjs/toolkit'

export interface UserState {
  user: {
    data: any
  }
}

const initialState: UserState = {
  user: {
    data: {},
  },
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    SetUser: (state, action: PayloadAction<object>) => {
      state.user.data = action.payload
    },
    ClearUser: state => {
      state.user.data = {}
    },
  },
})

// Action creators are generated for each case reducer function
export const {SetUser, ClearUser} = userSlice.actions

export default userSlice.reducer
