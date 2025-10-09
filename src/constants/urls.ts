export const urls = {
  user : {
    LOGIN: `/user/login`,
    REFRESH_TOKEN : `/user/refresh`,
    GET_USER_BY_TOKEN : `/user/me`,
    LOGOUT : `/user/logout`,
    GOOGLE_LOGIN : `/user/googleLogin`,
    SEARCH_USER : '/user/search-user'
  },
  conversation : {
    GET_ALL: `/conversation/all-conversation`,
    CREATE: `/conversation/create`
  },
  notification : {
    SEND:'notification/send',
  }
}