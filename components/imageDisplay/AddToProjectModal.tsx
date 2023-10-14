
import { Fragment, useState, useEffect } from 'react';
import axios from 'axios';
import { Dialog, Transition } from '@headlessui/react';
import { useToasts } from 'react-toast-notifications';
import DropDownMenu from '@/components/ui/DropDownMenu';
import UiButton from '../ui/UiButton';

const AddToProjectModal = ({
  images,
  setImages,
  projects,
  setProjects,
  // selectedProject,
  // setSelectedProject,
  getProjects,
  selectMode = false,
  setSelectMode,
  addToProjectModalOpen = false,
  setAddToProjectModalOpen,
}) => {
  const { addToast } = useToasts()
  const selectedImages = images.filter(i => i.selected)
  // const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [addNew, setAddNew] = useState(false)
  const [newTitle, setNewTitle] = useState('')

  useEffect(() => {
    if (!selectedProject) setSelectedProject(projects[0])
  }, [projects])
  // const getProjects = async () => {
  //   if (addToProjectModalOpen && projects.length === 0) {
  //     const { status, data } = await axios.get('/api/projects')
  //     if (status === 200) { setProjects(data.projects); setSelectedProject(data.projects[0]) }
  //   }
  // }
  useEffect(() => { getProjects(); setAddNew(false) }, [addToProjectModalOpen])

  return (<>
    <Transition appear show={addToProjectModalOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={() => setAddToProjectModalOpen(false)}>
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
                  Organize images by projects
                </Dialog.Title>
                <div className="pt-2 pb-4">
                  <p className="text-sm text-gray-200">
                    Add {selectedImages.length} image(s) to a project?
                  </p>
                </div>

                {/* project selector */}
                {
                  addNew ?
                    <div className='flex flex-col pb-4'>
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="w-full border border-zinc-700 rounded-md px-2 py-1 text-black"
                        placeholder="Project name"
                      />
                      <div className='flex pt-2 ml-auto space-x-3'>
                        <UiButton
                          text='Save'
                          size='sm'
                          onClick={async () => {
                            if (newTitle.length < 1 || newTitle.length > 50) { addToast(`Title should be between 1 and 50 characters`, { appearance: 'error', autoDismiss: true }); return }
                            if (projects.map(p => p.title).includes(newTitle)) { addToast(`Duplicated Project Title`, { appearance: 'error', autoDismiss: true }); return }
                            const { status, data: { id, title } } = await axios.post('/api/projects', { title: newTitle })
                            if (status === 200) {
                              const newProject = { id, title };
                              setProjects([...projects, { ...newProject }]);
                              setSelectedProject(newProject)
                            }
                            setNewTitle('')
                            setAddNew(false)
                          }}
                        />
                        <UiButton
                          text='Cancel'
                          size='sm'
                          isPrimary={false}
                          onClick={() => {
                            setNewTitle('')
                            setAddNew(false)
                          }}
                        />
                      </div>
                    </div>
                    : <div className='flex items-center justify-between pb-4'>
                      <DropDownMenu
                        title={'Select a project'}
                        options={projects.map(project => {
                          return {
                            label: project.title,
                            onClick: () => setSelectedProject(project)
                          }
                        })}
                        selected={selectedProject?.title}
                      />
                      <UiButton
                        text='New Project'
                        isSecondary={true}
                        onClick={() => setAddNew(true)}
                      />
                    </div>
                }

                {/* image display */}
                <div>
                  <div className='grid grid-cols-3 gap-4'>
                    {selectedImages.slice(0, 5).map((image, index) => (<div key={index} className='relative'>
                      <img
                        src={image.imgUrl}
                        className='rounded-md'
                      />
                    </div>))}
                    {selectedImages.length > 5 && <div className='w-full h-full border border-gray-400 flex items-center justify-between p-3'>
                      <span>
                        and {selectedImages.length - 5} more
                      </span>
                    </div>}
                  </div>
                </div>

                {/* Confirm or cancel */}
                <div className="mt-4 flex justify-evenly">
                  <UiButton
                    text="Confirm"
                    onClick={async () => {
                      try {
                        const { status } = await axios.put('/api/projects/project_images', { projectId: selectedProject.id, imageIds: selectedImages.map(i => i.id) })
                        if (status === 200) {
                          setSelectMode(false)
                          addToast('Project Updated', { appearance: 'success', autoDismiss: true })
                        } else {
                          throw new Error(`Error updating project error code:${status}`)
                        }
                      } catch (error) {
                        addToast(error, { appearance: 'error', autoDismiss: true })
                      }
                      setAddToProjectModalOpen(false)
                      setImages(images.map(i => ({ ...i, selected: false })))
                    }}
                  />
                  <UiButton
                    text="Cancel"
                    isPrimary={false}
                    onClick={() => {
                      setAddToProjectModalOpen(false)
                      if (!selectMode) {
                        setImages(images.map(i => ({ ...i, selected: false })))
                      }
                    }}
                  />

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  </>)
}

export default AddToProjectModal;

