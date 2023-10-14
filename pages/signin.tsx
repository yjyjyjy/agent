import { useEffect, useState } from "react";
import { AiFillGoogleCircle, AiFillMail } from "react-icons/ai";
import { FcGoogle } from "react-icons/fc";
import { createClient } from '@supabase/supabase-js';
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useToasts } from "react-toast-notifications";
import { useRouter } from "next/router";
import axios from "axios";


const SignIn = () => {
  const router = useRouter()

  const supabase = createClientComponentClient();

  const [loginWithEmailState, setLoginWithEmailState] = useState(false);
  const [forgotPasswordState, setForgotPasswordState] = useState(false);
  const [hasEmailState, setHasEmailState] = useState(null);
  const [embeddedView, setEmbeddedView] = useState(false);


  function emailSignup(): void {
    setLoginWithEmailState(true);
  }

  const { addToast } = useToasts()

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { charID } = router.query;
  const { creatorSignUp } = router.query;

  useEffect(() => {
    pushBackIfLoggedIn()

  }, [])

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          if (charID != null) {
            router.push(`/${charID}`);
          } else {
            router.push(`/`);
          }
        }
      }
    );



    // Cleanup listener on component unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };

  }, [charID, creatorSignUp, router, supabase.auth]);



  async function pushBackIfLoggedIn() {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id
    if (userId) {
      router.push(`/account`)
    }
  }

  async function continueWithGoogle() {
    if (navigator.userAgent.match(/(Instagram|Facebook|Line|Twitter|Pinterest|Snapchat)/i)) {
      setEmbeddedView(true)
    } else {
      var redirectToURL = `${window.location.origin}/`;
      if (charID != null) {
        redirectToURL = `${window.location.origin}/${charID}`;
      } else if (creatorSignUp != null) {
        redirectToURL = `${window.location.origin}/creatorSignup`;
      }

      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${redirectToURL}` } });

      if (error) {
        addToast(error.message, { appearance: 'error', autoDismiss: true });
      }
    }

  }

  async function emailLogin() {



    const {
      data: { user },
      error,
    } = await supabase
      .auth
      .signInWithPassword({ email, password })
    if (error == null) {
      addToast("Login Successful", { appearance: 'success', autoDismiss: true })
      if (charID != null) {
        router.push(`/${charID}`)
      } else if (creatorSignUp != null) {
        router.push(`/creatorSignup`)
      } else {
        router.push(`/`)
      }
    } else {
      addToast(error.message, { appearance: 'error', autoDismiss: true })
    }
  }

  async function SigningUp() {
    var redirectToURL = `${window.location.origin}/`;
    if (charID != null) {
      redirectToURL = `${window.location.origin}/${charID}`;
    } else if (creatorSignUp != null) {
      redirectToURL = `${window.location.origin}/creatorSignup`;
    }
    const {
      data: { user },
      error,
    } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        emailRedirectTo: redirectToURL // you will have to make the project part dynamic in whichever way the framework you are using allows you to do this.
      }
    });

    if (error == null) {
      addToast("Signup Successful, Please Confirm it in your Email", { appearance: 'success', autoDismiss: true })
      setLoginWithEmailState(false);
    } else {
      addToast(error.message, { appearance: 'error', autoDismiss: true })
    }
  }

  async function forgotPasswordCallback() {
    const {
      error,
    } =
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
    if (error == null) {
      addToast("Password Reset Email Sent", { appearance: 'success', autoDismiss: true })
    } else {
      addToast(error.message, { appearance: 'error', autoDismiss: true })
    }

  }

  async function continueWithEmail(): Promise<void> {
    // Regular expression for email validation
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (emailRegex.test(email)) {
      console.log("Before Axios call, email:", email);
      const response = await axios.post('/api/auth/checkIfEmailExist', { email: email });
      console.log("After Axios call, response:", response);
      //@ts-ignore
      if (response.data.dataLength == 0) {

        setHasEmailState(false);
        console.log("After Axios call, hasEmailState:", hasEmailState);
      } else {
        const response = await axios.post('/api/auth/checkProvider', { email: email });
        console.log("After Axios call, response:", response);
        //@ts-ignore
        if (response.data.data.length != 0 && response.data.data[0].provider == 'email') {
          setHasEmailState(true);
        } else {
          addToast('Your account was registered using Google Sign On. Please use "Continue with Google Option"', { appearance: 'error', autoDismiss: true })
        }

      }
    } else {
      addToast("Please enter a valid email address", { appearance: 'error', autoDismiss: true });
    }
  }

  const url = typeof window !== 'undefined' ? window.location.href : '';

  const handleCopyClick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      addToast('URL copied to clipboard', { autoDismiss: true, appearance: 'success' }); // You can replace this with a nicer UI
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };


  return (embeddedView == true ?
    <div className="relative bg-base-100 overflow-hidden">
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold">Please Use a Browser 😊</h1>
            <p className="py-6">Login with Google is not Supported inside another app. Copy the URL below and open it in a browser</p>
            <div className="flex flex-col items-center">
              <input type="text" value={url} readOnly className="input input-bordered input-primary w-full max-w-xs mb-5" />
              <button className="btn btn-primary" onClick={handleCopyClick}>Copy URL</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    :
    <div>
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content flex-col lg:flex-row-reverse">
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-bold">Yuzu.fan</h1>
            <p className="py-6">Interact with thousands of virtual influencers</p>
          </div>
          <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
            <div className="card-body">
              <div className="flex flex-col w-full border-opacity-50">
                <div className="form-control mb-6">
                  <button className="btn btn-primary" onClick={() => continueWithGoogle()}><FcGoogle />Continue With Google </button>
                </div>
                {/* <div className="form-control mb-6">
                  <button className="btn btn-primary" onClick={() => continueWithSocial('discord')}><BsDiscord />Continue With Discord </button>
                </div> */}

                <div className="divider">OR</div>
                {forgotPasswordState == false ? <>
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input type="email" placeholder="email" className="input input-bordered" onChange={e => setEmail(e.target.value)} />

                  {hasEmailState == null ? <div className="flex flex-col">

                    <div className="form-control mt-6">
                      <button className="btn btn-primary" onClick={continueWithEmail}> <AiFillMail /> Continue with Email</button>
                    </div>

                  </div> : hasEmailState == true ? <><div className="form-control">
                    <label className="label">
                      <span className="label-text">Password</span>
                    </label>
                    <input type="password" placeholder="password" className="input input-bordered" onChange={e => setPassword(e.target.value)} />
                    <label className="label">
                      <a href="#" className="label-text-alt link link-hover" onClick={() => { setForgotPasswordState(true) }}>Forgot password?</a>
                    </label>
                  </div>
                    <div className="form-control mt-6">
                      <button className="btn btn-primary" onClick={emailLogin}> <AiFillMail /> Sign in with Email</button>
                    </div>
                  </> : <div className="card flex-shrink-0 w-full max-w-sm shadow-2xl bg-base-100">
                    <div className="flex flex-col w-full border-opacity-50">


                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Create a Password</span>
                        </label>
                        <input type="password" placeholder="password" className="input input-bordered" onChange={e => setPassword(e.target.value)} />

                      </div>

                      <div className="form-control mt-6">
                        <button className="btn btn-primary" onClick={SigningUp}> Sign Up</button>
                      </div>

                    </div>
                  </div>
                  }
                </> : <div className="card flex-shrink-0 w-full max-w-sm bg-base-100">

                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input type="text" placeholder="email" className="input input-bordered" onChange={e => setEmail(e.target.value)} />

                  <div className="form-control mt-6">
                    <button className="btn btn-primary" onClick={forgotPasswordCallback}> Reset Via Email</button>
                  </div>
                  <div className="form-control mt-2 mb-2">
                    <button className="btn btn-tertiary" onClick={() => { setForgotPasswordState(false) }}>Back</button>
                  </div>
                </div>}
              </div>
            </div>
          </div>
        </div>

      </div>


    </div>
  );
};

export default SignIn;