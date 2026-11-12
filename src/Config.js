const config = {
    API_URL: "",

    CALENDAR: {
        GET: "/api/todos/calendar",
    },

    TODOS: {
        LIST: "/api/todos",
        TOGGLE_COMPLETE: (todoId, date) => `/api/todos/${todoId}/dates/${date}/complete`,
    },

    CATEGORIES: {
        GET: "/api/categories",
    },

    PROFILE: {
        GET: "/api/profile",
        IMAGE: "/api/profile",
        INTRO: "/api/profile/intro",
    },

    YOUTUBE: {
        ME: "/api/youtube/me",
    },

    AUTH:{
        KAKAO: "/api/auth/kakao",
        REISSUE: "api/auth/reissue",
        LOGOUT: "api/auth/logout",
        WITHDRAW: "api/auth/withdraw"
    },
};

export default config;
