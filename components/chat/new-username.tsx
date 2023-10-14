import axios from "axios";
import { useState } from "react";
import { Mixpanel, MixpanelEvents } from 'lib/mixpanel';

export default function NewUserName(charName: string) {
    const [username, setUsername] = useState('');

    const handleInputChange = (event) => {
        const inputValue = event.target.value;
        // Check if input value is the same as character name
        if (inputValue === charName) {
            addToast('Username cannot be the same as your character name', { appearance: 'error', autoDismiss: true })
            return;
        }

        // Check if the value is one word and has less than 20 characters
        if (!inputValue.includes(' ') && inputValue.length <= 20) {
            setUsername(inputValue);
        }
    };

    const handleConfirm = async () => {
        Mixpanel.track(MixpanelEvents['Interact'], {
            action: 'confirmUsername',
            path: '/chat',
        })
        let input = { user_name: username }

        const { status } = await axios.put('/api/users/profile', { ...input })
        if (status != 200) {
            addToast('Username Update Failed', { appearance: 'error', autoDismiss: true })
        } else {
            //refresh page
            window.location.reload();
        }
    }

    return (
        <div>
            <div className="hero min-h-screen">
                <div className="hero-content flex-col lg:flex-row-reverse">
                    <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base">
                        <div className="card-body">
                            <div className="flex flex-col w-full border-opacity-50">
                                <h1 className="text-2xl font-bold">What should we call you?</h1>
                                <div className="form-control">
                                    <label className="label">
                                        <span className="label-text">Max 20 Char, No spaces</span>
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="username"
                                        className="input input-bordered"
                                        value={username}
                                        onChange={handleInputChange}
                                    />
                                    <div className="form-control mt-2">
                                        <button className="btn btn-primary" onClick={handleConfirm}>Confirm</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
function addToast(arg0: string, arg1: { appearance: string; autoDismiss: boolean; }) {
    throw new Error("Function not implemented.");
}

