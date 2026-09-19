import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '893801875957-087mmmvot7airllmp1hc8v5of1fj7jgv.apps.googleusercontent.com';
const REDIRECT_URI = AuthSession.makeRedirectUri({ scheme: 'thinkvalley' });

const discovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://www.googleapis.com/oauth2/v4/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

export const googleAuthService = {
  async signIn() {
    try {
      const nonce = await Crypto.getRandomBytesAsync(16);
      const nonceString = Array.from(nonce)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        scopes: ['openid', 'profile', 'email'],
        redirectUri: REDIRECT_URI,
        responseType: AuthSession.ResponseType.IdToken,
        extraParams: {
          nonce: nonceString,
        },
      });

      const result = await request.promptAsync(discovery);

      if (result.type === 'success') {
        return {
          idToken: result.params.id_token,
          accessToken: result.params.access_token,
        };
      }

      throw new Error('Google sign-in was cancelled');
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  },
};
