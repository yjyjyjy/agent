import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuid } from "uuid";

import { useRouter } from 'next/router'
import classNames from 'classnames';
import { useToasts } from 'react-toast-notifications'
import { useUser } from '@/utils/useUser';
import axios from 'axios';

function Character() {
  const [character, setCharacter] = useState({
    id: '',
    name: null,
    gender: '',
    age: 23,
    description: '',
    rule: '',
    greeting: '',
    start_dialogue: [{ '<user>': '', '<character>': '' }, { '<user>': '', '<character>': '' }],
    appearance: '',
    model_name: '',
  })
  const { addToast } = useToasts()
  const [focusedSection, setFocusedSection] = useState('design')
  const modelMapping = {
    'Realistic': 'ReAL',
    'Anime': 'Waifu',
  }
  const router = useRouter();
  const [imageGenModel, setImageGenModel] = useState();
  const [prompt, setPrompt] = useState('');
  const [anyDreamImageURL, setAnyDreamImageURL] = useState();
  const [initCfURL, setinitCfURL] = useState('');
  const [charLoading, setCharLoading] = useState(false);
  const { user, tokenBalance, getTokenBalance } = useUser()
  const [modalOpen, setModalOpen] = useState(false)
  const submitButtonRef = useRef(null)
  // console.log('router.query.data', router.query.data)


  useEffect(() => {
    async function fetchCharacter() {
      if (router.query.data) {
        const initialCharacterId = JSON.parse(router.query.data)
        console.log('initialCharacterId', initialCharacterId.char_id)
        // read for the character data
        const { status: charStatus, data: charData } = await axios.post('/api/chat/get_character',
          {
            char_id: initialCharacterId.char_id
          });
        if (charStatus === 200) {
          setCharacter({
            id: charData.id || '',
            name: charData.name || null,
            gender: charData.character_config.gender || '',
            age: charData.character_config.age || 23,
            description: charData.description || '',
            rule: charData.character_config.rule || '',
            greeting: charData.character_config.greeting || '',
            start_dialogue: charData.character_config.start_dialogue || [
              { '<user>': '', '<character>': '' },
              { '<user>': '', '<character>': '' },
            ],
            appearance: charData.character_config.appearance || '',
            model_name: charData.character_config.model_name || '',
          });
          setAnyDreamImageURL(charData.image_url)
          setinitCfURL(charData.image_url)
        }
      }
    }
    fetchCharacter();
  }, [router.query.data])

  const handleImageGen = async (prompt) => {
    if (!prompt || !imageGenModel || prompt.length < 10) {
      addToast('Please provide a prompt and choose a model', { appearance: 'error', autoDismiss: true })
      return;
    }

    try {
      // TODO what should the behavior be when the user has no balance?
      if (tokenBalance.freeImgToken < 1 && tokenBalance.paidToken < 10) {
        addToast('Not enough tokens to generate image', { appearance: 'error', autoDismiss: true })
        return;
      }
      setCharLoading(true)
      console.log('triger anydream api')
      const { status, data } = await axios.post(
        '/api/anyDreamAPI', {
        prompt: prompt,
        model: modelMapping[imageGenModel]
      }
      )
      console.log(status, data)
      setCharLoading(false)
      if (status === 200 && data.url) {
        setAnyDreamImageURL(data.url);
        // charge for image and update balance
        await axios.get('/api/auth/charge_image')
        getTokenBalance()
        submitButtonRef.current.scrollIntoView({ behavior: 'smooth' })
      } else {
        throw new Error('Failed to Generate Image');
      }
    } catch (error) {
      setCharLoading(false)
      addToast('Failed to Generate Image', { appearance: 'error', autoDismiss: true })
      console.log('Failed to Generate Image', error);
    }
  }

  const handleCharFormSubmit = async (character) => {

    // if (!modelName || !prompt || !anyDreamImageURL) {
    //     setError({
    //         modelName: !modelName,
    //         prompt: !prompt,
    //         anyDreamImageURL: !anyDreamImageURL,
    //     });
    //     return; // Don't proceed if any of the inputs are empty
    // } else {
    //     setError({ modelName: false, prompt: false, anyDreamImageURL: false });
    // }
    const { id, name, description } = character
    let error = null
    if (!name || name.length === 0) { error = 'Character need a name' }
    if (!description || description.length <= 20) { error = 'Character need a longer description' }
    if (!character.start_dialogue || !Array.isArray(character.start_dialogue) || character.start_dialogue.length < 2) { error = 'Please provide more starter dialogues to set the tone' }
    if (!character.appearance || character.appearance.length <= 20) { error = 'Please provide a longer appearance description' }
    if (!anyDreamImageURL || anyDreamImageURL.length < 10) { error = 'Please make a profile image' }
    if (error) {
      addToast(error, { appearance: 'error', autoDismiss: true })
      return
    }
    // check if we need to generate a new cdn url
    let cfURL = initCfURL
    if (anyDreamImageURL !== initCfURL) {
      // upload to cloudflare
      const cfRsp = await fetch('/api/images/cloudFlareCDN', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: anyDreamImageURL }),
      });
      if (!cfRsp.ok) { throw new Error('Failed to upload image to cloudflare') }
      const cfData = await cfRsp.json()
      cfURL = cfData.url
      console.log(cfURL)
    }

    const config = { ...character }
    delete config.id
    delete config.name
    delete config.description

    if (!character.id || character.id === '') {
      character.id = uuid()
    }

    const payload = {
      id: character.id,
      name,
      description,
      created_by: user.id,
      character_config: config,
      image_url: cfURL
    }

    console.log('🔥 payload', payload)
    try {
      const response = await fetch("/api/characters/", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        addToast('Character Editing Success', { appearance: 'success', autoDismiss: true })
        router.push('/' + character.name)
      } else {
        addToast('Character Editing Failed', { appearance: 'error', autoDismiss: true })
        throw new Error('Failed to Submit Character Form');
      }
    } catch (error) {
      console.log('Failed to Process Submit Character Form');
    }

  }

  return (
    <div className='flex flex-col'>
      <div className="fixed top-0 left-0 w-screen h-screen bg-base z-0" />

      <div className="join join-vertical w-full">

        {/* 🌳 Design Character */}

        <div className={classNames("collapse collapse-arrow join-item")} onClick={() => { if (focusedSection !== 'design') { setFocusedSection('design') } }}>
          <input type="radio" name="my-accordion-4" checked={focusedSection === 'design'} readOnly />
          <div className="collapse-title text-xl font-medium text-teal-200">
            Design character
          </div>
          <div className="collapse-content">
            {/* name */}
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">What is the name?</span>
              </label>
              <input type="text" placeholder="Name here" className="input input-bordered w-full max-w-xs" value={character.name} onChange={(e) => setCharacter({ ...character, name: e.target.value })} />
            </div>

            {/* gender age */}
            <div className="form-control w-full max-w-xs">
              <label className="label">
                <span className="label-text">Gender & Age</span>
              </label>
              <div className='flex items-center'>

                <div className="dropdown dropdown-hover">
                  <label tabIndex={0} className="btn m-1">{character.gender || 'Gender'}</label>
                  <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                    {['male', 'female', 'non-binary'].map(g => {
                      return (
                        <li key={g} >
                          <a onClick={() => {
                            setCharacter({ ...character, gender: g })
                            const elem = document.activeElement;
                            if (elem) {
                              elem?.blur();
                            }
                          }}>{g}</a>
                        </li>)
                    }
                    )}
                  </ul>
                </div>
                <div className="form-control ml-5">
                  <div className="relative w-40">
                    <button
                      className="absolute left-0 top-0 rounded-r-none btn btn-square"
                      onClick={() => setCharacter({ ...character, age: character.age > 18 ? character.age - 1 : 18 })}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      className="w-full text-center px-12 input input-bordered"
                      value={character.age}
                      onChange={(e) => setCharacter({ ...character, age: Math.max(Number(e.target.value), 18) })}
                    />
                    <button
                      className="absolute right-0 top-0 rounded-l-none btn btn-square"
                      onClick={() => setCharacter({ ...character, age: character.age + 1 })}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Character description</span>
                <span className="label-text-alt">200 words or less</span>
              </label>
              <textarea className="textarea textarea-bordered h-24" placeholder={'Mark is a robotic humanoid with supercomputer intelligence...'} onChange={(e) => setCharacter({ ...character, description: e.target.value })} value={character.description} />
            </div>

            {/* rule */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Rules to follow (optional)</span>
                <span className="label-text-alt">200 words or less</span>
              </label>
              <textarea className="textarea textarea-bordered h-24" placeholder="The rules that the character should follow. e.g. As a robot, mark will never harm humans..." onChange={(e) => setCharacter({ ...character, rule: e.target.value })} value={character.rule} />
            </div>

            {/* preview */}
            <label className="label">
              <span className="label-text">Preview</span>
            </label>
            <div className='border rounded py-2 px-3'>
              {character.name} is {character.age} years old {character.gender}, who is {character.description}. {character.rule && character.rule.length > 0 && `The rules ${character.name} should follow are ${character.rule}`}
            </div>

            {/* section submit */}
            <div className='flex justify-center mt-3'>
              <button className='btn btn-accent'
                onClick={() => {
                  setFocusedSection('tone')
                }}
              >Character Looks Good</button>
            </div>
          </div>
        </div>

        {/* 🌳 Set tone */}
        <div className={classNames("collapse collapse-arrow join-item")} onClick={() => { if (focusedSection !== 'tone') { setFocusedSection('tone') } }}>
          <input type="radio" name="my-accordion-4" checked={focusedSection === 'tone'} readOnly />
          <div className="collapse-title text-xl font-medium text-teal-200">
            Set Character Tone
          </div>

          <div className="collapse-content">
            {/* Dialogue example */}
            <div className='text-lg'>
              Dialogues examples
            </div>
            <label className="label">
              <span className="label-text">Provide at least 2 dialogue examples that AI can learn from:</span>
            </label>
            {
              character.start_dialogue?.map((d, i) => {
                return (
                  <div className="form-control my-3 " key={i}>
                    <label className="label">
                      <span className="label-text">{'User'}</span>
                      <button className='btn btn-accent btn-xs' onClick={() => setCharacter({
                        ...character,
                        start_dialogue: character.start_dialogue.filter((_, index) => index !== i)
                      })}> remove</button>
                    </label>
                    <textarea className="textarea textarea-bordered h-18" placeholder="if the user says..."
                      onChange={(e) => {
                        const newStartDialogue = [...character.start_dialogue]
                        newStartDialogue[i]['<user>'] = e.target.value
                        setCharacter({ ...character, start_dialogue: newStartDialogue })
                      }
                      } value={d['<user>']} />
                    <label className="label">
                      <span className="label-text">{character.name || 'Your Character'}</span>
                    </label>
                    <textarea className="textarea textarea-bordered h-18" placeholder={`${character.name || 'your character'} should say...`}
                      onChange={(e) => {
                        const newStartDialogue = [...character.start_dialogue]
                        newStartDialogue[i]['<character>'] = e.target.value
                        setCharacter({ ...character, start_dialogue: newStartDialogue })
                      }}
                      value={d['<character>']} />
                  </div>
                )
              })
            }
            <div className='pb-4 flex justify-end'>
              <button className="btn btn-accent btn-xs"
                onClick={() => {
                  setCharacter({ ...character, start_dialogue: [...character.start_dialogue, { '<user>': '', '<character>': '' }] })
                }}>Add Dialogue</button>
            </div>
            {/* Greetings */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Greeting ({character.name || 'your character'} will say this to all new users)</span>
              </label>
              <textarea className="textarea textarea-bordered h-12" placeholder="Default: Hello!" onChange={(e) => setCharacter({ ...character, greeting: e.target.value })} value={character.greeting} />
            </div>

            {/* section submit */}
            <div className='flex justify-center mt-3'>
              <button className='btn btn-accent'
                onClick={() => {
                  setFocusedSection('image')
                }}
              >Tone is set</button>
            </div>

          </div>
        </div>

        {/* 🌳 Set image */}
        <div className={classNames("collapse collapse-arrow join-item")} onClick={() => { if (focusedSection !== 'image') { setFocusedSection('image') } }}>
          <input type="radio" name="my-accordion-4" checked={focusedSection === 'image'} readOnly />
          <div className="collapse-title text-xl font-medium text-teal-200">
            Set Look
          </div>

          <div className="collapse-content">
            {/* choose model*/}
            <label className="label">
              <span className="label-text">Choose the image style</span>
            </label>
            <div className="dropdown dropdown-bottom">
              <label tabIndex={0} className="btn m-1">{imageGenModel || `Choose Image Model`} </label>
              <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                {Object.keys(modelMapping).map(m => {
                  return (
                    <li key={m} >
                      <a onClick={() => {
                        setImageGenModel(m)
                        setCharacter({ ...character, model_name: modelMapping[m] })
                        const elem = document.activeElement;
                        if (elem) {
                          elem?.blur();
                        }
                      }}>{m}</a>
                    </li>)
                })}
              </ul>
            </div>

            {/* description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text">Appearance description</span>
                <span className="label-text-alt">Describe DETAILS!</span>
              </label>
              <textarea className="textarea textarea-bordered h-36" placeholder={'a 20 year old brunette woman with athletic body'} onChange={(e) => setCharacter({ ...character, appearance: e.target.value })} value={character.appearance} />
            </div>

            {/* Test */}
            <div className='flex justify-center mt-3'>
              <button className='btn btn-accent btn-sm'
                onClick={async () => {
                  await handleImageGen(character.appearance)
                }
                }
                disabled={charLoading}
              >Generate</button>
            </div>
            <div className='w-full flex justify-center items-center'>
              <div className='max-w-lg p-5'>
                {charLoading ?
                  <div className='w-48 h-36 flex justify-center align-center border border-yellow-200'>
                    <span className="loading loading-dots text-accent loading-md"></span>
                  </div>
                  :
                  <div className='w-full border border-yellow-200' style={{ minWidth: '200px', borderRadius: '20px' }}>
                    {anyDreamImageURL ? <img src={anyDreamImageURL} className='w-full max-w-lg' /> : <div className='h-48 w-full'></div>}
                  </div>
                }
              </div>
            </div>



            {/* section submit */}
            <div className='flex justify-center mt-3'>
              <button className='btn btn-primary'
                onClick={async () => {
                  // setFocusedSection('image')
                  await handleCharFormSubmit(character)
                }}
                ref={submitButtonRef}
              >Done</button>
            </div>

          </div>
        </div>
      </div>

    </div>
  )

}

export default Character;
