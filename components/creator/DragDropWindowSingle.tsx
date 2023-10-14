import React, { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { AiOutlineFileImage } from "react-icons/ai";

const DragDropWindowSingle = ({ title, fileFormat, image, setImage, setFile, dropButtonText = "Click or Drag Here 1 Image" }) => {

  const onDrop = useCallback((acceptedFiles) => {
    // Upload files to storage
    acceptedFiles.forEach((file) => {
      setFile({ imageFile: file });
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(URL.createObjectURL(file));
      };
      reader.readAsDataURL(file);
    });
  }, [setImage]);
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    //@ts-ignore
    accept: "image/*",
    maxFiles: 1,
    noClick: true,
    noKeyboard: true,
    onDrop,
  });

  return (
    <div className="hero max-h-96 ">
      <div className="hero-content text-center">
        <figure>
          {image == null ? <AiOutlineFileImage className="w-32 h-32" /> : <img className="max-h-48" alt="preview image" src={image} />}
        </figure>
        <div className="dropzone mt-10">

          <div className="w-full flex-row flex bordered max-w-xs">

            <div >
              <h2 className="card-title mb-2">{title}</h2>

              <div {...getRootProps()} className="drag_drop_wrapper">
                <input hidden {...getInputProps()} />
                <div className="flex flex-row items-center justify-center">
                  {!image && <button onClick={open} className={"dropzone_button btn w-full btn-accent"}>
                    {
                      isDragActive ?
                        "Drop it like it's hot!" :
                        dropButtonText
                    }
                  </button>}
                  {image && <div className="btn w-full btn-outline" onClick={() => {
                    setImage(null)
                  }}>Clear</div>}
                </div>

              </div>
              <label className="label mt-2">
                <span className="label-text-alt">{fileFormat}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>)
}
export default DragDropWindowSingle;
