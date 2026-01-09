import { urls } from '../../constants/urls'
import { axiosInstance } from '../utils/axios.utils'

const getUserSalon = async () => {
  const { data } = await axiosInstance
    .get(urls.salon.GET_USER_SALON)
    .catch(err => {
      throw err
    })

  return data
}

export default {
  getUserSalon,
}
