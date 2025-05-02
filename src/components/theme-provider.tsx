
"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { type ThemeProviderProps } from "next-themes/dist/types"
import { ThemeProvider as CustomThemeProvider } from "@/contexts/ThemeContext"
import { UserThemeProvider } from "@/contexts/UserThemeContext"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <CustomThemeProvider>
        <UserThemeProvider>
          {children}
        </UserThemeProvider>
      </CustomThemeProvider>
    </NextThemesProvider>
  )
}
