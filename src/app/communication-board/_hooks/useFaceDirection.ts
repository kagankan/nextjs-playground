import { RefObject, useCallback, useEffect, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

export const useDetector = (videoRef: RefObject<HTMLVideoElement>) => {
  const [detector, setDetector] =
    useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const setupCamera = async (): Promise<HTMLVideoElement> => {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      return new Promise((resolve) => {
        if (videoRef.current) {
          videoRef.current.onloadedmetadata = () => {
            resolve(videoRef.current as HTMLVideoElement);
          };
        }
      });
    };

    const loadFaceMesh =
      async (): Promise<faceLandmarksDetection.FaceLandmarksDetector> => {
        const model = faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
        const detectorConfig: faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig =
          {
            runtime: "mediapipe",
            solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh",
            // solutionPath: "node_modules/@mediapipe/face_mesh", // 失敗した
            refineLandmarks: true,
          };
        return faceLandmarksDetection.createDetector(model, detectorConfig);
      };

    const init = async (): Promise<void> => {
      await setupCamera();
      if (videoRef.current) {
        videoRef.current.play();
      }

      const detectorInstance = await loadFaceMesh();
      setDetector(detectorInstance);
    };

    init();
  }, [videoRef]);

  const pause = useCallback(() => {
    stream?.getTracks().forEach((track) => {
      track.enabled = false;
    });
  }, [stream]);

  const resume = useCallback(() => {
    stream?.getTracks().forEach((track) => {
      track.enabled = true;
    });
  }, [stream]);

  return { detector, pause, resume };
};
