import {createSlice} from '@reduxjs/toolkit'

export const userSlice = createSlice({
  name: 'user',
  initialState: {
    user: {},
  },
  reducers: {
    SetUser: (state, action) => {
      state.user = action.payload
    },
    ClearUser: state => {
      state.user = {}
    },
  },
})

// Action creators are generated for each case reducer function
export const {SetUser, ClearUser} = userSlice.actions

export default userSlice.reducer
