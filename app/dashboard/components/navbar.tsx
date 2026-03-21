'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useData } from "@/context/data-provider"
import { useAuth } from "@/context/auth-provider"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import ImportButton from './import/import-button'
import { NotificationCenter } from '@/components/notifications/notification-center'
import { motion } from 'framer-motion'
import { useKeyboardShortcuts } from '../hooks/use-keyboard-shortcuts'
import { CombinedFilters } from './navbar-filters/combined-filters'
import { AccountSelector } from './navbar-filters/account-selector'
import { useUserStore } from '@/store/user-store'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { Separator } from '@/components/ui/separator'
import { TemplateSelector } from './template-selector'
import { signOut } from '@/server/auth'
import { Settings, LogOut, Wallet } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'

export default function Navbar() {
  const user = useUserStore(state => state.supabaseUser)
  const [mounted, setMounted] = useState(false)
  const [filtersPopoverOpen, setFiltersPopoverOpen] = useState(false)
  const [accountPopoverOpen, setAccountPopoverOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const { accountNumbers } = useData()
  const { forceClearAuth } = useAuth()

  useKeyboardShortcuts()

  const handleLogout = async () => {
    localStorage.clear()
    sessionStorage.clear()
    forceClearAuth()
    await signOut()
  }

  return (
    <motion.nav
      className="sticky top-0 z-40 flex items-center text-foreground bg-background/80 backdrop-blur-md border-b border-border w-full"
      initial={{ y: -48, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between w-full px-4 h-12">
        {/* Left: empty — sidebar has its own trigger at bottom */}
        <div className="flex items-center" />

        {/* Right: Account Selector + Filters + Template + Import + Notifications + Theme + Profile */}
        <div className="flex items-center gap-1.5">
          {/* Account Selector — Wallet icon */}
          <Popover open={accountPopoverOpen} onOpenChange={setAccountPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2.5 hover:bg-muted/50 border border-border/50 bg-card/50">
                <Wallet className="h-4 w-4" />
                {accountNumbers.length > 0 && (
                  <Badge variant="secondary" className="ml-1.5 h-5 px-1.5 text-xs">
                    {accountNumbers.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="p-0 w-auto max-w-[90vw]"
              align="end"
              sideOffset={4}
              collisionPadding={16}
            >
              <AccountSelector onSave={() => setAccountPopoverOpen(false)} />
            </PopoverContent>
          </Popover>

          {/* Filters */}
          <CombinedFilters
            onSave={() => setFiltersPopoverOpen(false)}
            open={filtersPopoverOpen}
            onOpenChange={setFiltersPopoverOpen}
          />

          {/* Template Selector */}
          <TemplateSelector />

          {/* Import */}
          <ImportButton />

          {/* Notifications */}
          <NotificationCenter />

          {/* Theme */}
          <ThemeSwitcher />

          {/* Profile dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="uppercase text-xs bg-muted text-foreground font-medium">
                    {user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" sideOffset={8}>
              <div className="flex items-center gap-3 p-3">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user?.user_metadata?.avatar_url} />
                  <AvatarFallback className="uppercase text-xs bg-muted text-foreground font-medium">
                    {user?.email?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-0.5 leading-none">
                  <p className="text-sm font-semibold truncate max-w-[160px]">
                    {user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate max-w-[160px]">
                    {user?.email || ''}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings" className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleLogout}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </motion.nav>
  )
}