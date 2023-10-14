'use client'

import { type Message } from '@/lib/types'

import { Button } from '@/components/ui/Chat/button'
import { IconCheck, IconCopy } from '@/components/ui/icons'
import { useCopyToClipboard } from '@/lib/hooks/use-copy-to-clipboard'
import { cn } from '@/lib/utils'
import { PiThumbsUpBold } from 'react-icons/pi'
import { PiThumbsUpFill } from 'react-icons/pi'


export function ChatMessageActions({
  className,
  messageId,
  role,
  likeMessageCallBack,
  messageTier,
  ...props
}) {

  return (
    <>
      <div
        className={cn(
          'flex items-center justify-end transition-opacity group-hover:opacity-100 md:absolute md:-right-10 md:-top-2 md:opacity-0',
          className
        )}
        {...props}
      >
        {role == 'AI' && <label className="swap swap-rotate ">
          <input type="checkbox" />
          <PiThumbsUpBold color='primary' className="swap-off fill-current w-5 h-5" />
          <PiThumbsUpFill className="swap-on fill-current w-5 h-5" onClick={() => likeMessageCallBack(messageId)} />
        </label>}
      </div>

    
      </>
  )
}
