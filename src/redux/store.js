import {configureStore} from '@reduxjs/toolkit'
import userReducer from './userSlice'
import seasonReducer from './seasonSlice'

export default configureStore({
  reducer: {
    userData: userReducer,
    seasonData: seasonReducer,
  },
})
