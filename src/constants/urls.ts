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
    SEND:'/notification/send',
  },
  salon : {
    GET_USER_SALON : `/salon/get-user-salon`,
  },
  post : {
    GET_POST_SALON : `/post/get-salon-post`,
    CREATE_POST : `/post/create-post`,
    ADD_REACTION : `/post/add-reaction`,
  },
}