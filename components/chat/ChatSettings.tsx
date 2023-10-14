import { useState } from 'react';
import ExplainerPopup from '@/components/ui/ExplainerPopup';
import Button from '../ui/Button';
import axios from "axios";


// THIS FILE IS NOT USED

const ChatSettings = ({onData}) => {
  const [cId, setcId] = useState('')
  
  // get default settings

  const handleSaveSettings = async () => {
    // set settings
    const { status, data } = await axios.post('/api/chat/loadCharacter', { 
      channel_id : "admin",
      story_id : cId,
      human_prefix : "the dev"
    });
    
    onData(data.charSettings);
  }

  return (<>
    <div className='w-full flex flex-col justify-between'>
      <div className='flex justify-start items-center mb-2 mt-4'>
        <label
          className="text-md font-medium text-white pr-3">Load Character By ID</label>
        <ExplainerPopup message={'uuid here'} />
      </div>
      <textarea
        value={cId}
        placeholder={'Paste Character ID Here'}
        rows={5}
        onChange={(e) => { setcId(e?.target?.value) }}
        required={true}
        className="border text-sm rounded-lg block w-full p-2.5 bg-gray-700 placeholder-gray-400 text-white focus:ring-teal-500 focus:border-teal-500"
      />
      {/* <div className='flex width-full justify-between'> */}
      <Button className='m-4 mt-12' onClick={handleSaveSettings}>Save Settings</Button>
      {/* </div> */}
    </div>
  </>);
}

export default ChatSettings;