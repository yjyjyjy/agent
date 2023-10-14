import { Fragment, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dialog, Transition } from '@headlessui/react';
import { useUser } from '@/utils/useUser';
import { useToasts } from 'react-toast-notifications';
import { HiOutlineUserGroup } from 'react-icons/hi'
import classNames from 'classnames';
import PillButton from '../ui/PillButton';

const PublishImgAction = ({
  imageIds = [],
  isImgPublished = false,
  onDone = null,
}) => {
  const { user, userDetails } = useUser();
  const { addToast } = useToasts()
  const router = useRouter()
  const [userName, setUserName] = useState(userDetails?.user_name || '');
  const [isModalOpen, setModalOpen] = useState(false);
  const [userNameError, setUserNameError] = useState(false);
  const [isPublished, setPublished] = useState(isImgPublished);

  const handleProfileSave = async () => {
    if (!userName.match(/^@?(\w){4,15}$/)) {
      setUserNameError(true)
      addToast('User name is invalid.', { appearance: 'error', autoDismiss: true })
      return
    }
    const { status } = await axios.put('/api/users/profile', { userName: userName })
    if (status === 200) {
      addToast('User name is updated.', { appearance: 'success', autoDismiss: true })
      setUserName(userName.toLowerCase())
      setModalOpen(false);
      handlePostImg();
    }
  }

  const handlePostImg = async () => {
    if (!user) { router.push('/signin'); return }
    setPublished(!isPublished);
    const { status } = await axios.post('/api/post', { imageIds });
    if (status !== 200) {
      addToast('Error posting image', { appearance: 'error', autoDismiss: true })
    } else {
      addToast('Image published.', { appearance: 'success', autoDismiss: true })
      onDone(imageIds);
    }

  }

  return (<>
    <PillButton
      text={isImgPublished ? 'UnPublish' : 'Publish'}
      icon={HiOutlineUserGroup}
      onClick={() => {
        if (!userDetails?.user_name) {
          setModalOpen(true);
        } else {
          handlePostImg();
        }
      }}
    />
    <Transition appear show={isModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setModalOpen(false)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-base bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-slate-600 text-gray-50 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
                >
                  Create Username!
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-200">
                    Please create a username, which will be displayed as your identifier within the application. You can easily update your username at any time from the Account menu.
                  </p>
                </div>

                <div className='flex flex-col'>
                  <input
                    type="text"
                    className="w-full mt-2 border border-zinc-700 rounded-md px-2 pt-2 pb-2 text-black"
                    placeholder="User Name"
                    onChange={(e) => {
                      setUserNameError(false)
                      setUserName(e.target.value)
                    }}
                    value={userName}
                  />
                  <div className={classNames('text-xs text-gray-300 pt-2 pb-4', userNameError ? 'text-red-400' : '')}>
                    4-15 characters, letters, numbers, underscores only.
                  </div>
                </div>

                <div className="mt-4 flex justify-evenly">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-500 text-white font-semibold px-4 py-2 text-sm hover:bg-teal-400"
                    onClick={async () => handleProfileSave()}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  </>)
}

export default PublishImgAction;