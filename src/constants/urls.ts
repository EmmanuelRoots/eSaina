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
    CREATE: `/conversation/create`,
    SEND_MESSAGE: `/conversation/send-message`,
    GET_ALL_MESSAGE : `/conversation/get-all-messages`
  },
  notification : {
    SEND:'notification/send',
  }
}