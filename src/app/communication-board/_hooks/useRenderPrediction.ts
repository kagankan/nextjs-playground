import {
  Ref,
  RefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

const drawPoint = (
  ctx: CanvasRenderingContext2D,
  y: number,
  x: number,
  r: number
): void => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, 2 * Math.PI);
  ctx.fill();
};

const calculatePredictions = async (
  detector: faceLandmarksDetection.FaceLandmarksDetector,
  videoRef: RefObject<HTMLVideoElement>
) => {
  if (!videoRef.current) {
    throw new Error("Video element not found");
  }

  const predictions = await detector.estimateFaces(videoRef.current, {
    flipHorizontal: false,
  });

  return predictions;
};

const INDEX_LEFT_EYE = 33;
const INDEX_RIGHT_EYE = 263;
const INDEX_NOSE = 1;

interface Keypoint {
  x: number;
  y: number;
  z?: number;
}

interface FaceAngleData {
  angleDeg: number;
  leftEye: Keypoint;
  rightEye: Keypoint;
  nose: Keypoint;
}

export const useRenderPrediction = (
  detector: faceLandmarksDetection.FaceLandmarksDetector | null,
  videoRef: RefObject<HTMLVideoElement>,
  canvasRef: RefObject<HTMLCanvasElement>,
  onChangeKeypoints: (keypoints: Keypoint[]) => void
) => {
  const requestIdRef = useRef<number | null>(null);

  const renderPrediction = useCallback(async (): Promise<void> => {
    if (!canvasRef.current || !videoRef.current || !detector) return;

    const ctx = canvasRef.current.getContext("2d");
    // if (!ctx) return;

    const predictions = await calculatePredictions(detector, videoRef);

    ctx?.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.width,
      videoRef.current.height
    );

    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.keypoints;

        keypoints.forEach((keypoint) => {
          const x = keypoint.x;
          const y = keypoint.y;

          if (ctx) {
            ctx.fillStyle = "white";
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            drawPoint(ctx, y, x, 2);
          }
        });

        if (ctx) {
          const leftEye = keypoints[INDEX_LEFT_EYE];
          const rightEye = keypoints[INDEX_RIGHT_EYE];
          const nose = keypoints[INDEX_NOSE];
          ctx.fillStyle = "red";
          drawPoint(ctx, leftEye.y, leftEye.x, 4);
          drawPoint(ctx, rightEye.y, rightEye.x, 4);
          drawPoint(ctx, nose.y, nose.x, 4);
        }

        onChangeKeypoints(keypoints);
      });
    } else {
      onChangeKeypoints([]);
    }

    requestIdRef.current = requestAnimationFrame(renderPrediction);
  }, [canvasRef, detector, onChangeKeypoints, videoRef]);

  useEffect(() => {
    if (detector) {
      requestIdRef.current = requestAnimationFrame(renderPrediction);
      return () => {
        if (requestIdRef.current) {
          cancelAnimationFrame(requestIdRef.current);
        }
      };
    }
  }, [detector, renderPrediction]);

  return renderPrediction;
};
