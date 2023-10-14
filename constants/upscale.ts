export const upscaleParams = {
  upscale: true,
  subseed_strength: 0,
  sampler_name: "DPM++ 2M Karras",
  denoising_strength: 0.25,
  steps: 20,
  batch_size: 1,
  restore_faces: false,
  index_of_first_image: 0,
  "extra_generation_params": {
    "Ultimate SD upscale upscaler": "4x-UltraSharp",
    "Ultimate SD upscale tile_width": 512,
    "Ultimate SD upscale tile_height": 512,
    "Ultimate SD upscale mask_blur": 8,
    "Ultimate SD upscale padding": 32,
    "ControlNet": "preprocessor: tile_resample, model: control_v11f1e_sd15_tile [a371b31b], weight: 1, starting/ending: (0, 1), resize mode: Just Resize, pixel perfect: False, control mode: ControlNet is more important, preprocessor params: (512, 1, 200)"
  },
  //script_name: "sd upscale",
  //script_args: ["None", 64, "Lanczos", 2],
  is_using_inpainting_conditioning: false,
}