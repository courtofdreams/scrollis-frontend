import { useAppAuthContext } from "../contexts/AppAuthContext";
import { LoginData, LoginResponse, RegisterData, RegisterResponse } from "../models/Account";
import { saveUserSession, saveNeedToConnectedSocial } from "../utils/TokenManager";


export type FieldError = {
    field: string;
    message: string;
};

export type ApiError = Error & {
    fields?: FieldError[];
    statusCode?: number;
};

export function useAuthentication() {

    const { setSession, accessToken, setNeedToConnectedSocial } = useAppAuthContext();

    const updateNeedToSyncSocialMedia = (value: boolean) => {
        console.log("access token app", accessToken);
        const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/user/need-to-connected-social`;
        try {
            fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json', 
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify({ value: value })
            });
            
            saveNeedToConnectedSocial(value);
            setNeedToConnectedSocial(value);
        } catch (error) {
            throw error;
        }
    };

    const signIn = async (data: LoginData): Promise<LoginResponse> => {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/login`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();
            console.log("Login response:", responseData);

            if (!response.ok) {
                if ((response.status === 400 || response.status === 401) && responseData.detail) {
                    const error = new Error(responseData.detail || 'Login failed') as ApiError;
                    error.fields = responseData.detail.fields ?? [];
                    throw error;
                } else {
                    const error = new Error('Login failed, please try again later.') as ApiError;
                    throw error;
                }
            }

            setSession({
                username: responseData.user.username,
                name: responseData.user.full_name,
                accessToken: responseData.access_token,
                loginStreak: responseData.user.login_streak,
            });

            saveUserSession(responseData.user.username, responseData.user.full_name, responseData.access_token);
            setNeedToConnectedSocial(responseData.user.need_to_connected_social);
            saveNeedToConnectedSocial(responseData.user.need_to_connected_social);


            return responseData;
        } catch (error) {
            throw error;
        }
    };

    const signUp = async (data: RegisterData): Promise<RegisterResponse> => {
        const apiUrl = `${process.env.EXPO_PUBLIC_API_BASE_URL}/api/auth/register`;

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            const responseData = await response.json();


            if (!response.ok) {
                if ((response.status === 400 || response.status === 409 || response.status === 422) && responseData.detail) {
                    const error = new Error(responseData.detail.message || 'Registration failed') as ApiError;
                    error.fields = responseData.detail.fields ?? [];
                    throw error;
                } else {
                    const error = new Error('Registration failed, please try again later.') as ApiError;
                    throw error;
                }
            }

            setSession({
                username: responseData.user.username,
                name: responseData.user.full_name,
                accessToken: responseData.access_token,
                loginStreak: responseData.user.login_streak,
            });

            saveUserSession(responseData.user.username, responseData.user.full_name, responseData.access_token);
            setNeedToConnectedSocial(responseData.user.need_to_connected_social);
            saveNeedToConnectedSocial(responseData.user.need_to_connected_social);

            return responseData;
        } catch (error) {
            throw error;
        }
    };

    return { signUp, signIn, updateNeedToSyncSocialMedia };
}