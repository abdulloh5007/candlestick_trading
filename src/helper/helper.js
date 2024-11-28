import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const host = 'http://localhost:8081'
const host2 = 'http://localhost:8080'

/** Make API Requests */

export const getCandles = async () => {
    try {
        const { data } = await axios.get(`${host}/api/candles`);
        return data; // Верните данные, чтобы использовать их в компоненте
    } catch (error) {
        console.error("Ошибка при получении данных с сервера:", error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
};

export const updateCandle = async (candle) => {
    try {
        // Если передан массив, берем последнюю свечу
        const candleToUpdate = Array.isArray(candle) ? candle[candle.length - 1] : candle;
        
        const response = await axios.post(`${host}/api/candles`, candleToUpdate);
        return response.data;
    } catch (error) {
        console.error('Error updating candle:', error.response ? error.response.data : error.message);
        throw error;
    }
};

export async function updateServerPrice(price) {
    try {
        const response = await axios.post(`${host}/api/price`, { price });
        return response.data; // Возврат данных при успешном запросе
    } catch (error) {
        console.error('Error updating price:', error.response?.data || error.message);
        throw error;
    }
}

export const getPrice = async () => {
    try {
        const { data } = await axios.get(`${host}/api/price`);        
        return data; // Верните данные, чтобы использовать их в компоненте
    } catch (error) {
        console.error("Ошибка при получении данных с сервера:", error);
        return []; // Возвращаем пустой массив в случае ошибки
    }
};

/** To get username from Token */
export async function getUsername() {
    const token = localStorage.getItem('token')
    if (!token) return Promise.reject("Cannot find Token");
    let decode = jwtDecode(token)
    return decode;
}

/** authenticate function */
export async function authenticate(username) {
    try {
        return await axios.post(`${host2}/api/authenticate`, { username })
    } catch (error) {
        return { error: "Username doesn't exist...! " + error }
    }
}

/** get User details */
export async function getUser({ username }) {
    try {
        const { data } = await axios.get(`${host2}/api/user/${username}`);
        return { data };
    } catch (error) {
        return { error: "Password doesn't Match...! " + error }
    }
}

/** register user function */
export async function registerUser(credentials) {
    try {
        const { data: { msg } } = await axios.post(`${host2}/api/register`, credentials);
        // let { username, email } = credentials;
        console.log(credentials);

        /** send email */
        // if (status === 201) {
        //     await axios.post('${host2}/api/registerMail', { username, userEmail: email, text: msg });
        // }

        return Promise.resolve(msg);
    } catch (error) {
        console.error("Error in registerUser:", error.response?.data || error.message);
        return Promise.reject({ error });
    }
}

/** login function */
export async function verifyPassword({ username, password }) {
    try {
        if (username) {
            const { data } = await axios.post(`${host2}/api/login`, { username, password })
            return Promise.resolve({ data });
        }
    } catch (error) {
        return Promise.reject({ error: "Password doesn't Match...! " + error })
    }
}

/** update user profile function */
export async function updateUser(response) {
    try {

        const token = await localStorage.getItem('token');
        const data = await axios.put(`${host2}/api/updateuser`, response, { headers: { "Authorization": `Bearer ${token}` } });

        return Promise.resolve({ data })
    } catch (error) {
        return Promise.reject({ error: "Couldn't Update Profile...! " + error })
    }
}

/** generate OTP */
export async function generateOTP(username) {
    try {
        const { data: { code }, status } = await axios.get(`${host2}/api/generateOTP`, { params: { username } });

        // send mail with the OTP
        if (status === 201) {
            let { data: { email } } = await getUser({ username });
            let text = `Your Password Recovery OTP is ${code}. Verify and recover your password.`;
            await axios.post(`${host2}/api/registerMail`, { username, userEmail: email, text, subject: "Password Recovery OTP" })
        }
        return Promise.resolve(code);
    } catch (error) {
        return Promise.reject({ error });
    }
}

/** verify OTP */
export async function verifyOTP({ username, code }) {
    try {
        const { data, status } = await axios.get(`${host2}/api/verifyOTP`, { params: { username, code } })
        return { data, status }
    } catch (error) {
        return Promise.reject(error);
    }
}

/** reset password */
export async function resetPassword({ username, password }) {
    try {
        const { data, status } = await axios.put(`${host2}/api/resetPassword`, { username, password });
        return Promise.resolve({ data, status })
    } catch (error) {
        return Promise.reject({ error })
    }
}