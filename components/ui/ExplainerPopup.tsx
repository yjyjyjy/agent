import React, { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { AiOutlineQuestionCircle } from 'react-icons/ai';

const ExplainerPopup = ({ message }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <AiOutlineQuestionCircle
        className="text-gray-200 hover:text-white hover:cursor-pointer focus:outline-none"
        onClick={() => setIsOpen(true)}
      />

      <Transition.Root show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          static
          className="fixed inset-0 z-10 overflow-y-auto"
          open={isOpen}
          onClose={setIsOpen}
        >
          <div className="flex items-center justify-center min-h-screen">
            <Dialog.Overlay className="fixed inset-0 bg-base opacity-30" />

            <Transition.Child
              as={Fragment}
              enter="transition-opacity duration-100"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="absolute z-20 p-4 mt-16 text-sm max-w-md bg-white border border-gray-200 rounded-md shadow-lg">
                <button
                  className="absolute top-0 right-0 mt-2 mx-2 text-gray-400 hover:text-gray-600 hover:cursor-pointer"
                  onClick={() => setIsOpen(false)}
                >
                  &times;
                </button>
                <p className="text-gray-700">{message}</p>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>
    </div>
  );
};

export default ExplainerPopup;

// const ExplainerPopup = ({ message }) => {
//   const [isOpen, setIsOpen] = useState(false);

//   return (
//     <div className="relative inline-block">
//       <AiOutlineQuestionCircle
//         className="text-gray-200 hover:text-white hover:cursor-pointer focus:outline-none"
//         onClick={() => setIsOpen(!isOpen)}
//       />
//       <Transition
//         show={isOpen}
//         enter="transition-opacity duration-100"
//         enterFrom="opacity-0"
//         enterTo="opacity-100"
//         leave="transition-opacity duration-100"
//         leaveFrom="opacity-100"
//         leaveTo="opacity-0"
//       >
//         <div className="absolute mt-2 w-48 text-sm bg-white border border-gray-200 rounded-md shadow-lg z-10">
//           <div className="p-4">
//             <p className="text-gray-700">{message}</p>
//           </div>
//         </div>
//       </Transition>
//     </div>
//   );
// };

// export default ExplainerPopup;


