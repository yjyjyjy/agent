import { IoTabletLandscapeOutline, IoTabletPortraitOutline } from 'react-icons/io5'
import { BiSquare } from 'react-icons/bi'

export const sdCheckpoints = [
  { name: 'ReAL', filename: 'lofi_V2pre', nsfw: true },
  { name: 'RPG', filename: 'rpg_V4', nsfw: false },
  { name: 'Waifu', filename: 'meinamix_meinaV8', nsfw: true },
  { name: 'Deliberate', filename: 'deliberate_v2', nsfw: false },
  // { name: 'GTA5', filename: 'gta5ArtworkDiffusion_v1', nsfw: false },
]

export const aspectRatioList = [ // https://www.reddit.com/r/StableDiffusion/comments/y0pxtq/size_matters_comparison_chart_for_size_and_aspect/
  { name: 'portrait', label: 'Portrait (2:3)', width: 512, height: 768, icon: IoTabletPortraitOutline },
  { name: 'square', label: 'Square (1:1)', width: 512, height: 512, icon: BiSquare },
  { name: 'landscape', label: 'Landscape (3:2)', width: 768, height: 512, icon: IoTabletLandscapeOutline },
]

// export const minTokenAmount = 24
export const maxFreeGrantAmount = 16
export const coolDownHours = 2
export const freeGrantCoolDown = 1000 * 60 * 60 * coolDownHours

export const imageGenPresets = [
  { name: 'Add Detail', prompt: ', <lora:add_detail:1>', type: 'sfw' },//https://civitai.com/models/58390
  { name: 'LowRA', prompt: ', <lora:nwsj:0.7>, dark theme', type: 'sfw' },//https://civitai.com/models/48139?modelVersionId=63006
  { name: 'Arcane', prompt: ', <lora:arcane_offset:1>, arcane style', type: 'sfw' },
  { name: 'Mecha girl', prompt: ', <lora:mecha-girl:1>, mecha musume, mechanical arms, headgear, bodysuit', type: 'sfw' },
  { name: 'Mecha girl', prompt: ', <lora:mecha-girl:1>, mecha musume, mechanical arms, headgear, bodysuit', type: 'sfw' },
  { name: 'Mecha', prompt: ', <lora:mecha-girl:1>, mecha', type: 'sfw' },
  { name: 'OC', prompt: ', <lora:OC:1>, mecha', type: 'sfw' },
  // https://civitai.com/models/43227/oc

  { name: 'Saika', prompt: ', <lora:saika:0.8>, saika1', type: 'character' },
  { name: 'Nwsj', prompt: ', <lora:nwsj:0.7>, PerfectNwsjMajic', type: 'character' },
  { name: '2B', prompt: ', <lora:nwsj:0.7>, hm2b, black blindfold, covered eyes, mole under mouth, clothing cutout, long sleeves, puffy sleeves, juliet sleeves, feather trim, black thighhighs, black gloves, black dress, black skirt', type: 'character' },//https://civitai.com/models/27406/2b-yorha-no2-type-b-nier-automata
  { name: 'Belle Delphine', prompt: ', <lora:DI_belle_delphine_v1:1>', type: 'character' },
  // https://civitai.com/models/38290/belle-delphine
  { name: 'Yae Miko', prompt: ', <lora:YaeMiko_Test:1>', type: 'character' },
  // https://civitai.com/models/8484/yae-miko-or-realistic-genshin-lora

  { name: 'Blow Job (POV)', prompt: ', <lora:MS_Real_POV_Blowjob:1>, 1girl, penis, hetero, 1boy, fellatio, oral, solo focus, pov', type: 'nsfw' },
  { name: 'Doggy (POV)', prompt: ', <lora:POVDoggy:0.9>, 1boy, penis, doggystyle, from behind', type: 'nsfw' },
  { name: 'Squatting Cowgirl (POV)', prompt: ', <lora:PSCowgirl:0.9>, 1boy, penis, squatting cowgirl position, vaginal, pov', type: 'nsfw' },
  { name: 'Ahegao', prompt: ', <lora:ahegao:0.8>, ahegao, rolling_eyes', type: 'nsfw' },
  { name: 'All Four (POV)', prompt: ', <lora:AllFoursFromAboveV1:0.8>, all fours, top-down_bottom-up, from above, looking up', type: 'nsfw' },
  { name: 'Cum on Tongue (POV)', prompt: ', <lora:CumOnTongueMS:0.8>, cum in mouth, cum on tongue, tongue, open mouth, tongue out, cum on hands, cupping hands, own hands together', type: 'nsfw' },
  //https://civitai.com/models/16775/murkys-cum-on-tongue-lora
  { name: 'Upshirt', prompt: ', <lora:upshirt-000015:1>', type: 'nsfw' },
  //https://civitai.com/models/13224/upshirt-underboob-or-clothing-lora-713
  { name: 'after sex broken', prompt: ', <lora:afterSexBrokenDefeated_maximumTraining:0.8>', type: 'nsfw' },
  //https://civitai.com/models/52204/after-sex-broken-defeated-female-focus
  { name: 'after sex lying', prompt: ', <lora:AfterSexMS:1>, after sex, cum, lying, cumdrip, ass, on stomach, on back, fucked silly, sweat, cum pool, bukkake, trembling', type: 'nsfw' },
  //https://civitai.com/models/52204/after-sex-broken-defeated-female-focus
  { name: 'Standing Doggy (from front)', prompt: ', <lora:fixStandingDoggyStyle-000017:0.9>, from normal, 1girl,1boy,sex', type: 'nsfw' },
  { name: 'Standing Doggy (from front)', prompt: ', <lora:fixStandingDoggyStyle-000017:0.9>, from front, 1girl,1boy,sex', type: 'nsfw' },
  { name: 'Standing Doggy (from side)', prompt: ', <lora:fixStandingDoggyStyle-000017:0.9>, from side, 1girl,1boy,sex', type: 'nsfw' },
  { name: 'Standing Doggy (from behind)', prompt: ', <lora:fixStandingDoggyStyle-000017:0.9>, sex from behind,pov, 1girl,1boy,sex', type: 'nsfw' },
  //https://civitai.com/models/12682/standing-doggystyle
  { name: 'Spooning', prompt: ", <lora:Spooning Posititon:0.75>, spooningon, on side, spread legs, leg lift", type: 'nsfw' },
  //https://civitai.com/models/10353/jack-o-challenge-pose-lora-1-mb
  { name: 'Jack O Pose', prompt: ", <lora:afterSexBrokenDefeated_maximumTraining:0.8>, jack-o' challenge, flexible, spread legs, top-down bottom-up", type: 'nsfw' },
  //https://civitai.com/models/10353/jack-o-challenge-pose-lora-1-mb
]

export const createRegexFromPresetName = (name: string) => {
  // Escape the special characters
  const escapedPattern = name.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  const regexString = `<AD:${escapedPattern}:.*?>,`;
  const regex = new RegExp(regexString, "g");
  return regex
}