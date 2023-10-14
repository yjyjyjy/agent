import { Message, Chat, Character } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ChatList } from '@/components/chat/chat-list'
import { useState, useEffect, useRef } from 'react'
import { BsSendFill } from 'react-icons/bs';
import { useRouter } from 'next/router';
import { v4 as uuid } from 'uuid'
import { Mixpanel, MixpanelEvents } from 'lib/mixpanel';
import { useToasts } from 'react-toast-notifications';
import * as React from 'react'
import axios from 'axios'
import CreditCardForm from '../payment/payment-form'
import NewUserName from './new-username'
import { BiSupport } from 'react-icons/bi'
import { useUser } from '@/utils/useUser';

export const runtime = 'edge'

export default function ({ channel, character }) {
  console.log('✅✅✅ channel', channel)
  const UpsellPopup = ({ onClose }) => {
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-opacity-50 backdrop-filter backdrop-blur-md" onClick={onClose}>
      <div className="bg-white rounded-lg p-8 max-w-md" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-semibold mb-4" style={{ color: 'black' }}>Not Enough Tokens 🥹</h2>
        <p className="text-gray-600">You don't have enough tokens left. Please top up your tokens.</p>
        <form method="dialog" className="modal-box">
          <CreditCardForm redirUrl={router.pathname} />
        </form>
      </div>
    </div>
  };

  const { user, tokenBalance, setTokenBalance, userDetails } = useUser();
  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const [messages, setMessages] = useState([])
  const [userInput, setUserInput] = useState('');
  const [lastUserMsg, setLastUserMsg] = useState('');
  const [isBotResponding, setIsBotResponding] = useState(false);
  const router = useRouter()
  const [showUpsell, setShowUpsell] = useState(false);
  const [inputBoxEnabled, setInputBoxEnabled] = useState(true);
  const { addToast } = useToasts()
  const messagesEndRef = useRef(null);
  const [isAtTop, setIsAtTop] = useState(false);
  let lastScrollPosition = { current: 0 };
  const offset = 10; // You can adjust this value

  useEffect(() => {
    // init
    setMessages(channel.messages);
  }, [channel])

  useEffect(() => {
    function handleScroll() {
      const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
      // Check if we are at the very top of the page
      if (currentScrollPosition < offset) {
        setIsAtTop(true);
        setIsScrollingDown(false);
      } else {
        setIsAtTop(false);
        if (currentScrollPosition > lastScrollPosition.current) {
          setIsScrollingDown(true);
        } else {
          setIsScrollingDown(false);
        }
      }
      lastScrollPosition.current = currentScrollPosition;
    }
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Scroll to the bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // update message storage async function
    async function updateMessageStorage() {
      // update message storage
      const { status: messageUpdateStatus, data: messageUpdateData } = await axios.post('/api/chat/write_message', {
        channel_id: channel.id,
        messages: messages
      });
    }
    console.log('Updated messages:', messages);
    // if we have message and last message is send by user, we send it to the bot to process
    if (messages.length > 0 && messages[messages.length - 1].id === 'new' && lastUserMsg != '') {
      // waiting for response
      handleNewMessage()
    }
    // check if bot is responding
    if (messages.length === 0 ||
      messages[messages.length - 1].role === '<character>' ||
      messages[messages.length - 1].role === 'image_link'
    ) {
      setIsBotResponding(false)
    }
    // bot finished responding, update message storage
    if (messages.length > 0 && messages[messages.length - 1].role != 'function' && messages[messages.length - 1].id != 'new') {
      updateMessageStorage()
    }
  }, [messages])

  const handleNewMessage = async () => {
    if (tokenBalance.freeTextToken < character.price_tags.message && tokenBalance.paidToken < character.price_tags.message) {
      setShowUpsell(true);
      // setMessages([...messages.filter(m => m.id !== 'new')]);
      return
    }
    // send and get reply
    setInputBoxEnabled(false);
    window.scrollTo(0, document.body.scrollHeight);
    const { status, data: botReplyData } = await axios.post('/api/chat/send_message', {
      messages: messages.filter(m => m.id !== 'new'),
      channel_id: channel.id,
      char_id: channel.charId,
      human_prefix: userDetails?.user_name || "user",
      human_input: lastUserMsg,
      user_id: userDetails.id
    });
    if (status === 402 && botReplyData.message === 'Not enough token') {
      setInputBoxEnabled(true);
      setShowUpsell(true);
      return
    }

    if (status === 200) {
      const { sell_text: sellText, sell_image: sellImage, image_tier: imageTier } = botReplyData
      const textReply = sellText ? sellText : botReplyData.botMsg;
      console.log('🔴🔴🔴 ', sellText, sellImage)

      let messageUpdates: Message[] = [{
        id: uuid(),
        content: textReply,
        role: '<character>',
        tier: imageTier,
        nsfw: sellText ? true : false,
      }]

      if (sellImage) {
        // lets just directly send the image here with blur, bundle with text
        const { status: imgGenStatus, data: imgGenData } = await axios.post('/api/images/roll_for_image', {
          channel_id: channel.id,
          human_input: lastUserMsg,
          char_id: channel.charId,
          tier: imageTier,
        });
        console.log('🔴🔴🔴 ', imgGenStatus, imgGenData)
        if (imgGenStatus == 200 && imgGenData.url != "") {
          // add the image to the message
          // check if free image grant
          const numImageSent = messages.filter(m => m.role === 'image_link').length
          messageUpdates = [...messageUpdates, {
            id: uuid(),
            content: imgGenData.url,
            imgId: imgGenData.imgId,
            blur: imgGenData.blur ? imgGenData.blur : true,
            tier: numImageSent < character.free_content_grant ? -1 : imageTier,
            role: 'image_link'
          }]
        } else {
          // no image to show, we do nothing
          console.log('no image to show')
        }
      }

      if (botReplyData.pitch) {
        messageUpdates = [...messageUpdates, {
          id: uuid(),
          content: botReplyData.pitch,
          tier: imageTier,
          role: '<character>',
        }, {
          id: uuid(),
          content: botReplyData.pitch_image,
          imgId: "one-time-pitch",
          blur: false,
          tier: 0,
          role: 'image_link'
        }]
      }
      // update the message list
      setMessages([...messages.filter(m => m.id !== 'new'), ...messageUpdates]);

      setInputBoxEnabled(true);
      // charge for text and update balance
      const cost = sellText ? character.price_tags.special_message : character.price_tags.message
      const { status, data: updatedTokenBal } = await axios.post('/api/auth/charge_text', { cost: cost, ip: channel.tempChat ? userDetails.id : null })
      if (updatedTokenBal.tokenBalance === null && user.id) {
        addToast('Not enough token left', { appearance: 'error', autoDismiss: true })
        setShowUpsell(true);
        //@ts-ignore
        // document.getElementById("my_modal_3").showModal();
      } else {
        if (updatedTokenBal && updatedTokenBal.chargedFrom != 'free') {
          // successfully charged, update character metadata
          const { status, data } = await axios.post('/api/characters/update_character_metadata', {
            channel_id: channel.id,
            char_id: channel.charId,
            cost: cost,
            type: 'text'
          });
        }

        setTokenBalance(
          {
            paidToken: updatedTokenBal.tokenBalance.paidToken,
            freeTextToken: updatedTokenBal.tokenBalance.freeTextToken
          }
        )
      }
      // update metrics
      Mixpanel.track(MixpanelEvents['Interact'], {
        path: '/chat',
        action: 'sendMessage',
        userId: userDetails.id,
        paid: tokenBalance.paidToken > 0 ? true : false,
        channel_id: channel.id,
        character_slug: character.url_slug
      });
      window.scrollTo(0, document.body.scrollHeight);
    } else {
      setInputBoxEnabled(true);
      // error occured, revert to previous state
      Mixpanel.track(MixpanelEvents['Interact'], {
        path: '/chat',
        action: 'sendMessageError',
        userId: userDetails.id,
        channel_id: channel.id
      });
      setMessages([...messages.filter(m => m.id !== 'new')]);
    }
  }

  const handleCloseError = () => {
    setShowUpsell(false);
  };

  const handleMessageSent = async (evt) => {
    evt.preventDefault();
    if (!userDetails) { router.push('/signin'); return }
    console.log('submitting', userInput)
    // append the user message to the message list and update it
    const newMessage = {
      id: uuid(),
      content: userInput,
      role: '<user>'
    }
    // console.log('updated messages user', messages)
    setMessages([...messages, newMessage,
    {
      id: 'new',
      content: '...',
      role: 'function'
    }
    ]); // bot message placeholder

    // update states
    setIsBotResponding(true);
    setLastUserMsg(userInput);
    setUserInput('');

    // console.log('updated messages new', messages)
  }

  const handleClearChat = async () => {
    // call api to clear chat
    const { status, data } = await axios.post('/api/chat/clear_chat', {
      channel_id: channel.id
    });
    if (status === 200) {
      // reload character within the same channel
      const loadCharResponse = await axios.post(`/api/chat/reload_character`, { channel_id: channel.id, char_id: channel.charId, human_prefix: userDetails?.user_name || "user", })
      console.log('clear chat success')
      addToast('Chat Cache cleared')
      if (loadCharResponse.status === 200) {
        router.reload()
      }
    }
  }

  const unlockPremiumContent = async (msgId) => {
    if (!user?.id) {
      router.push('/signin');
      return false
    }
    console.log('unlock premium')
    // extract that message frist
    const imageMsg = messages.filter(m => m.id === msgId)[0]
    const cost = imageMsg.tier === -1 ? 0 : character.price_tags[`tier_${imageMsg.tier}`]
    try {
      // charge
      if (tokenBalance.paidToken < cost && tokenBalance.freeTextToken < cost) {
        setShowUpsell(true);
        return false
      } else {
        console.log('else????')
        // update the message storage as well
        // find the message and update it
        const updatedMessages = messages.map((msg) => {
          if (msg.id === msgId) {
            return {
              ...msg,
              blur: false
            }
          } else {
            return msg
          }
        }
        )
        // update the messages database thru api call=
        const { status, data } = await axios.post('/api/chat/write_message', {
          channel_id: channel.id,
          messages: updatedMessages
        });
        // update the message cache
        setMessages(updatedMessages)
        // update view images
        const { status: viewUpdateStatus, data: viewUpdateData } = await axios.post('/api/images/update_viewed_image', {
          imgId: imageMsg.imgId,
          channel_id: channel.id,
          charName: character.name,
          url: imageMsg.content,
        });
      }
    } catch (error) {
      console.log('chat.unlock premium error', error)
      return false
    }
    // charge tokens and update balance
    const { status, data: updatedTokenBal } = await axios.post('/api/auth/charge_text', { cost: cost, ip: channel.tempChat ? userDetails.id : null })
    if (status == 200 && updatedTokenBal.tokenBalance) {
      // successfully charged, update character metadata
      if (updatedTokenBal.chargedFrom != 'free') {
        const { status, data } = await axios.post('/api/characters/update_character_metadata', {
          channel_id: channel.id,
          char_id: channel.charId,
          cost: cost,
          type: 'image'
        });
      }

      setTokenBalance(
        {
          paidToken: updatedTokenBal.tokenBalance.paidToken,
          freeTextToken: updatedTokenBal.tokenBalance.freeTextToken
        }
      )
      return true;
    }
    return false;
  }

  return (
    //@ts-ignore
    (userDetails && userDetails.user_name === null) ? <NewUserName charName={character.name} /> :
      <div className="bg-black">

        {/* 🌳 clear memory modal */}
        <dialog id="clear_cache_modal" className="modal">
          <div className="modal-box">
            <div className="flex flex-col w-full border-opacity-50">
              <div className='flex flex-col justify-center items-center'>
                <h3 className="font-bold text-sm">Chat got stuck? Clear cache here.</h3>
                <p className="text-sm text-red-600">This will remove {character.name}'s memory</p>
                <button className="btn btn-primary " onClick={handleClearChat}>Clear</button>
              </div>


            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button>close</button>
          </form>
        </dialog>

        <div>

          {/* 🌳 messages */}
          <div className={messages.length > 0 && messages[messages.length - 1].role === 'function' ? cn('pb-[150px] pt-4 md:pt-10') : cn('pb-[100px] pt-4 md:pt-10')}>
            {messages.length ? (
              <>
                <ChatList messages={messages} character={character} unlockPremiumCallBack={unlockPremiumContent} />

                {/* <ChatScrollAnchor trackVisibility={isLoading} /> */}
              </>
            ) : (
              <h2 className="text-xl font-semibold mb-4">Loading Image...</h2>
            )}
            {showUpsell && <UpsellPopup onClose={handleCloseError} />}
          </div >
          <div ref={messagesEndRef} />

          {/* 🌳 send message */}
          <div className="fixed bottom-0 w-full rounded-t-lg bg-black shadow z-10 p-4">

            <div className="flex items-center space-x-4 px-1 pt-1 mb-1 sm:mb-0">

              <div className="items-center justify-center rounded-lg w-12 h-12 px-3 py-3 transition duration-500 ease-in-out text-white bg-secondary hover:bg-blue-400 focus:outline-none">
                <BiSupport fontSize={25} className='mr-2 text-white-500' onClick={() =>
                  //@ts-ignore
                  window.clear_cache_modal.showModal()} />
              </div>



              <div className="flex items-center justify-between py-2 w-full">
                <form className="flex flex-grow" onSubmit={(evt) => handleMessageSent(evt)}>

                  {inputBoxEnabled ?
                    <input type="text" placeholder="Write your message..." className="input input-bordered flex-grow mr-2" value={userInput} onChange={(e) => setUserInput(e?.target?.value)} />
                    :
                    <input type="text" disabled placeholder="Please wait ..." className="input input-bordered flex-grow mr-2" value='' />
                  }

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg w-12 h-12 px-4 py-3 transition duration-500 ease-in-out text-white bg-primary hover:bg-blue-400 focus:outline-none"
                    disabled={isBotResponding}
                  >
                    <BsSendFill />
                  </button>
                </form>
              </div>

            </div>

          </div>
        </div>
      </div>
  )
}



