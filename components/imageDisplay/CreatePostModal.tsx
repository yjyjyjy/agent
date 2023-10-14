import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/router';
import { Dialog, Transition } from '@headlessui/react';
import { useUser } from '@/utils/useUser';
import { useToasts } from 'react-toast-notifications';
import classNames from 'classnames';

const CreatePostModal = ({
  images,
  setImages,
  postModalOpen,
  setPostModalOpen,
  selectMode = false,
  setSelectMode,
}) => {
  const { user, userDetails } = useUser();
  const { addToast } = useToasts()
  const router = useRouter()

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState(false);
  const [checked, setChecked] = useState(false);
  const [checkedError, setCheckedError] = useState(false);

  const [userName, setUserName] = useState('');
  const [userNameError, setUserNameError] = useState(false);
  const [userNameModalOpen, setUserNameModalOpen] = useState(false);
  const selectedImages = images.filter(i => i.selected).slice(0, 9);

  useEffect(() => {
    if (userDetails?.user_name && userDetails?.user_name !== 'null') {
      setUserName(userDetails?.user_name);
    }
  }, [userDetails])

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
      setUserNameModalOpen(false);
      await handlePostImg();
    }
  }

  const handlePostImg = async () => {
    if (!checked) {
      console.log('checkedError', checkedError)
      setCheckedError(true)
      return
    }
    if (!user) { router.push('/signin'); return }
    console.log('!userName', !userName)
    console.log('userName?.length < 4', userName?.length < 4)
    if (!userName || userName?.length < 4 || userName === 'null') {
      setUserNameModalOpen(true);
      return
    }
    console.log('userName', userName)
    try {
      const { status } = await axios.post('/api/post', { images: selectedImages, title });
      if (status !== 200) {
        addToast('Error posting image', { appearance: 'error', autoDismiss: true })
      } else {
        addToast('Image published.', { appearance: 'success', autoDismiss: true })
        setImages(images.map(i => ({ ...i, selected: false })))
        setPostModalOpen(false)
        setSelectMode(false)
        setTitle('')
        setChecked(false)
        setCheckedError(false)
      }
    } catch (error) {
      console.log(error)
      addToast('error', { appearance: 'error', autoDismiss: true })
    }
  }

  return (<>
    {/* post modal */}
    <Transition appear show={postModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setPostModalOpen(false)}>
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
                  Share with the community!
                </Dialog.Title>
                <div className='flex flex-col'>
                  <input
                    type="text"
                    className="w-full mt-2 border border-zinc-700 rounded-md px-2 pt-2 pb-2 text-black"
                    placeholder="Title (optional)"
                    onChange={(e) => {
                      if (e.target.value.length > 50) {
                        setTitleError(true)
                        return
                      }
                      setTitleError(false)
                      setTitle(e.target.value)
                    }}
                    value={title}
                  />
                  <div className={classNames('text-sm text-gray-300 pt-2', (titleError || images.filter(i => i.selected).length > 9) ? 'text-red-400' : '')}>
                    Max 50 characters in title, 9 images selected.
                  </div>
                  <div className={classNames('flex cursor-pointer space-x-1 items-center text-sm pt-2 pb-4', (checkedError ? 'text-red-400' : 'text-yellow-300'))} onClick={() => setChecked(!checked)} >
                    <input type="checkbox" checked={checked} className="checkbox checkbox-accent" />
                    <div>
                      I confirm that my post does not have underage (18-) NSFW contents.
                    </div>
                  </div>
                </div>

                <div>
                  <div className='grid grid-cols-3 gap-4'>
                    {selectedImages.map((image, index) => (<div key={index} className='relative'>
                      <img
                        src={image.imgUrl}
                        className='rounded-md'
                      />
                    </div>))}
                  </div>
                </div>

                <div className="mt-4 flex justify-evenly">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-500 text-white font-semibold px-4 py-2 text-sm hover:bg-teal-400"
                    onClick={handlePostImg}
                  >
                    Post
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200"
                    onClick={() => {
                      if (!selectMode) {
                        setImages(images.map(i => ({ ...i, selected: false })))
                      }
                      setPostModalOpen(false)
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition >

    {/* username modal */}
    < Transition appear show={userNameModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setUserNameModalOpen(false)}>
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
                    onClick={() => setUserNameModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition >
  </>)
}

export default CreatePostModal;