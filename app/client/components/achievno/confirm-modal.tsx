'use client'

/**
 * ═══════════════════════════════════════════════════════════════
 * ACHIEVNO CONFIRMATION MODAL
 * ═══════════════════════════════════════════════════════════════
 * Destructive action confirmation dialogs
 * ═══════════════════════════════════════════════════════════════
 */

import * as React from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { cn } from '@/lib/utils'

interface ConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  variant?: 'default' | 'destructive'
  isLoading?: boolean
}

export function ConfirmModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  variant = 'default',
  isLoading = false,
}: ConfirmModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-[340px] rounded-2xl bg-background-elevated border-border-strong">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-title">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-label text-secondary">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-row gap-2">
          <AlertDialogCancel
            className="flex-1 rounded-xl bg-background-input border-border-strong text-foreground hover:bg-background-elevated"
            disabled={isLoading}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(e) => {
              e.preventDefault()
              onConfirm()
            }}
            disabled={isLoading}
            className={cn(
              'flex-1 rounded-xl',
              variant === 'destructive'
                ? 'bg-destructive/15 text-destructive hover:bg-destructive/25 border border-destructive/25'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            )}
          >
            {isLoading ? 'Loading...' : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

// Pre-configured modals for common actions
export function DeleteAchievementModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'>) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Achievement?"
      description="This action cannot be undone. All progress will be permanently deleted."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

export function ArchiveAchievementModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'>) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Archive Achievement?"
      description="This achievement will be moved to your archive. You can restore it anytime."
      confirmLabel="Archive"
      onConfirm={onConfirm}
      variant="default"
      isLoading={isLoading}
    />
  )
}

export function LeaveGroupModal({
  open,
  onOpenChange,
  onConfirm,
  groupName,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'> & { groupName: string }) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Group?"
      description={`You will no longer be a member of "${groupName}". You can rejoin if the group is public.`}
      confirmLabel="Leave"
      onConfirm={onConfirm}
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

export function DeleteGroupModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'>) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Group?"
      description="This will permanently delete the group and all its achievements and challenges. This action cannot be undone."
      confirmLabel="Delete"
      onConfirm={onConfirm}
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

export function LogoutModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'>) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Log Out?"
      description="You will need to sign in again to access your achievements."
      confirmLabel="Log Out"
      onConfirm={onConfirm}
      variant="destructive"
      isLoading={isLoading}
    />
  )
}

export function DeleteAccountModal({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
}: Omit<ConfirmModalProps, 'title' | 'description' | 'confirmLabel' | 'variant'>) {
  return (
    <ConfirmModal
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Account?"
      description="This will permanently delete your account and all your data. This action cannot be undone."
      confirmLabel="Delete Account"
      onConfirm={onConfirm}
      variant="destructive"
      isLoading={isLoading}
    />
  )
}
