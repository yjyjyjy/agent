import { Transition, Dialog } from '@headlessui/react';
import { Fragment, useState } from 'react';
import axios from 'axios';
import { useToasts } from 'react-toast-notifications';

export default function ReportModal({ modalOpen, setModalOpen, postId, setImages, images }) {
  console.log('🔴🔴', postId)
  const [reporterComment, setReporterComment] = useState('');
  const { addToast } = useToasts()
  return (
    <Transition appear show={modalOpen} as={Fragment}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-white"
                >
                  Report Illegal Content
                </Dialog.Title>
                <div className="mt-2">
                  <textarea
                    className="w-full h-32 bg-gray-700 text-gray-100 rounded-md p-2 mt-2"
                    placeholder="Please describe the issue (optional)"
                    value={reporterComment}
                    onChange={(e) => setReporterComment(e.target.value)}
                  />
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-700 hover:bg-teal-200 "
                    onClick={async () => {
                      console.log('🔴🔴🔴🔴11111', postId)
                      const resp = await axios.post(`/api/social/report`, { postId, reporterComment })
                      if (resp.status === 200) {
                        addToast('Reported successfully', { appearance: 'success', autoDismiss: true })
                      } else {
                        addToast('Something went wrong. Please contact admin', { appearance: 'error', autoDismiss: true })
                      }
                      setReporterComment('')
                      const newImages = images => images.filter(image => image.id !== postId)
                      setImages(newImages)
                      setModalOpen(false)
                    }}
                  >
                    Submit
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}