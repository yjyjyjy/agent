import Button from '@/components/ui/Button';
import { useUser } from '@supabase/auth-helpers-react';
import { useRouter } from 'next/router';
import { GetServerSidePropsContext } from 'next';
import { createPagesServerClient } from '@supabase/auth-helpers-nextjs';
import { useState } from 'react';
import axios from 'axios';
import DropDownMenu from '@/components/ui/DropDownMenu';
import { useToasts } from 'react-toast-notifications'

export default function Index() {
  const router = useRouter();
  const user = useUser()
  const [scholarId, setScholarId] = useState('')
  const [scholarAmount, setScholarAmount] = useState(0)
  const [recipeBody, setRecipeBody] = useState({
    prompt: '',
    negative_prompt: '',
    aspectRatio: 'portrait',
    sdCheckpoint: 'ReAL',
    cfg_scale: '7'
  })

  const { addToast } = useToasts()

  return (
    <div className="w-full min-h-screen flex justify-start items-start p-10 bg-gray-300">
      <div className='flex flex-col justify-start items-start text-black space-y-8 md:space-y-20'>
        {/* add recipe */}
        <div>
          <label className='text-2xl'>Add Recipe</label>
          <div className='flex flex-col space-y-1'>
            {/* prompt */}
            <div className='flex flex-col py-1 space-y-1 w-[800px]'>
              <label>Prompt</label>
              <textarea
                placeholder='prompt'
                rows={5}
                value={recipeBody.prompt}
                onChange={(e) => setRecipeBody({ ...recipeBody, prompt: e.target.value })}
                className='p-2'
              />
            </div>
            {/* neg prompt */}
            <div className='flex flex-col py-3 space-y-1 w-[800px]'>
              <label>Neg Prompt</label>
              <textarea
                placeholder='negative_prompt'
                rows={5}
                value={recipeBody.negative_prompt}
                onChange={(e) => setRecipeBody({ ...recipeBody, negative_prompt: e.target.value })}
                className='p-2'
              />
            </div>
            {/* options */}
            <div className='flex py-3 space-x-3 items-end'>
              <DropDownMenu
                title={recipeBody.sdCheckpoint}
                options={sdCheckpoints.map(cp => {
                  return {
                    label: cp.name,
                    onClick: () => setRecipeBody({ ...recipeBody, sdCheckpoint: cp.name })
                  }
                })}
                selected={recipeBody.aspectRatio}
              />
              <DropDownMenu
                title='aspectRatio'
                options={['landscape', 'square', 'portrait'].map(aspectRatio => {
                  return {
                    label: aspectRatio,
                    onClick: () => setRecipeBody({ ...recipeBody, aspectRatio })
                  }
                })}
                selected={recipeBody.aspectRatio}
              />
              <div className='flex flex-col'>
                <label>cfg_scale</label>
                <input
                  value={recipeBody.cfg_scale}
                  placeholder='cfg_scale'
                  type='number'
                  onChange={(e) => setRecipeBody({ ...recipeBody, cfg_scale: e.target.value })} />
              </div>
            </div>
            {/* submit */}
            <div className='w-48'>
              <Button
                onClick={async () => {
                  const { data, status } = await axios.post('/api/admin/recipe_add', recipeBody)
                  if (status === 200) {
                    addToast(`Recipe added ${data.recipeId}`, { appearance: 'success' })
                  } else {
                    addToast(`Error ${status}`, { appearance: 'error' })
                  }
                }}
                variant='slim'
              >
                Submit
              </Button>
            </div>

          </div>

        </div>
        {/* Clean */}
        <div className='py-10'>
          <Button
            onClick={() => fetch('/api/admin/delete_banned_user_files', { method: 'POST' })}
          >
            Purge Banned User Files
          </Button>
        </div>
        {/* <Button
          onClick={() => fetch('/api/admin', { method: 'POST' })}
        >
          Moderate
        </Button> */}
        <div className='flex space-x-2'>
          <input
            value={scholarId}
            type='text'
            placeholder='User ID'
            onChange={(e) => setScholarId(e.target.value)}
            className='p-2'
          />
          <input
            value={scholarAmount}
            placeholder='Amount'
            type='number'
            // @ts-ignore
            onChange={(e) => setScholarAmount(e.target.value)}
            className='p-2'
          />
          <Button
            onClick={async () => await axios.post('/api/admin/grantScholar', {
              userId: scholarId, amount: scholarAmount
            })}
            variant='slim'
          >
            Grant
          </Button>
        </div>
      </div>
    </div >
  )
    ;
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  // Create authenticated Supabase Client
  const supabase = createPagesServerClient(ctx)
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session || !session.user || session.user.id !== '41e7e23e-0407-4c8e-bf65-be908dff67d3')
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    }

  return {
    props: {
      user: session.user,
    },
  }
}


//