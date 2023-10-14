
import axios from 'axios';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import { TbBookmarks } from 'react-icons/tb'

const SaveAction = ({ social, postId, setImage, saves = 0 }) => {
  const { user } = useUser();
  const router = useRouter();
  return (<div className='flex justify-start space-x-2'>
      <div className='hover:cursor-pointer'
        onClick={async () => {
          if (!user) { router.push('/signin'); return }
          if (social?.save === true && !social?.save) {
            setImage({ social: { ...social, downvote: false, upvote: true } })
            await axios.post('/api/social', { postId, action: 'save' })
            await axios.post('/api/social', { postId, action: 'unsave' })
          } else {
            setImage({ social: { ...social, save: !social?.save }, saves: social?.save ? saves - 1 : saves + 1 })
            await axios.post('/api/social', { postId, action: social?.save ? 'unsave' : 'save' })
          }
        }}>
        <TbBookmarks className={social?.save ? 'text-teal-300' : 'text-white'} fontSize={'22'} />
      </div>
      <div>{saves || ''}</div>
    </div>);
}
export default SaveAction;