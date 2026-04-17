// src/context/TwitterAuthContext.tsx
import React, { createContext, useContext, useMemo, useState } from 'react'

export type TwitterUser = {
  id: string
  username?: string
  name?: string
}

export type RedditUser = {
  id: string
  username?: string
  name?: string
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
  redditUser: RedditUser | null
  isRedditAuthenticated: boolean
  setRedditAccessToken: (redditAccessToken: string) => void
  setRedditUser: (redditUser: RedditUser) => void
  clearRedditAccessToken: () => void
  clearRedditUser: () => void

}

type AppAuthContextType = TwitterSession & RedditSession;

export const AppAuthContext = createContext<AppAuthContextType | undefined>(undefined)

export function TwitterAuthProvider({ children }: { children: React.ReactNode }) {
  const [twitterAccessToken, setTwitterAccessToken] = useState<string | null>(null)
  const [twitterUser, setTwitterUser] = useState<TwitterUser | null>(null)
  const [redditAccessToken, setRedditAccessToken] = useState<string | null>(null)
  const [redditUser, setRedditUser] = useState<RedditUser | null>(null)

  const value = useMemo(
    () => ({
      twitterAccessToken,
      twitterUser,
      isTwitterAuthenticated: !!twitterAccessToken,
      redditAccessToken,
      redditUser,
      isRedditAuthenticated: !!redditAccessToken,
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
      setRedditUser: (redditUser: RedditUser) => {
        setRedditUser(redditUser)
      },
      clearRedditAccessToken: () => {
        setRedditAccessToken(null)
      },
      clearRedditUser: () => {
        setRedditUser(null)
      }

    }),
    [twitterAccessToken, twitterUser, redditAccessToken, redditUser]
  )

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