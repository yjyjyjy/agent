import axios from 'axios';
import { useEffect, useState } from 'react';
import { saveAs } from 'file-saver';

const CharacterModalActions = ({
  charId
}) => {
  const [analytics, setAnalytics] = useState(null)

  useEffect(() => {
    // get user analytics
    const fetchData = async () => {
      const { status, data } = await axios.post('/api/characters/get_analytics', { charId: charId });
      if (status === 200) {
        setAnalytics(data);
      }
    };
    fetchData();
  }, []);

  const downloadTxtFile = () => {
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(analytics)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = "analytics.txt";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  }

  if (!analytics) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className='justify-center items-center'>
      <p className='text-primary text-xl font-bold mb-5'>Total token earned: {analytics.token_spend}💰</p>

        <div className="stats shadow  w-full mb-3">
          <div className="stat place-items-center">
            <div className="stat-title text-accent font-bold">Earned by Msg</div>
            <div className="stat-value text-accent">{analytics.token_spend_message}💰</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title ">Message Count</div>
            <div className="stat-value ">{analytics.message_count}</div>
          </div>
        </div>

        <div className="stats shadow w-full mb-3">
          <div className="stat place-items-center">
            <div className="stat-title text-accent font-bold">Earned by Img</div>
            <div className="stat-value text-accent">{analytics.token_spend_image}💰</div>
          </div>
          <div className="stat place-items-center">
            <div className="stat-title ">Image Count</div>
            <div className="stat-value">{analytics.image_count}</div>
          </div>
        </div>
        <div className='flex justify-center items-center'>
          <button onClick={downloadTxtFile} className='btn btn-primary mt-5'>Download Stats</button>
        </div>
      </div>
    </>
  )
}

export default CharacterModalActions;

