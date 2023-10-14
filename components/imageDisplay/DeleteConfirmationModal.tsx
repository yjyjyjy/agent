
import { Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { useToasts } from 'react-toast-notifications';

const DeleteConfirmationModal = ({
  images,
  setImages,
  selectMode,
  setSelectMode,
  deleteConfirmOpen = false,
  setDeleteConfirmOpen,
}) => {
  const { addToast } = useToasts()
  const selectedImages = images.filter(i => i.selected)
  return (<>
    {/* Delete confirmation dialog box */}
    <Transition appear show={deleteConfirmOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setDeleteConfirmOpen(false)}>
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
                  Permanently Delete? {['post', 'project'].includes(images[0]?.type) && "(images won't be deleted)"}
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-200">
                    Selected {selectedImages.length} {images[0]?.type === 'post' ? 'post' : images[0]?.type === 'project' ? 'project' : `image(s)`} will be permanently deleted. Confirm?
                  </p>
                </div>

                <div className="mt-4 flex justify-evenly">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-500 text-white font-semibold px-4 py-2 text-sm hover:bg-teal-400"
                    onClick={async () => {
                      try {
                        let data, status
                        if (images[0]?.type === 'post') {
                          ({ data, status } = await axios.post('/api/post/delete_posts', { postIds: selectedImages.map(i => i.id) }))
                        } else {
                          ({ data, status } = await axios.post('/api/images/delete_images', { imageIds: selectedImages.map(i => i.id) }))
                        }
                        if (status === 200) {
                          setImages(images.filter(i => !i.selected))
                          setSelectMode(false)
                          addToast('Image(s) deleted', { appearance: 'success', autoDismiss: true })
                        } else {
                          throw new Error(`Error deleting images ${data.message}`)
                        }
                      } catch (error) {
                        addToast(error, { appearance: 'error', autoDismiss: true })
                      }
                      setDeleteConfirmOpen(false)
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200"
                    onClick={() => {
                      setDeleteConfirmOpen(false)
                      if (!selectMode) {
                        setImages(images.map(i => ({ ...i, selected: false })))
                      }
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
    </Transition>
  </>)
}

export default DeleteConfirmationModal;

