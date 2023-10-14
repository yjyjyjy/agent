import axios from 'axios';
import { useRouter } from 'next/router';
import { useUser } from '@/utils/useUser';
import { TbArrowBigUpFilled, TbArrowBigUp } from 'react-icons/tb'

const UpVoteAction = ({ social, postId, setImage, votes, isDiscover = true }) => {
  const { user } = useUser();
  const router = useRouter();
  return (
    <div className=' flex justify-start space-x-2'>
      <div className='hover:cursor-pointer'
        onClick={async () => {
          if (!user) { router.push('/signin'); return }
          if (!isDiscover) return;
          if (social?.downvote === true && !social?.upvote) {
            setImage({
              social: { ...social, downvote: false, upvote: true },
              votes: votes + 2
            });
            await axios.post('/api/social', { postId, action: 'undownvote' })
            await axios.post('/api/social', { postId, action: 'upvote' })
          } else {
            console.log('anti-upvote')
            setImage({
              social: { ...social, upvote: !social?.upvote },
              votes: social?.upvote ? votes - 1 : votes + 1
            })
            await axios.post('/api/social', { postId, action: social?.upvote ? 'unupvote' : 'upvote' })
          }
        }}>
        {social?.upvote ? <TbArrowBigUpFilled className='text-teal-300' fontSize={'22'} /> : <TbArrowBigUp fontSize={'22'} />}
      </div>
      <div>{votes || ''}</div>
    </div>);
}
export default UpVoteAction;