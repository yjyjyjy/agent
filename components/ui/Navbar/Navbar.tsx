import Link from 'next/link';
import s from './Navbar.module.css';

import Logo from 'components/icons/Logo';
import { useRouter } from 'next/router';
import { useUser } from 'utils/useUser';
import {
  Bars3Icon,
  RocketLaunchIcon,
  GlobeEuropeAfricaIcon,
  CurrencyDollarIcon,
  BookOpenIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import classNames from 'classnames';
import { SiDiscord } from 'react-icons/si';
import { Mixpanel, MixpanelEvents } from 'lib/mixpanel';
import { useToasts } from 'react-toast-notifications';
import axios from 'axios';
import CreditCardForm from 'components/payment/payment-form';

const projects = [
  { id: 1, name: 'GraphQL API', href: '#' },
  { id: 2, name: 'iOS App', href: '#' },
]

export default function Navbar({ recipes }) {
  const router = useRouter();
  const { user, tokenBalance, getTokenBalance,
    // nextRefreshTsEpoch,
  } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  // const timerShown = nextRefreshTsEpoch && tokenBalance < 2;
  const timerShown = false;
  const { addToast } = useToasts()

  const [navBarUser, setNavBarUser] = useState([
    // { name: 'Chat', href: '/chat', icon: ChatBubbleOvalLeftEllipsisIcon },
    { name: 'Account', href: '/account', icon: UserCircleIcon },
  ])
  const [currentUrl, setCurrentUrl] = useState(null)

  var navigation = user ? navBarUser : []

  useEffect(() => {
    // window.location.href is accessible here


    setCurrentUrl(window.location.href.toString());
    // Do something with currentUrl
  }, []);

  useEffect(() => {
    if (user) {
      Mixpanel.identify(user.id)
      Mixpanel.people.set({
        $email: user.email,
        $id: user.id,
        $created: user.created_at,
        $last_login: new Date(),
      });
      // updateNavBarUser()

    }
  }, [user]);

  const Timer = (props: { totalSecondsToCountDown: number }) => {
    const { totalSecondsToCountDown } = props;
    const initialMinute = Math.floor(totalSecondsToCountDown / 60);
    const initialSeconds = totalSecondsToCountDown % 60;
    const [minutes, setMinutes] = useState(initialMinute);
    const [seconds, setSeconds] = useState(initialSeconds);
    useEffect(() => {
      let myInterval = setInterval(() => {
        if (seconds > 0) {
          setSeconds(seconds - 1);
        }
        if (seconds === 0) {
          if (minutes === 0) {
            clearInterval(myInterval)
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        }
      }, 1000)
      return () => {
        clearInterval(myInterval);
      };
    });

    useEffect(() => {
      if (minutes === 0 && seconds === 0) {
        getTokenBalance()
        addToast(`You Received new Tokens 💰`, { appearance: 'success', autoDismiss: true })
      }
    }, [seconds])

    return (
      <div>
        {minutes === 0 && seconds === 0
          ? null
          : <div className='text-white'>new 💰 arrives in {minutes}m{seconds < 10 ? `0${seconds}` : seconds}s</div>
        }
      </div>
    )
  }


  return (
    <nav className={s.root}>
      <div className='px-6 flex justify-between items-center py-2 md:py-4 relative'>
        {/* mobile menu */}
        {user && <div className='md:hidden z-40'>

          <Transition.Root show={sidebarOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10 lg:hidden" onClose={setSidebarOpen}>
              <Transition.Child
                as={Fragment}
                enter="transition-opacity ease-linear duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity ease-linear duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
              </Transition.Child>

              <div className="fixed inset-0 z-40 flex">
                <Transition.Child
                  as={Fragment}
                  enter="transition ease-in-out duration-300 transform"
                  enterFrom="-translate-x-full"
                  enterTo="translate-x-0"
                  leave="transition ease-in-out duration-300 transform"
                  leaveFrom="translate-x-0"
                  leaveTo="-translate-x-full"
                >
                  <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-gray-800 pt-5 pb-4">
                    <Transition.Child
                      as={Fragment}
                      enter="ease-in-out duration-300"
                      enterFrom="opacity-0"
                      enterTo="opacity-100"
                      leave="ease-in-out duration-300"
                      leaveFrom="opacity-100"
                      leaveTo="opacity-0"
                    >
                      <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                          type="button"
                          className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                          onClick={() => setSidebarOpen(sidebarOpen => !sidebarOpen)}
                        >
                          <span className="sr-only">Close sidebar</span>
                          <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                        </button>
                      </div>
                    </Transition.Child>
                    {/* <div className="flex flex-shrink-0 items-center px-4">
                      <Link href="/" className={s.logo}>
                        <Logo />
                      </Link>
                    </div> */}
                    <div className="mt-5 pt-10 h-0 flex-1 overflow-y-auto">
                      <nav className="px-2">
                        <div className="space-y-1">
                          {navigation.map((item) => (
                            <a
                              key={item.name}
                              href={item.href}
                              className={classNames(
                                router.pathname.includes(item.href)
                                  ? 'bg-gray-900 text-white'
                                  : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                'group flex items-center rounded-md px-2 py-2 text-base font-medium'
                              )}
                              aria-current={router.pathname.includes(item.href) ? 'page' : undefined}
                            >
                              <item.icon
                                className={classNames(
                                  router.pathname.includes(item.href) ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300',
                                  'mr-4 h-6 w-6 flex-shrink-0'
                                )}
                                aria-hidden="true"
                              />
                              {item.name}
                            </a>
                          ))}
                        </div>
                      </nav>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
                <div className="w-14 flex-shrink-0" aria-hidden="true">
                  {/* Dummy element to force sidebar to shrink to fit close icon */}
                </div>
              </div>
            </Dialog>
          </Transition.Root>

          <div>
            {user && <button
              type="button"
              className="flex items-center justify-center rounded-md text-gray-200"
              onClick={() => setSidebarOpen(sidebarOpen => !sidebarOpen)}
            >
              <Bars3Icon className="h-6 w-6" aria-hidden="true" />
            </button>}
          </div>
        </div>}
        <div className='md:hidden'>
          {(!timerShown) && (
            notification?.message ?
              <div className='text-teal-400 text-xs mx-2'>
                {notification.message}
              </div> :
              <Link href="/" className={s.logo}>
                <Logo />
              </Link>
          )}

        </div>

        {/* desktop menu */}
        <div className='hidden md:flex items-center'>
          <div className=''>
            <Link href="/" className={s.logo}>
              <Logo />
            </Link>
          </div>
          <div className='md:justify-start md:justify-items-start'>
            <nav className="space-x-4 ml-6 hidden md:block">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={s.link}>
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          {notification?.message && <div className={`text-teal-400 text-md mx-2 max-w-lg`}>
            {notification.message}
          </div>}
        </div>

        <div className='flex items-center space-x-2 md:space-x-4 '>
          {/* refresh */}
          {timerShown && <div className='flex flex-col items-center'>
            {/* <Timer totalSecondsToCountDown={(Math.floor((nextRefreshTsEpoch - Date.now()) / 1000))} /> */}
            <div className='underline'>
              <Link href="/pricing">
                get more now
              </Link>
            </div>
          </div>
          }
          {/* <div className='flex items-center hover:cursor-pointer'
            onClick={() => {
              Mixpanel.track(MixpanelEvents['Interact'], {
                action: 'creator_signup',
                entryPoint: 'nav_button_creator',
              })
              router.push('/join-us');
            }}
          >
            <button className="btn btn-xs">BECOME a creator 🚀</button>
          </div > */}

          {/* <div className=''>
            {!user && (
              <Link href="/signin" className={s.link}>
                Sign in
              </Link>
            )}
          </div> */}

          {user && <>
            <div className="stat-value text-primary text-lg">{
              //@ts-ignore
              tokenBalance ? tokenBalance.paidToken || tokenBalance.freeTextToken : 0} 💰</div>
            <button
              className="btn btn-xs"
              onClick={() =>
                //@ts-ignore
                document.getElementById('token_modal').showModal()
              }
            >
              Get Token
            </button>
            <div className=" z-10">
              <dialog id="token_modal" className="modal">
                <form method="dialog" className="modal-box">
                  <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
                  <CreditCardForm redirUrl={currentUrl} />
                </form>
              </dialog>
            </div>
          </>}

        </div >
      </div >
      {/* {bannedReason && (
        <div className='flex justify-center text-white bg-red-500 py-5 text-xl'>
          Your account has been suspended for sexualization of minors (18-)
        </div>
      )} */}
    </nav >
  );
};