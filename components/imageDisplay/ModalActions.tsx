import { BsFillChatLeftTextFill, BsImages, } from 'react-icons/bs';
import { TbBrush } from 'react-icons/tb';
import { FaRegWindowClose } from 'react-icons/fa';
import { MdInfo } from 'react-icons/md';
import { SiScrollreveal } from 'react-icons/si';
import { AiOutlineCloseCircle, AiOutlineCheckCircle, AiFillEdit, AiFillDelete } from 'react-icons/ai';
import { TbResize } from 'react-icons/tb';
import PillButton from '../ui/PillButton';
import Toggle from '../ui/Toggle';
import { BiShare, BiArrowBack, } from 'react-icons/bi';
import router from 'next/router';
import { v4 as uuid } from "uuid";
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import { useEffect, useState } from 'react';

const ModalActions = ({
  id,
  name,
  description,
  created_by, setModalOpen
}) => {
  const { addToast } = useToasts()

  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    checkIfUserLoggedinIsCreator();
  }, [])

  async function checkIfUserLoggedinIsCreator() {
    const supabase = createPagesBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (userId === created_by) {
      setShowEdit(true)
    }
  }

  const clickToChat = async () => {
    const supabase = createPagesBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      router.push(`/signin`)
    } else {
      let { data: userData, error } = await supabase
        .from('users')
        .select('user_name').eq('id', userId).single()
      const userName = userData.user_name
      const recentChatResponse = await axios.post(`/api/chat/query_recent_chat`, { char_id: id })
      if (recentChatResponse.data.chatExist) {
        router.push(`/chat/${recentChatResponse.data.channel_id}`)
      } else {
        const newChanID = uuid()
        const loadCharResponse = await axios.post(`/api/chat/init_chat`, { channel_id: newChanID, char_id: id, human_prefix: userName ? userName : 'user' })
        if (loadCharResponse.status === 200) {
          router.push(`/chat/${newChanID}`)
        }
        // console.log('loadCharResponse', loadCharResponse)
      }
      // router.push(`/chat/${id}/${uuid()}`)
    }
  }

  const clickToEdit = async () => {
    router.push({
      pathname: '/create',
      query: { data: JSON.stringify({ "char_id": id }) },
    })
  }

  const clickToShare = async () => {
    const idFromURL = new URL(window.location.toString());

    await navigator.clipboard.writeText(idFromURL.origin + '/' + name);
    addToast('link copied to clipboard!', { appearance: 'success', autoDismiss: true })
  }

  const clickToDelete = async () => {
    const supabase = createPagesBrowserClient()
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (!userId) {
      router.push(`/signin`)
    } else {
      const deleteResponse = await fetch(`/api/characters`, {
        method: 'DELETE', headers: {
          'Content-Type': 'application/json',
        }, body: JSON.stringify({ "id": id })
      })
      if (deleteResponse.status === 200) {
        addToast('character deleted!', { appearance: 'success', autoDismiss: true })
        router.push(`/`)
      } else {
        addToast('Delete Char Error!', { appearance: 'error', autoDismiss: true })
      }
    }
  }


  return (<>

    <div className='text-white flex justify-between items-left md:pt-2 space-x-1'>
      <div className="text-xl font-medium text-teal-200 ">
        {name}
      </div>
      <div className="text-l font-medium text-white-100 ">
        {created_by}
      </div>
    </div>

    <div className='text-white flex justify-between items-left md:pt-2 space-x-1 break-normal'>
      <div className="text-xs font-medium text-white-200 ">
        {description}
      </div>
    </div>
    <div className="divider" />

    <div className='text-white flex justify-between items-center md:pt-2 space-x-1 pb-2'>
      <PillButton
        text={'Back'}
        icon={BiArrowBack}
        onClick={() => { setModalOpen(false) }}
      />

      <PillButton
        text={'Chat'}
        icon={BsFillChatLeftTextFill}
        onClick={clickToChat}
      />

      {showEdit && <PillButton
        text={'Edit'}
        icon={AiFillEdit}
        onClick={clickToEdit}
      />}

      <PillButton
        text={'Share'}
        icon={BiShare}
        onClick={clickToShare}
      />


    </div>

    {/* {showEdit && <div className='text-white w-full flex justify-center items-center md:pt-2 space-x-1 pb-3'>
      <PillButton
        text={'Delete'}
        icon={AiFillDelete}
        onClick={clickToDelete}
      />

    </div>} */}


  </>)
}

export default ModalActions;

function addToast(arg0: string, arg1: { appearance: string; autoDismiss: boolean; }) {
  throw new Error('Function not implemented.');
}
