import { type Message, Character } from '@/lib/types'
import { useEffect, useState } from 'react';

import { Separator } from '@/components/ui/separator'
import { ChatMessage } from '@/components/chat/chat-message'

export interface ChatList {
  messages: Message[],
  character: Character
  unlockPremiumCallBack: (msgId: any) => Promise<boolean>
}


export function ChatList({ messages, character, unlockPremiumCallBack }: ChatList) {
  if (!messages.length) {
    return null
  }

  return (
    <div className="relative mx-auto max-w-2xl px-2">
      {messages.map((message, index) => (
        <div key={index}>
          <ChatMessage message={message} character={character} unlockPremiumCallBack={unlockPremiumCallBack} />
          {index < messages.length - 1 && (
            <Separator className="my-4 md:my-8" />
          )}
        </div>
      ))}
    </div>
  )
}
