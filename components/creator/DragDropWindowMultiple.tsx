import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AiOutlineFileImage } from "react-icons/ai";

const DragDropWindowMultiple = ({ fileFormat, maxFiles, images, setImages, setFiles, upload, dropButtonText = "Click or Drag Here to Upload" }) => {

  const onDrop = useCallback((acceptedFiles) => {
    // Upload files to storage
    acceptedFiles.forEach((file) => {
      setFiles((prevState) => [...prevState, { imageFile: file }]);
      const reader = new FileReader();
      reader.onload = (event) => {
        // Create a new image object
        const img = new window.Image();  // Use window.Image if Image gives you trouble
        img.src = event.target?.result as string;

        img.onload = () => {
          const newItem = {
            src: img.src,
            width: img.width,
            height: img.height,
          };
          // Update the state
          setImages((prevState) => [...prevState, newItem]);
        };
      };
      reader.readAsDataURL(file);
    });

  }, [setImages, setFiles]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    //@ts-ignore
    accept: "image/*",
    maxFiles: maxFiles,
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  return <div className="dropzone mt-10">

    <div className="w-full flex-row flex bordered max-w-xs">
      <div >
        <div {...getRootProps()} className="drag_drop_wrapper">
          <input hidden {...getInputProps()} />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center justify-center">
              <button onClick={open} className={images.length != 0 ? "dropzone_button btn ml-5 w-1/2 btn-accent btn-sm" : "dropzone_button btn w-full btn-accent"}>
                {
                  isDragActive ?
                    "Drop them like they are hot!" :
                    images.length == 0 ? dropButtonText : "Add More"
                }
              </button>
              {images.length != 0 && <div className="btn btn-sm w-1/2 ml-5 btn-outline" onClick={() => {
                setImages([])
                setFiles([])
              }}>Clear</div>
              }
            </div>
            {!!images && Array.isArray(images) && images.length > 0 && <button className="btn btn-accent" onClick={upload}>Upload</button>}
          </div>

        </div>
        <label className="label mt-2">
          <span className="label-text-alt">{fileFormat}</span>
        </label>

      </div>


    </div>
  </div>
}
export default DragDropWindowMultiple;
