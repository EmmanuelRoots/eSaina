export const urls = {
  user : {
    LOGIN: `/user/login`,
    SUBSCRIBE: `/user/subscribe`,
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
    DELETE_REACTION : `/post/delete-reaction`,
    CREATE_COMMENT : `/post/create-comment`,
    GET_COMMENTS : `/post/get-comments`,
    },
    project: {
    MINE: `/project/mine`,
    CREATE: `/project/create`,
    GET_BY_ID: (id: string) => `/project/${id}`,
    UPDATE: (id: string) => `/project/${id}`,
    DELETE: (id: string) => `/project/${id}`,
    GET_BOARD: (id: string) => `/project/${id}/board`,
    GET_BACKLOG: (id: string) => `/project/${id}/backlog`,
    ADD_MEMBER: (id: string) => `/project/${id}/members`,
    REMOVE_MEMBER: (id: string, userId: string) => `/project/${id}/members/${userId}`,
    },
    sprint: {
    CREATE: `/sprint/create`,
    LIST: (projectId: string) => `/sprint/list?projectId=${projectId}`,
    UPDATE: (id: string) => `/sprint/${id}`,
    START: (id: string) => `/sprint/${id}/start`,
    CLOSE: (id: string) => `/sprint/${id}/close`,
    DELETE: (id: string) => `/sprint/${id}`,
    },
    issue: {
    CREATE: `/issue/create`,
    LIST: (projectId: string) => `/issue/list?projectId=${projectId}`,
    GET_BY_ID: (id: string) => `/issue/${id}`,
    UPDATE: (id: string) => `/issue/${id}`,
    DELETE: (id: string) => `/issue/${id}`,
    ADD_COMMENT: `/issue/comment`,
    GET_COMMENTS: (id: string) => `/issue/${id}/comments`,
    },
    label: {
    CREATE: `/label/create`,
    LIST: (projectId: string) => `/label/list?projectId=${projectId}`,
    DELETE: (id: string) => `/label/${id}`,
    },
    role: {
    GET_ALL: `/roles`,
    GET_TABLES: `/roles/tables`,
    CREATE: `/roles`,
    UPDATE: (id: string) => `/roles/${id}`,
    DELETE: (id: string) => `/roles/${id}`,
    },
    }