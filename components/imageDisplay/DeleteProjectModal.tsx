
import { Fragment } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { useToasts } from 'react-toast-notifications';

const DeleteProjectModal = ({
  project = { title: '', id: '' },
  projects,
  getProjects,
  setSelectedProject,
  deleteProjectModalOpen = false,
  setDeleteProjectModalOpen,
}) => {
  const { addToast } = useToasts()
  return (<>
    {/* Delete confirmation dialog box */}
    <Transition appear show={deleteProjectModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setDeleteProjectModalOpen(false)}>
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
                  Permanently Delete? (images won't be deleted)
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-gray-200">
                    "{project.title}" will be permanently deleted. Confirm?
                  </p>
                </div>

                <div className="mt-4 flex justify-evenly">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-500 text-white font-semibold px-4 py-2 text-sm hover:bg-teal-400"
                    onClick={async () => {
                      try {
                        // @ts-ignore
                        const { status } = await axios.delete(`/api/projects/${project.id}`)
                        if (status === 200) {
                          await getProjects()
                          setSelectedProject(projects[0])
                          addToast('Project deleted', { appearance: 'success', autoDismiss: true })
                        } else {
                          throw new Error(`Error deleting project`)
                        }
                      } catch (error) {
                        addToast(error.message, { appearance: 'error', autoDismiss: true })
                      }
                      setDeleteProjectModalOpen(false)
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-teal-100 px-4 py-2 text-sm font-medium text-teal-900 hover:bg-teal-200"
                    onClick={() => {
                      setDeleteProjectModalOpen(false)
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

export default DeleteProjectModal;

