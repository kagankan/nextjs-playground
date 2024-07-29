"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import * as faceLandmarksDetection from "@tensorflow-models/face-landmarks-detection";

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

const FaceDirectionDetector: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceData, setFaceData] = useState<string>(
    "Face data will appear here"
  );
  const [detector, setDetector] =
    useState<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [currentAngle, setCurrentAngle] = useState<number | null>(null);
  const [leftCalibration, setLeftCalibration] = useState<number>(90 - 30);
  const [rightCalibration, setRightCalibration] = useState<number>(90 + 30);

  useEffect(() => {
    const setupCamera = async (): Promise<HTMLVideoElement> => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
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
  }, []);

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

  const calculateFaceAngle = (keypoints: Keypoint[]): FaceAngleData => {
    const leftEye = keypoints[33];
    const rightEye = keypoints[263];
    const nose = keypoints[1];

    const eyesMidpoint = {
      x: (leftEye.x + rightEye.x) / 2,
      y: (leftEye.y + rightEye.y) / 2,
    };

    const angleRad = Math.atan2(
      nose.y - eyesMidpoint.y,
      nose.x - eyesMidpoint.x
    );
    let angleDeg = angleRad * (180 / Math.PI);

    if (angleDeg < -180) angleDeg += 360;
    if (angleDeg > 180) angleDeg -= 360;

    return { angleDeg, leftEye, rightEye, nose };
  };

  const getFaceDirection = useCallback(
    (angle: number): string => {
      const range = rightCalibration - leftCalibration;
      const percentage = (angle - leftCalibration) / range;
      const percentageClamped = Math.min(1, Math.max(0, percentage));

      const threshold = 0.2;
      if (percentage < threshold) return "Left";
      if (percentage > 1 - threshold) return "Right";
      return "Center";
    },
    [leftCalibration, rightCalibration]
  );

  const renderPrediction = useCallback(async (): Promise<void> => {
    if (!canvasRef.current || !videoRef.current || !detector) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const predictions = await detector.estimateFaces(videoRef.current, {
      flipHorizontal: false,
      // predictIrises: true,
    });

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.width,
      videoRef.current.height
    );

    if (predictions.length > 0) {
      predictions.forEach((prediction) => {
        const keypoints = prediction.keypoints;

        for (let i = 0; i < keypoints.length; i++) {
          const x = keypoints[i].x;
          const y = keypoints[i].y;

          ctx.fillStyle = "white";
          ctx.strokeStyle = "black";
          ctx.lineWidth = 1;
          drawPoint(ctx, y, x, 2);
        }

        const {
          angleDeg: faceAngle,
          leftEye,
          rightEye,
          nose,
        } = calculateFaceAngle(keypoints);
        setCurrentAngle(faceAngle);

        ctx.fillStyle = "red";
        drawPoint(ctx, leftEye.y, leftEye.x, 4);
        drawPoint(ctx, rightEye.y, rightEye.x, 4);
        drawPoint(ctx, nose.y, nose.x, 4);

        const faceDirection = getFaceDirection(faceAngle);

        setFaceData(
          `Face Angle: ${faceAngle.toFixed(0)}°, Direction: ${faceDirection}`
        );
      });
    } else {
      setFaceData("No face detected");
    }

    requestAnimationFrame(renderPrediction);
  }, [detector, getFaceDirection]);

  useEffect(() => {
    if (detector) {
      renderPrediction();
    }
  }, [detector, renderPrediction]);

  return (
    <div>
      <h1>Face Direction and Mouth Detection</h1>
      <div style={{ position: "relative", width: "640px", margin: "0 auto" }}>
        <video
          ref={videoRef}
          width={640}
          height={480}
          autoPlay
          muted
          playsInline
          style={{ transform: "scaleX(-1)" }}
        />
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            transform: "scaleX(-1)",
          }}
        />
      </div>
      <div style={{ fontSize: "18px", marginTop: "20px" }}>{faceData}</div>
      <button onClick={() => setLeftCalibration(currentAngle || 0)}>
        Calibrate Left
      </button>
      <button onClick={() => setRightCalibration(currentAngle || 0)}>
        Calibrate Right
      </button>
      <div
        style={{ width: "100%", height: "20px", backgroundColor: "lightgray" }}
      >
        <div
          style={{
            width: `${
              currentAngle
                ? ((currentAngle - leftCalibration) /
                    (rightCalibration - leftCalibration)) *
                  100
                : 0
            }%`,
            height: "100%",
            backgroundColor: "green",
          }}
        />
      </div>
    </div>
  );
};

export default FaceDirectionDetector;
