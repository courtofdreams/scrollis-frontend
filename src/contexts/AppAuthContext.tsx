// src/context/TwitterAuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getNeedToConnectedSocial, getRedditSession, getTwitterSession, getUserSession } from '../utils/TokenManager'

export type TwitterUser = {
  id: string
  username?: string
  name?: string
}

export type RedditUser = {
  username: string
}

export type TwitterSession = {
  twitterAccessToken: string | null
  twitterUser: TwitterUser | null
  isTwitterAuthenticated: boolean
  setTwitterAccessToken: (
    twitterAccessToken: string,
  ) => void
  setTwitterUser: (twitterUser: TwitterUser) => void
  clearTwitterAccessToken: () => void
  clearTwitterUser: () => void
}

export type RedditSession = {
  redditAccessToken: string | null
  username: string
  isRedditAuthenticated: boolean
  setRedditAccessToken: (redditAccessToken: string) => void
  setRedditUser: (redditUser: string) => void
  clearRedditAccessToken: () => void
  clearRedditUser: () => void

}

export type UserSession = {
  username: string
  name: string
  isAuthenticated: boolean
  accessToken: string | null
  loginStreak?: number
  setSession: (session: { username: string; name: string, accessToken: string | null, loginStreak?: number }) => void
  clearSession: () => void
}

type AppAuthContextType = TwitterSession & RedditSession & UserSession & {
  needToConnectedSocial: boolean
  setNeedToConnectedSocial: (need: boolean) => void
  isAuthHydrated: boolean
  hasPersistedSession: boolean
};

export const AppAuthContext = createContext<AppAuthContextType | undefined>(undefined)

export function TwitterAuthProvider({ children }: { children: React.ReactNode }) {
  const [twitterAccessToken, setTwitterAccessToken] = useState<string | null>(null)
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null)
  const [redditAccessToken, setRedditAccessToken] = useState<string | null>(null)
  const [redditUser, setRedditUser] = useState<string | null>(null)
  const [username, setUsername] = useState<string>('')
  const [name, setName] = useState<string>('')
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false)
  const [needToConnectedSocial, setNeedToConnectedSocial] = useState<boolean>(true)
  const [isAuthHydrated, setIsAuthHydrated] = useState<boolean>(false)
  const [hasPersistedSession, setHasPersistedSession] = useState<boolean>(false)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [loginStreak, setLoginStreak] = useState<number>(0)

  const value = useMemo(
    () => ({
      twitterAccessToken,
      twitterUser,
      isTwitterAuthenticated: !!twitterAccessToken,
      redditAccessToken,
      redditUser,
      isRedditAuthenticated: !!redditAccessToken,
      username,
      name,
      isAuthenticated,
      accessToken,
      loginStreak,
      setSession: (session: { username: string; name: string, accessToken: string | null, loginStreak?: number }) => {
        setUsername(session.username)
        setName(session.name)
        setAccessToken(session.accessToken)
        setLoginStreak(session.loginStreak || 0)
        setIsAuthenticated(true)
    
      },
      clearSession: () => {
        setUsername('')
        setName('')
        setAccessToken(null)
        setLoginStreak(0)
        setIsAuthenticated(false)
      },
      setTwitterAccessToken: (twitterAccessToken: string) => {
        setTwitterAccessToken(twitterAccessToken)
      },
      setTwitterUser: (twitterUser: TwitterUser) => {
        setTwitterUser(twitterUser)
      },
      clearTwitterAccessToken: () => {
        setTwitterAccessToken(null)
        setTwitterUser(null)
      },
      clearTwitterUser: () => {
        setTwitterUser(null)
      },
      setRedditAccessToken: (redditAccessToken: string) => {
        setRedditAccessToken(redditAccessToken)
      },
      setRedditUser: (redditUser: string) => {
        setRedditUser(redditUser)
      },
      clearRedditAccessToken: () => {
        setRedditAccessToken(null)
      },
      clearRedditUser: () => {
        setRedditUser(null)
      },
      needToConnectedSocial,
      isAuthHydrated,
      hasPersistedSession,
      setNeedToConnectedSocial: (need: boolean) => {
        setNeedToConnectedSocial(need)
      }
    }),
    [twitterAccessToken, twitterUser, redditAccessToken, redditUser, username, name, isAuthenticated, needToConnectedSocial, isAuthHydrated, hasPersistedSession, accessToken, loginStreak]
  )


  useEffect(() => {
    
    try {
      const loadSession = async () => {
        const needToConnectedSocial = await getNeedToConnectedSocial();
        console.log("needToConnectedSocial loaded:", needToConnectedSocial);
        setNeedToConnectedSocial(needToConnectedSocial);

        const session = await getUserSession();
        if (session) {
          setUsername(session.username);
          setName(session.name);
          setAccessToken(session.accessToken);
          setIsAuthenticated(true);
          setHasPersistedSession(true);
          console.log("session loaded:", session);
        } else {
          setHasPersistedSession(false);
        }

        const xSession = await getTwitterSession();
        if (xSession) {
          setTwitterAccessToken(xSession.twitterAccessToken);
          setTwitterUser(xSession.twitterUser);
          console.log("twitter session loaded:", xSession);
        }

        const rSession = await getRedditSession();
        if (rSession) {
          setRedditAccessToken(rSession.redditAccessToken);
          setRedditUser(typeof rSession.redditUser === 'string' ? rSession.redditUser : rSession.redditUser.username);
          console.log("reddit session loaded:", rSession);
        }

        setIsAuthHydrated(true);

      };
  
      loadSession();
    } catch (err) {
      console.error("Failed to load user session:", err);
    }

  }, [])

  return (
    <AppAuthContext.Provider value={value}>
      {children}
    </AppAuthContext.Provider>
  )
}

export function useAppAuthContext() {
  const ctx = useContext(AppAuthContext)
  if (!ctx) throw new Error('useAppAuthContext must be used inside AppAuthProvider')
  return ctx
}