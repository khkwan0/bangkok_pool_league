import {createSlice} from '@reduxjs/toolkit'

export const seasonSlice = createSlice({
  name: 'season',
  initialState: {},
  reducers: {
    SetSeason: (state, action) => {
      state = action.payload
    },
  },
})

// Action creators are generated for each case reducer function
export const {SetSeason} = seasonSlice.actions

export default seasonSlice.reducer
