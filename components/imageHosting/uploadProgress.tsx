import React from "react";

type Props = {
  progress: number;
};

const UploadProgress = ({ progress }: Props) => {
  return (
    <>
      <div className="flex w-96 justify-center ">
        <div className="progress_wrapper">
          <p className="label font-bold ">Uploading...</p>
          <div className="flex h-4 w-96 rounded bg-gray-200">
            <div
              className="h-full animate-pulse rounded bg-secondary"
              style={{ width: progress + "%" }}
            ></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadProgress;