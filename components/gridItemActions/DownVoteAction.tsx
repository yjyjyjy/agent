import axios from 'axios';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import { TbArrowBigDownFilled, TbArrowBigDown } from 'react-icons/tb'

const DownVoteAction = ({ social, postId, setImage, votes }) => {
  const { user } = useUser();
  const router = useRouter();

  return (<div className='hover:cursor-pointer'
    onClick={async () => {
      if (!user) { router.push('/signin'); return }
      if (social?.upvote === true && !social?.downvote) {
        setImage({
          social: { ...social, upvote: false, downvote: true },
          votes: votes - 2
        });
        await axios.post('/api/social', { postId, action: 'unupvote' })
        await axios.post('/api/social', { postId, action: 'downvote' })
      } else {
        setImage({
          social: { ...social, downvote: !social?.downvote },
          votes: social?.downvote ? votes + 1 : votes - 1
        })
        await axios.post('/api/social', { postId, action: social?.downvote ? 'undownvote' : 'downvote' })
      }
    }}>
    {social?.downvote ? <TbArrowBigDownFilled className='text-teal-300' fontSize={'22'} /> : <TbArrowBigDown fontSize={'22'} />}
  </div>);
}
export default DownVoteAction;