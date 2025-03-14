import axios from "axios";


const api = axios.create({
    baseURL: '/proxy', //  timeout: 10000  // 添加請求超時設置
});


export const userService = {
    Login : async (usermail:string,password:string) => {
        try {
            const response = await api.post('/User/login',{
                usermail: usermail,
                password: password,
            });
            return response.data;
        } catch (error) {
            console.error("API 請求失敗:", error);
            return null;
        }
    },
    Signup : async (usermail:string,password:string) => {

    },
    PasswordChange : async (usermail:string,password:string) => {

    }
}