import { useEffect, useState, createContext, useContext } from 'react';
import {
  useUser as useSupaUser,
  useSessionContext,
  User
} from '@supabase/auth-helpers-react';
import { UserDetails } from 'types';
// import { Subscription } from 'types';
import axios from 'axios';

type UserContextType = {
  accessToken: string | null;
  user: User | null;
  userDetails: UserDetails | null;
  isLoading: boolean;
  // subscription: Subscription | null;
  tokenBalance: Map<string, number> | null;
  setTokenBalance: (balance: Map<string, number>) => void;
  getTokenBalance: () => void;
  // bannedReason: string | null;
};

export const UserContext = createContext<UserContextType | undefined>(
  undefined
);

export interface Props {
  [propName: string]: any;
}

export const MyUserContextProvider = (props: Props) => {

  const {
    session,
    isLoading: isLoadingUser,
    supabaseClient: supabase
  } = useSessionContext();
  const user = useSupaUser();
  const accessToken = session?.access_token ?? null;
  const [isLoadingData, setIsloadingData] = useState(false);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  // const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [tokenBalance, setTokenBalance] = useState<Map<string, number> | null>(null);
  // const [nextRefreshTsEpoch, setNextRefreshTsEpoch] = useState<number | null>(null);
  // const [bannedReason, setBannedReason] = useState<string>(null);
  const getTokenBalance = async () => {
    const { data: tokenBalance } = await axios.get('/api/auth/token_balance')
    setTokenBalance(tokenBalance)
  }
  const getUserDetails = () => supabase.from('users').select('*').single();
  // const getSubscription = () =>
  //   supabase
  //     .from('subscriptions')
  //     .select('*, prices(*, products(*))')
  //     .in('status', ['trialing', 'active'])
  //     .single();

  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN') {
      console.log('🔴 Signed_in')
      // @ts-ignore
      setUserDetails(session.user_metadata);
      // @ts-ignore
      // setSubscription(session.subscription);
    }
  })

  useEffect(() => {
    if (user && !isLoadingData && !userDetails
      // && !subscription
    ) {
      setIsloadingData(true);
      Promise.allSettled([getUserDetails()
        // , getSubscription()
      ]).then(
        (results) => {
          const userDetailsPromise = results[0];
          // const subscriptionPromise = results[1];
          // const tokenPromise = results[2];

          if (userDetailsPromise.status === 'fulfilled')
            // @ts-ignore
            setUserDetails(userDetailsPromise.value.data);

          // if (subscriptionPromise.status === 'fulfilled')
          //   // @ts-ignore
          //   setSubscription(subscriptionPromise.value.data);
          setIsloadingData(false);
        }
      );
      getTokenBalance()
    } else if (!user && !isLoadingUser && !isLoadingData) {
      setUserDetails(null);
      // setSubscription(null);
    }
  }, [user, isLoadingUser]);

  const value = {
    accessToken,
    user,
    userDetails,
    isLoading: isLoadingUser || isLoadingData,
    // subscription,
    tokenBalance,
    setTokenBalance,
    getTokenBalance,
    // nextRefreshTsEpoch,
    // setNextRefreshTsEpoch,
    // bannedReason,
  };

  return <UserContext.Provider value={value} {...props} />;
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error(`useUser must be used within a MyUserContextProvider.`);
  }
  return context;
};
