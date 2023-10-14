import mixpanel from 'mixpanel-browser';
mixpanel.init(process.env.NEXT_PUBLIC_MIXPANEL_PROJECT_TOKEN, {
  debug: true,
  ignore_dnt: true,
  track_pageview: true
});

export const Mixpanel = mixpanel
export enum MixpanelEvents {
  'Login' = 'Login',
  'Interact' = 'Interact',
  'API Response' = 'API Response',
  'Chat' = 'Chat'
}

// let env_check = process.env.NODE_ENV === 'production';

// let actions = {
//   identify: (id) => {
//     if (env_check) mixpanel.identify(id);
//   },
//   alias: (id) => {
//     if (env_check) mixpanel.alias(id);
//   },
//   track: (name, props) => {
//     if (env_check) mixpanel.track(name, props);
//   },
//   people: {
//     set: (props) => {
//       if (env_check) mixpanel.people.set(props);
//     },
//   },
// };

// export let Mixpanel = actions;