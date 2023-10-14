import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import { GetServerSidePropsContext } from 'next';
import {
  createPagesServerClient,
  User
} from '@supabase/auth-helpers-nextjs';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import LoadingDots from '@/components/ui/LoadingDots';
import Button from '@/components/ui/Button';
import { useUser } from '@/utils/useUser';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import { useRouter } from 'next/router';
import classNames from 'classnames';
import Toggle from '@/components/ui/Toggle';
import PillButton from '@/components/ui/PillButton';
import { BiCheck } from 'react-icons/bi';
import { AiOutlineEdit } from 'react-icons/ai';
import { MdCancel } from 'react-icons/md';

interface Props {
  title: string;
  description?: string;
  footer?: ReactNode;
  children: ReactNode;
}


function Card({ title, description, footer, children }: Props) {
  return (
    <div className="border border-zinc-700	max-w-3xl w-full p rounded-md m-auto my-8">
      <div className="px-5 py-4">
        <h3 className="text-2xl mb-1 font-medium">{title}</h3>
        <p className="text-zinc-300">{description}</p>
        {children}
      </div>
      <div className="border-t border-zinc-700 bg-zinc-900 p-4 text-zinc-500 rounded-b-md">
        {footer}
      </div>
    </div>
  );
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const supabase = createPagesServerClient(ctx);
  const {
    data: { session }
  } = await supabase.auth.getSession();

  if (!session)
    return {
      redirect: {
        destination: '/signin',
        permanent: false
      }
    };

  return {
    props: {
      initialSession: session,
      user: session.user
    }
  };
};

export default function Account({ user }: { user: User }) {
  const supabaseClient = useSupabaseClient();
  const router = useRouter()
  const [loading, setLoading] = useState(false);
  const { userDetails } = useUser();
  const { addToast } = useToasts()
  const [userProfileEditingMode, setUserProfileEditingMode] = useState(false)
  const [userName, setUserName] = useState(userDetails?.user_name || '')
  const [userNameError, setUserNameError] = useState(false)

  const redirectToCustomerPortal = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post('/api/create-portal-link', {})
      await axios.post('/api/logger', {
        message: `Creating payment portal for user: ${user?.id}, url data: ${JSON.stringify(data)}`,
      })
      const { url } = data
      if (!url) { throw new Error('No payment portal url created') }
      await axios.post('/api/logger', {
        message: `Creating payment portal for user: ${user?.id}, url: ${url}`,
      })
      try {
        window.open(url, '_blank').focus();
      } catch (error) {
        await axios.post('/api/logger', {
          message: `Try catching Error Creating payment portal for user: ${user?.id}, error: ${JSON.stringify(error as Error)}`
        })
        window.location.assign(url);
      }
    } catch (error) {
      await axios.post('/api/logger', {
        message: `Error Creating payment portal for user: ${user?.id}, error: ${JSON.stringify(error as Error)}`,
      })
      addToast((error as Error).message, { appearance: 'error', autoDismiss: true })
      return
    }
    setLoading(false);
  };



  // const subscriptionPrice =
  //   subscription &&
  //   new Intl.NumberFormat('en-US', {
  //     style: 'currency',
  //     currency: subscription?.prices?.currency,
  //     minimumFractionDigits: 0
  //   }).format((subscription?.prices?.unit_amount || 0) / 100);

  const handleProfileSave = async (action) => {
    let input = null;
    if (action === 'userName') {
      // if (!userName.match(/^@?(\w){4,15}$/)) {
      //   setUserNameError(true)
      //   addToast('Name is invalid.', { appearance: 'error', autoDismiss: true })
      //   return
      // }
      input = { user_name: userName }
    }
    const { status } = await axios.put('/api/users/profile', { ...input })
    if (status === 200) {
      addToast('Account Settings are updated.', { appearance: 'success', autoDismiss: true })
    }
    setUserProfileEditingMode(false)
  }

  useEffect(() => {
    setUserName(userDetails?.user_name || '')
  }, [userDetails?.user_name])

  return (
    <section className="bg-base min-h-screen">
      <div className="max-w-6xl mx-auto pt-8 sm:pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:flex-col sm:align-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-center sm:text-6xl">
            Account
          </h1>
        </div>
      </div>
      <div className="p-4">
        {/* <Card
          title={`Your Plan: ${subscription?.prices?.products?.name}`}
          description={
            subscription
              ? `Renewal Date: ${new Date(subscription?.current_period_end).toLocaleDateString()}`
              : ''
          }
          footer={
            <div className="flex items-start">
              <Button
                variant="slim"
                loading={loading}
                disabled={loading || !subscription}
                onClick={redirectToCustomerPortal}
              >
                Manage Subscription
              </Button>
            </div>
          }
        >
          <div className="text-xl mt-8 mb-4 font-semibold">
            {isLoading ? (
              <div className="h-12 mb-6">
                <LoadingDots />
              </div>
            ) : subscription ? (
              `${subscription?.prices?.products?.metadata.tokenAmount}💰 at ${subscriptionPrice}/${subscription?.prices?.interval}`
            ) : (
              <Link href="/pricing">Choose your plan</Link>
            )}
          </div>
        </Card> */}

        {/* profile card */}
        <Card
          title="Profile"
          description="How should we call you?"
        //footer={ }
        >
          <div className="text-xl mt-8 mb-4 font-semibold flex flex-col justify-start items-start">
            {userDetails ? (
              <>
                <div className='flex justify-start items-start'>
                  <span className='mr-3 md:pt-1'>Your Name: </span>
                  {!userProfileEditingMode ?
                    <>
                      <div className='pt-1'>
                        {userName}
                      </div>
                      <div className='ml-2'>
                        <PillButton
                          text={''}
                          icon={AiOutlineEdit}
                          onClick={() => setUserProfileEditingMode(true)}
                        />
                      </div>
                    </>
                    :
                    <div className='flex flex-col'>
                      <div className='flex'>
                        <input
                          type="text"
                          className="w-full border border-zinc-700 rounded-md px-2 pt-1 text-black"
                          placeholder="User Name"
                          onChange={(e) => {
                            setUserNameError(false)
                            setUserName(e.target.value)
                          }}
                          value={userName}
                        />
                        <div className='ml-2'>
                          <PillButton
                            text={''}
                            icon={BiCheck}
                            onClick={async () => handleProfileSave('userName')}
                          />
                        </div>
                        <div className='ml-2'>
                          <PillButton
                            text={''}
                            icon={MdCancel}
                            onClick={() => setUserProfileEditingMode(false)}
                          />
                        </div>
                      </div>
                      <div className={classNames('text-xs text-gray-300 pt-2 pb-4', userNameError ? 'text-red-400' : '')}>
                        Use only 1 word, please.
                      </div>
                    </div>
                  }
                </div>

              </>
            ) : (
              <div className="h-8 mb-6">
                <LoadingDots />
              </div>
            )}
          </div>
        </Card>
        <div className='w-full max-w-3xl m-auto flex justify-end'>
          <Button
            variant="slim"
            onClick={async () => {
              await supabaseClient.auth.signOut();
              router.push('/signin');
            }}
          >
            Sign out

          </Button>
        </div>
      </div>
    </section>
  );
}
