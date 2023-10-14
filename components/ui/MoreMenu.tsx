import { Fragment } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { TbDotsVertical } from 'react-icons/tb'
import classNames from 'classnames'

export default function MoreMenu({ options }) {
  return (
    <Menu as="div" className="relative group-hover:opacity-100">
      <div>
        <Menu.Button className="flex items-center rounded-full">
          <TbDotsVertical className="text-gray-300" fontSize={22} />
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-10 mt-2 w-36 origin-top-right rounded-sm bg-gray-700 shadow-lg">
          <div className="py-1">
            {options.map((option, index) => {
              return (
                <Menu.Item
                  key={index}
                >
                  {({ }) => (
                    <div
                      onClick={option.onClick}
                      className={classNames(
                        // active ? 'bg-gray-500 text-gray-50' :
                        'text-gray-100',
                        'block px-4 py-2 text-sm'
                      )}
                    >
                      {option.label}
                    </div>
                  )}
                </Menu.Item>
              )
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}