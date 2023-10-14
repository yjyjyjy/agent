import { Message, Character } from '@/lib/types'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'

import { cn } from '@/lib/utils'
import { CodeBlock } from '@/components/ui/codeblock'
import { MemoizedReactMarkdown } from '@/components/markdown'
import { ChatMessageActions } from '@/components/chat/chat-message-actions'
import { IconUser, IconGitHub } from '@/components/ui/icons'
import BlurredImage from '../imageDisplay/ImageBlurableBox'

export interface ChatMessageProps {
  message: Message,
  character: Character
  unlockPremiumCallBack: (msgId: any) => Promise<boolean>
}


export function ChatMessage({ message, character, unlockPremiumCallBack, ...props }: ChatMessageProps) {
  return (
    <div
      className={cn('group relative mb-4 flex pl-3 pr-3 items-start md:-ml-12')}
      {...props}
    >
      <div className="indicator">
        {(message.role != 'image_link' && message.nsfw) && <span className="indicator-item indicator-bottom badge badge-secondary p-1">{character.price_tags.special_message} 💰</span>}
        <div
          className={cn(
            'flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border shadow',
            message.role === '<user>'
              ? 'bg-background'
              : 'bg-primary text-primary-foreground'
          )}
        >
          {message.role === '<user>' ? <IconUser />
            :
            character ?
              <div className="avatar">
                <div className="w-10 rounded">
                  <img src={character.image_url} />
                </div>
              </div> : <IconGitHub />
          }
        </div>
        {message.content == "..." && message.role == 'function' ? <div className="ml-4 padding-left-xl flex-1 space-y-2 overflow-hidden px-1">
          <span className="loading loading-dots loading-sm pl-1"></span>
        </div>
          : <div className="ml-4 padding-left-xl flex space-x-4 items-start overflow-hidden px-1">

            {message.role === 'image_link' ?
              // TODO blur here, call blur function instead, based on the blur flag
              // you also need to update the cost based on image tier here
              <BlurredImage imageSrc={message.content} blur={message.blur ?? true} unlockPremiumCallBack={unlockPremiumCallBack} msgId={message.id} cost={message.tier === -1 ? 'free' : character.price_tags[`tier_${message.tier}`]} />
              :
              <MemoizedReactMarkdown
                className="prose break-words dark:prose-invert prose-p:leading-relaxed prose-pre:p-0"
                remarkPlugins={[remarkGfm, remarkMath]}
                components={{
                  p({ children }) {
                    return <p className="mb-2 last:mb-0">{children}</p>
                  },
                  code({ node, inline, className, children, ...props }) {
                    if (children.length) {
                      if (children[0] == '▍') {
                        return (
                          <span className="mt-1 animate-pulse cursor-default">▍</span>
                        )
                      }

                      children[0] = (children[0] as string).replace('`▍`', '▍')
                    }

                    const match = /language-(\w+)/.exec(className || '')

                    if (inline) {
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      )
                    }

                    return (
                      <CodeBlock
                        key={Math.random()}
                        language={(match && match[1]) || ''}
                        value={String(children).replace(/\n$/, '')}
                        {...props}
                      />
                    )
                  }
                }}
              >
                {message.content}
              </MemoizedReactMarkdown>
            }

            {/* {message.role !== '<user>' && <ChatMessageActions messageTier={message.tier} likeMessageCallBack={likeMessageCallBack} messageId={message.id} role='AI' className={undefined} />} */}
          </div>}

      </div>
    </div>



  )
}
