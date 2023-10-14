'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'

import { type Chat, ServerActionResult } from '@/lib/types'
import { cn, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Chat/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from '@/components/ui/alert-dialog'
import {
  IconSpinner,
  IconTrash,
} from '@/components/ui/icons'
import Link from 'next/link'
import axios from 'axios'

interface SidebarActionsProps {
  chat: Chat
}

export function SidebarActions({
  chat,
}: SidebarActionsProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)
  const [isRemovePending, startRemoveTransition] = React.useTransition()
  const router = useRouter()

  const removeChat = () => {
    async function deleteChannel() {
      await axios.post('/api/chat/delete_channel', { channel_id: chat.id });
    }
    startRemoveTransition(() => {
      deleteChannel();
      // router.refresh()
      // router.push('/')
      toast.success('Chat deleted')
    })
  }

  return (
    <>
      <div className="space-x-1">
        <Button
          variant="ghost"
          className="h-6 w-6 p-0 hover:bg-background"
          disabled={isRemovePending}
          onClick={() => setDeleteDialogOpen(true)}
        >
          <IconTrash />
          <span className="sr-only">Delete</span>
        </Button>
      </div>
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete your chat message and remove your
              data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRemovePending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={isRemovePending}
                onClick={removeChat}
            >
              {isRemovePending && <IconSpinner className="mr-2 animate-spin" />}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
